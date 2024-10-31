const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");


// Helper function to compress notification IDs into the desired format
const compressNotificationIDs = (ids) => {
  if (ids.length === 0) return [];

  const sortedIds = [...new Set(ids)].sort((a, b) => a - b);
  const compressed = [];
  let start = sortedIds[0];
  let end = sortedIds[0];

  for (let i = 1; i < sortedIds.length; i++) {
    if (sortedIds[i] === end + 1) {
      end = sortedIds[i];
    } else {
      compressed.push(start === end ? `${start}` : `${start}-${end}`);
      start = sortedIds[i];
      end = sortedIds[i];
    }
  }
  compressed.push(start === end ? `${start}` : `${start}-${end}`);
  return compressed;
};


// Helper function to remove the notification ID from the user's notifications
const removeNotificationID = (currentNotifications, idToRemove) => {
  const notifications = currentNotifications.flatMap((item) => {
    if (item.includes('-')) {
      const [start, end] = item.split('-').map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return [Number(item)];
  });

  // Remove the specified ID and filter out NaN values
  const updatedNotifications = notifications.filter((id) => id !== idToRemove);

  // Create a new array to hold the compressed ranges
  const compressedNotifications = compressNotificationIDs(updatedNotifications);

  return compressedNotifications; // Return compressed ranges
};


// Function to add a new notification ID to the user's new_notifications array
const addNotificationID = (currentNotifications, newID) => {
  const notifications = currentNotifications.length
    ? currentNotifications.flatMap((item) => {
      if (item.includes('-')) {
        const [start, end] = item.split('-').map(Number);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      return [Number(item)];
    })
    : [];

  notifications.push(Number(newID)); // Add the new notification ID to the list

  // Remove NaN values if any exist and filter duplicates
  const uniqueNotifications = [...new Set(notifications.filter(id => !isNaN(id)))].sort((a, b) => a - b);

  return compressNotificationIDs(uniqueNotifications); // Return the compressed array of notifications
};


// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Notification Route",
    routes: {
      "/all": "Get all news articles",
      "/:id": "Get a specific news article by ID",
      "/create": "Create a new news article",
      "/edit/:id": "Update a news article by ID",
      "/delete/:id": "Delete a news article by ID",
      "/read/:id": "Mark a news article as read"
    }
  });
});


// Get all news articles
router.get("/all", async (req, res) => {
  try {
    const { data: newsArticles, error } = await supabase
      .from("news")
      .select("*")
      .order("date", { ascending: false }); // Order by date, newest first

    if (error) {
      throw error; // Throw error if any occurs
    }

    res.json(newsArticles); // Send the news articles as a JSON response
  } catch (error) {
    console.error("Error fetching news articles:", error);
    res.status(500).send("Error fetching news articles");
  }
});


// Get a specific news article by ID
router.get("/:id", async (req, res) => {
  const articleID = req.params.id;

  try {
    const { data: newsArticle, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", articleID)
      .single();

    if (error) {
      throw error; // Throw error if any occurs
    }

    if (!newsArticle) {
      return res.status(404).send("News article not found");
    }

    res.json(newsArticle); // Send the news article as a JSON response
  } catch (error) {
    console.error("Error fetching news article:", error);
    res.status(500).send("Error fetching news article");
  }
});


// Create a new news article
router.post("/create", async (req, res) => {
  const { title, text } = req.body; // Destructure the request body

  // Basic validation
  if (!title || !text) {
    return res.status(400).send("Missing required fields: title or text");
  }

  try {
    // Insert a new article and retrieve the inserted record
    const { data: newArticle, error } = await supabase
      .from("news")
      .insert([{ title, text }])
      .select('*') // Ensure we select all fields to return the inserted record
      .single(); // Return the newly created record

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    // Get the ID of the new article
    const newID = newArticle.id; // Assuming the created news object has an ID property

    // Fetch all profiles to update their notifications
    const { data: profiles, error: profileError } = await supabase
      .from("profile")
      .select("id, new_notifications");

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      return res.status(500).send("Error updating notifications");
    }

    // Update notifications for all profiles
    for (const profile of profiles) {
      const currentNotifications = profile.new_notifications || []; // Get current notifications
      const updatedNotifications = addNotificationID(currentNotifications, newID); // Update the notifications

      // Update each profile with the new notifications
      const { error: updateError } = await supabase
        .from("profile")
        .update({ new_notifications: updatedNotifications })
        .eq("id", profile.id); // Update using the correct identifier

      if (updateError) {
        console.error("Error updating profile notifications:", updateError);
      }
    }

    // Send the created article as a response
    res.status(201).json(newArticle);
  } catch (error) {
    console.error("Error creating news article:", error);
    res.status(500).send("Error creating news article");
  }
});


// Update a news article by ID
router.put("/edit/:id", async (req, res) => {
  const articleID = req.params.id;
  const { title, text } = req.body; // Removed date as it's handled by the DB

  // Ensure at least one field is provided for update
  if (!title && !text) {
    return res.status(400).send("No fields provided to update");
  }

  // Prepare the update object
  const updateObject = {};
  if (title) updateObject.title = title;
  if (text) updateObject.text = text;

  try {
    const { data: updatedArticle, error } = await supabase
      .from("news")
      .update(updateObject) // Only updates fields provided in the request body
      .eq("id", articleID)
      .single();

    if (error) {
      throw error; // Throw error if any occurs
    }

    if (!updatedArticle) {
      return res.status(404).send("News article not found");
    }

    res.json(updatedArticle); // Send the updated article as a response
  } catch (error) {
    console.error("Error updating news article:", error);
    res.status(500).send("Error updating news article");
  }
});


// Delete a news article by ID and remove its ID from all user notifications
router.delete("/delete/:id", async (req, res) => {
  const articleID = req.params.id; // Get the article ID from the URL parameters

  try {
    // Step 1: Fetch the article to check if it exists
    const { data: existingArticle, error: fetchError } = await supabase
      .from("news")
      .select("*")
      .eq("id", articleID)
      .single();

    if (fetchError) {
      console.error("Error fetching article:", fetchError);
      return res.status(500).send("Error checking if article exists");
    }

    if (!existingArticle) {
      return res.status(404).send("News article not found"); // Article does not exist
    }

    // Step 2: Delete the article from the news table
    const { error: deleteError } = await supabase
      .from("news")
      .delete()
      .eq("id", articleID);

    if (deleteError) {
      console.error("Error deleting article:", deleteError);
      return res.status(500).send("Error deleting news article");
    }

    // Step 3: Fetch all user profiles to update their notifications
    const { data: profiles, error: profileError } = await supabase
      .from("profile")
      .select("id, new_notifications");

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      return res.status(500).send("Error fetching profiles");
    }

    // Step 4: Remove the article ID from each user's notifications
    for (const profile of profiles) {
      const currentNotifications = profile.new_notifications || []; // Get current notifications
      const updatedNotifications = removeNotificationID(currentNotifications, Number(articleID)); // Remove the deleted article ID

      // Update the profile with the new notifications
      const { error: updateError } = await supabase
        .from("profile")
        .update({ new_notifications: updatedNotifications })
        .eq("id", profile.id); // Update using the correct identifier

      if (updateError) {
        console.error("Error updating profile notifications:", updateError);
      }
    }

    // Step 5: Send success response
    res.status(204).send(); // Successfully deleted with no content
  } catch (error) {
    console.error("Error during delete operation:", error);
    res.status(500).send("Error deleting news article");
  }
});


// Mark a news article as read
router.post("/read/:id", async (req, res) => {
  const userId = req.params.id; // Get user ID from URL params
  const { articleId } = req.body; // Get article ID from the request body

  // Validate input
  if (!articleId) {
    return res.status(400).send("Missing article ID");
  }

  try {
    // Fetch the user's current notifications
    const { data: profile, error: fetchError } = await supabase
      .from("profile")
      .select("new_notifications")
      .eq("id", userId) // Use id field for profiles
      .single();

    if (fetchError || !profile) {
      console.error("Error fetching profile:", fetchError);
      return res.status(404).send("User profile not found");
    }

    const currentNotifications = profile.new_notifications || []; // Get current notifications

    // Remove the article ID from notifications
    const updatedNotifications = removeNotificationID(currentNotifications, Number(articleId)); // Ensure articleId is a number

    // Update the user's profile with the new notifications
    const { error: updateError } = await supabase
      .from("profile")
      .update({ new_notifications: updatedNotifications })
      .eq("id", userId); // Update using the correct user ID

    if (updateError) {
      console.error("Error updating profile notifications:", updateError);
      return res.status(500).send("Error updating notifications");
    }

    res.status(200).json({ message: "Notification marked as read", updatedNotifications });
  } catch (error) {
    console.error("Error marking article as read:", error);
    res.status(500).send("Error marking article as read");
  }
});

module.exports = router;
