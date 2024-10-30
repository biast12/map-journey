const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// Root route
router.get("/", (req, res) => {
  res.send("Notification Route");
});

// Get all news articles
router.get("/all", async (req, res) => {
  try {
    const { data: newsArticles, error } = await supabase
      .from("news")
      .select("*")
      .order("date", { ascending: false }); // Order by date, newest first

    if (error) {
      throw error;
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
      throw error;
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
    // Insert a new article without the date
    const { data: newArticle, error } = await supabase
      .from("news")
      .insert([{ title, text }])
      .select('*') // Ensure we select all fields to return the inserted record
      .single(); // Return the newly created record

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
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
      throw error;
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

// Delete a news article by ID
router.delete("/delete/:id", async (req, res) => {
  const articleID = req.params.id;

  try {
    const { data: deletedArticle, error } = await supabase
      .from("news")
      .delete()
      .eq("id", articleID)
      .single();

    if (error) {
      throw error;
    }

    if (!deletedArticle) {
      return res.status(404).send("News article not found");
    }

    res.status(204).send(); // Successfully deleted with no content
  } catch (error) {
    console.error("Error deleting news article:", error);
    res.status(500).send("Error deleting news article");
  }
});

module.exports = router;