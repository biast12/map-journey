// settings route
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const checkApiKey = require("../utils/apiKeyCheck");

router.use(checkApiKey);

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Settings Route",
    routes: {
      "/:id": "Get a user's settings by Settings ID",
      "/:id": "Update a user's settings by Settings ID",
    },
  });
});

// Get a user's settings by Settings ID
router.get("/:id", async (req, res) => {
  const settingsID = req.params.id;

  try {
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("id", settingsID)
      .single();

    if (settingsError) {
      console.error("Error fetching user settings:", settingsError);
      return res.status(500).json({ error: "Error fetching user settings" });
    }

    if (!settings) {
      return res.status(404).json({ error: "Settings not found for user" });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error during fetching settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a user's settings by Settings ID
router.put("/:id", async (req, res) => {
  const settingsID = req.params.id;
  const { maptheme, language, notification } = req.body;

  if (
    maptheme === undefined &&
    language === undefined &&
    notification === undefined
  ) {
    return res
      .status(400)
      .json({ error: "At least one field must be provided for update" });
  }

  try {
    const updatedFields = {};
    if (maptheme !== undefined) updatedFields.maptheme = maptheme;
    if (language !== undefined) updatedFields.language = language;
    if (notification !== undefined) updatedFields.notification = notification;

    const { error: updateError } = await supabase
      .from("settings")
      .update(updatedFields)
      .eq("id", settingsID);

    if (updateError) {
      console.error("Error updating user settings:", updateError);
      return res.status(500).json({ error: "Error updating user settings" });
    }

    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error during updating settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
