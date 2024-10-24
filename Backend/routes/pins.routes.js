const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Import the Supabase client

// Define your routes here
router.get("/", (req, res) => {
  res.send("Pins Route");
});

// Get all pins
router.get("/all", (req, res) => {
  res.send("Get all pins");
});

// Get pins by user ID
router.get("/:id", (req, res) => {
  res.send("Get pins by user ID");
});

module.exports = router;
