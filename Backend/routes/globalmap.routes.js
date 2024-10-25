const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Import the Supabase client

// Define your routes here
router.get("/", (req, res) => {
  res.send("Global Map Route");
});

module.exports = router;
