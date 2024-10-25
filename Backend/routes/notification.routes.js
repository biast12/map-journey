const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Import the Supabase client

// Get all news articles
router.get("/all", async (req, res) => {
  try {
    const { data: newsArticles, error } = await supabase
      .from("news")
      .select("*") // Fetch all columns from the news table
      .order("date", { ascending: false }); // Order by date, newest first

    if (error) {
      throw error; // Handle the error if one occurred
    }

    res.json(newsArticles); // Send the news articles as a JSON response
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).send("Error fetching news articles"); // Send a 500 error response
  }
});

// Get a specific news article by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  try {
    const { data: newsArticle, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", id) // Filter by the ID
      .single(); // Get a single article

    if (error) {
      throw error; // Handle the error if one occurred
    }

    if (!newsArticle) {
      return res.status(404).send("News article not found"); // Handle case where article does not exist
    }

    res.json(newsArticle); // Send the news article as a JSON response
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).send("Error fetching news article"); // Send a 500 error response
  }
});

module.exports = router;
