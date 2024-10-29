const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// Root route
router.get("/", (req, res) => {
  res.send("Settings Route");
});

// Get a user's settings by User ID
router.get("/:id", (req, res) => {
  const userID = req.params.id;
  res.send(`Got the settings for user with ID: ${userID}`);
});

// Update a user's settings by User ID (Add security)
router.put("/:id", (req, res) => {
  const userID = req.params.id;
  res.send(`Updated the settings for user with ID: ${userID}`);
});

module.exports = router;
