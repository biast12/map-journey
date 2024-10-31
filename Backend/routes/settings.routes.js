const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");


// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Settings Route",
    routes: {
      "/:id": "Get a user's settings by User ID",
      "/edit/:id": "Update a user's settings by User ID"
    }
  });
});


// Get a user's settings by User ID
router.get("/:id", async (req, res) => {
  const userID = req.params.id; // Get the user ID from the request parameters

  try {
    // Query the settings table using the user ID
    const { data: settings, error } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", userID) // Assuming you have a user_id column in the settings table
      .single(); // Get a single record

    // Handle any potential errors from the query
    if (error) {
      console.error("Error fetching user settings:", error);
      return res.status(500).json({ error: "Error fetching user settings" });
    }

    // Check if settings exist
    if (!settings) {
      return res.status(404).json({ error: "Settings not found for user" });
    }

    // Return the user's settings
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error during fetching settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Update a user's settings by User ID
router.put("/edit/:id", async (req, res) => {
  const userID = req.params.id; // Get the user ID from the request parameters
  const { maptheme, language, notification } = req.body; // Extract settings fields from request body

  // Validate required fields
  if (maptheme === undefined && language === undefined && notification === undefined) {
    return res.status(400).json({ error: "At least one field must be provided for update" });
  }

  // Create an object to hold updated fields
  const updatedFields = {};
  if (maptheme !== undefined) updatedFields.maptheme = maptheme;
  if (language !== undefined) updatedFields.language = language;
  if (notification !== undefined) updatedFields.notification = notification;

  try {
    // Update the settings in the database
    const { error } = await supabase
      .from("settings")
      .update(updatedFields)
      .eq("user_id", userID); // Assuming you have a user_id column in the settings table

    // Handle any potential errors from the update
    if (error) {
      console.error("Error updating user settings:", error);
      return res.status(500).json({ error: "Error updating user settings" });
    }

    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error during updating settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
