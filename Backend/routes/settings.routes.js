// settings route
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const checkApiKey = require("../utils/apiKeyCheck");
const checkUserRole = require("../utils/checkUserRole");

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

// Get a user's settings by user ID
router.get("/:id", checkUserRole("user"), async (req, res) => {
  const id = req.params.id;

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("settings_id")
      .eq("id", id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return res.status(500).json({ error: "Error fetching user profile" });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const settingsID = profile.settings_id;

    const { data: userSettings, error: userSettingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("id", settingsID)
      .single();

    if (userSettingsError) {
      console.error("Error fetching user settings:", userSettingsError);
      return res.status(500).json({ error: "Error fetching user settings" });
    }

    if (!userSettings) {
      return res.status(404).json({ error: "Settings not found for user" });
    }

    res.status(200).json(userSettings);
  } catch (error) {
    console.error("Error during fetching settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a user's settings by user ID
router.put("/:id", checkUserRole("user"), async (req, res) => {
  const id = req.params.id;
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
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("status, settings_id")
      .eq("id", id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return res.status(500).json({ error: "Error fetching user profile" });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (profile.status === "banned") {
      return res
        .status(403)
        .json({ error: "You are banned and cannot update settings." });
    }

    let settingsID = profile.settings_id;

    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("id", settingsID)
      .single();

    if (settingsError && settingsError.code !== "PGRST116") {
      console.error("Error fetching settings directly:", settingsError);
      return res
        .status(500)
        .json({ error: "Error fetching settings directly" });
    }

    if (!settings) {
      return res.status(404).json({ error: "Settings not found for user" });
    }

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
