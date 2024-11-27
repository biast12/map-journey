const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const checkApiKey = require("../utils/apiKeyCheck");

router.use(checkApiKey);

// Helper function to compress notification IDs into the desired format
const compressNotificationIDs = (ids) => {
  if (!ids || ids.length === 0) return [];

  const sortedIds = [...new Set(ids.map(Number))].sort((a, b) => a - b);
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
  const notifications = (currentNotifications || []).flatMap((item) => {
    if (item.includes("-")) {
      const [start, end] = item.split("-").map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return [Number(item)];
  });

  const updatedNotifications = notifications.filter((id) => id !== Number(idToRemove));
  return compressNotificationIDs(updatedNotifications);
};

// Function to add a new notification ID to the user's new_notifications array
const addNotificationID = (currentNotifications, newID) => {
  const notifications = (currentNotifications || []).flatMap((item) => {
    if (item.includes("-")) {
      const [start, end] = item.split("-").map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return [Number(item)];
  });

  notifications.push(Number(newID));
  const uniqueNotifications = [...new Set(notifications)].sort((a, b) => a - b);
  return compressNotificationIDs(uniqueNotifications);
};

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Notification Route",
    routes: {
      "/all": "Get all news articles",
      "/:id": "Get a specific news article by ID",
      "/": "Create a new news article",
      "/:id": "Update a news article by ID",
      "/:id": "Delete a news article by ID",
      "/:id": "Mark a news article as read",
      "/readall/:id": "Mark all notifications as read",
    },
  });
});

// Get all news articles
router.get("/all", async (req, res) => {
  try {
    const { data: newsArticles, error } = await supabase
      .from("news")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    res.json(newsArticles);
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
      throw error;
    }

    if (!newsArticle) {
      return res.status(404).send("News article not found");
    }

    res.json(newsArticle);
  } catch (error) {
    console.error("Error fetching news article:", error);
    res.status(500).send("Error fetching news article");
  }
});

// Create a new news article
router.post("/", async (req, res) => {
  const { title, text } = req.body;

  if (!title || !text) {
    return res.status(400).send("Missing required fields: title or text");
  }

  try {
    const { data: newArticle, error } = await supabase
      .from("news")
      .insert([{ title, text }])
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    const newID = newArticle.id;

    const { data: profiles, error: profileError } = await supabase
      .from("profile")
      .select("id, new_notifications, news_count");

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      return res.status(500).send("Error updating notifications");
    }

    for (const profile of profiles) {
      const currentNotifications = profile.new_notifications || [];
      const updatedNotifications = addNotificationID(
        currentNotifications,
        newID
      );

      const updatedNewsCount = (profile.news_count || 0) + 1;

      const { error: updateError } = await supabase
        .from("profile")
        .update({
          new_notifications: updatedNotifications,
          news_count: updatedNewsCount,
        })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Error updating profile notifications:", updateError);
      }
    }

    res.status(201).json(newArticle);
  } catch (error) {
    console.error("Error creating news article:", error);
    res.status(500).send("Error creating news article");
  }
});

// Update a news article by ID
router.put("/:id", async (req, res) => {
  const articleID = req.params.id;
  const { title, text } = req.body;

  if (!title && !text) {
    return res.status(400).send("No fields provided to update");
  }

  const updateObject = {};
  if (title) updateObject.title = title;
  if (text) updateObject.text = text;

  try {
    const { data: updatedArticle, error } = await supabase
      .from("news")
      .update(updateObject)
      .eq("id", articleID)
      .single();

    if (error) {
      throw error;
    }

    if (!updatedArticle) {
      return res.status(404).send("News article not found");
    }

    res.json(updatedArticle);
  } catch (error) {
    console.error("Error updating news article:", error);
    res.status(500).send("Error updating news article");
  }
});

// Delete a news article by ID and remove its ID from all user notifications
router.delete("/:id", async (req, res) => {
  const articleID = Number(req.params.id);

  try {
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
      return res.status(404).send("News article not found");
    }

    const { error: deleteError } = await supabase
      .from("news")
      .delete()
      .eq("id", articleID);

    if (deleteError) {
      console.error("Error deleting article:", deleteError);
      return res.status(500).send("Error deleting news article");
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profile")
      .select("id, new_notifications, news_count");

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      return res.status(500).send("Error fetching profiles");
    }

    for (const profile of profiles) {
      const currentNotifications = profile.new_notifications || [];
      const notificationsBeforeRemoval = [...currentNotifications];
      const updatedNotifications = removeNotificationID(
        currentNotifications,
        articleID
      );

      if (
        notificationsBeforeRemoval.length !== updatedNotifications.length ||
        notificationsBeforeRemoval.some(
          (item, index) => item !== updatedNotifications[index]
        )
      ) {
        const updatedNewsCount = Math.max((profile.news_count || 0) - 1, 0);

        const { error: updateError } = await supabase
          .from("profile")
          .update({
            new_notifications: updatedNotifications,
            news_count: updatedNewsCount,
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error(
            "Error updating profile notifications and news_count:",
            updateError
          );
        }
      }
    }

    res.status(204).send("News Deleted!");
  } catch (error) {
    console.error("Error during delete operation:", error);
    res.status(500).send("Error deleting news article");
  }
});

// Mark a news article as read
router.post("/:id", async (req, res) => {
  const userId = req.params.id;
  const { articleId } = req.body;

  if (!articleId) {
    return res.status(400).send("Missing article ID");
  }

  try {
    const { data: profile, error: fetchError } = await supabase
      .from("profile")
      .select("new_notifications, news_count")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      console.error("Error fetching profile:", fetchError);
      return res.status(404).send("User profile not found");
    }

    const currentNotifications = profile.new_notifications || [];

    const updatedNotifications = removeNotificationID(
      currentNotifications,
      Number(articleId)
    );
    const updatedNewsCount = Math.max((profile.news_count || 0) - 1, 0); // Ensure news_count is not negative

    const { error: updateError } = await supabase
      .from("profile")
      .update({
        new_notifications: updatedNotifications,
        news_count: updatedNewsCount,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile notifications:", updateError);
      return res.status(500).send("Error updating notifications");
    }

    res
      .status(200)
      .json({ message: "Notification marked as read", updatedNotifications });
  } catch (error) {
    console.error("Error marking article as read:", error);
    res.status(500).send("Error marking article as read");
  }
});

// Mark all notifications as read
router.post("/readall/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { data: profile, error: fetchError } = await supabase
      .from("profile")
      .select("new_notifications, news_count")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      console.error("Error fetching profile:", fetchError);
      return res.status(404).send("User profile not found");
    }

    const updatedNotifications = [];
    const updatedNewsCount = 0;

    const { error: updateError } = await supabase
      .from("profile")
      .update({
        new_notifications: updatedNotifications,
        news_count: updatedNewsCount,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile notifications:", updateError);
      return res.status(500).send("Error updating notifications");
    }

    res.status(200).json({
      message: "All notifications marked as read",
      updatedNotifications,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).send("Error marking all notifications as read");
  }
});

module.exports = router;
