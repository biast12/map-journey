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
      .select("*") // Fetch all columns from the news table
      .order("date", { ascending: false }); // Order by date, newest first

    if (error) {
      throw error;
    }

    res.json(newsArticles); // Send the news articles as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching news articles"); // Send a 500 error response
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
      return res.status(404).send("News article not found"); // Handle case where article does not exist
    }

    res.json(newsArticle); // Send the news article as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching news article");
  }
});

// Create a new news article (Add security)
router.post("/", async (req, res) => {
  res.send("Create a new news article");
});

// Update a news article by ID (Add security)
router.put("/:id", (req, res) => {
  const articleID = req.params.id;
  res.send(`Updated the article with ID: ${articleID}`);
});

// Delete a pin by User ID and Pin ID (Add security)
router.delete("/:id/:pinid", (req, res) => {
  const articleID = req.params.id;
  res.send(`Deletes the article with ID: ${articleID}`);
});

module.exports = router;
