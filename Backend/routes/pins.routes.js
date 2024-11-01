const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const checkApiKey = require("../apiKeyCheck");

router.use(checkApiKey);

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Pins Route",
    routes: {
      "/all": "Get all pins with associated profile data",
      "/:id": "Get pins by user ID",
      "/:id": "Create a new pin",
      "/:id/:pinid": "Update a pin by User ID and Pin ID",
      "/:id/:pinid": "Delete a pin by User ID and Pin ID",
    },
  });
});

// Get all pins with associated profile data
router.get("/all", async (req, res) => {
  try {
    const { data: pins, error } = await supabase
      .from("pins")
      .select(
        `*
        ,
        profile:profile_id (
          id,
          name,
          avatar
        )
      `
      )
      .eq("status", "public");

    if (error) {
      console.error("Error fetching public pins:", error);
      return res.status(500).json({ error: "Error fetching public pins" });
    }

    res.status(200).json(pins);
  } catch (error) {
    console.error("Error during fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get pins by user ID
router.get("/:id", async (req, res) => {
  const userID = req.params.id;

  try {
    const { data: pins, error } = await supabase
      .from("pins")
      .select(
        `*
        ,
        profile:profile_id (
          id,
          name,
          avatar
        )
      `
      )
      .eq("profile_id", userID);

    if (error) {
      console.error("Error fetching pins for user ID:", error);
      return res.status(500).json({ error: "Error fetching pins for user" });
    }

    res.status(200).json(pins);
  } catch (error) {
    console.error("Error during fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new pin
router.post("/:id", async (req, res) => {
  const profile_id = req.params.id;
  const {
    title,
    description,
    location,
    longitude,
    latitude,
    imgurls,
    groups,
    status,
  } = req.body;

  if (
    !profile_id ||
    !title ||
    !description ||
    !location ||
    !longitude ||
    !latitude ||
    !imgurls
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided" });
  }

  const pinData = {
    profile_id,
    title,
    description,
    location,
    longitude,
    latitude,
    imgurls,
  };

  pinData.status = status === true ? "public" : "private";

  if (groups) {
    pinData.groups = groups;
  }

  try {
    const { error: pinError } = await supabase.from("pins").insert([pinData]);

    if (pinError) {
      console.error("Error creating pin:", pinError);
      return res.status(500).json({ error: "Error creating pin" });
    }

    res.status(201).json({ message: "Pin created successfully" });
  } catch (error) {
    console.error("Error during pin creation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a pin by User ID and Pin ID
router.put("/:id/:pinid", async (req, res) => {
  const userID = req.params.id;
  const pinID = req.params.pinid;
  const {
    title,
    description,
    location,
    longitude,
    latitude,
    imgurls,
    groups,
    status,
  } = req.body;

  const updatedFields = {};
  if (title) updatedFields.title = title;
  if (description) updatedFields.description = description;
  if (location) updatedFields.location = location;
  if (longitude) updatedFields.longitude = longitude;
  if (latitude) updatedFields.latitude = latitude;
  if (imgurls) updatedFields.imgurls = imgurls;
  if (groups) updatedFields.groups = groups;
  if (status) updatedFields.status = status === true ? "public" : "private";

  try {
    const { data: pin, error: pinCheckError } = await supabase
      .from("pins")
      .select("profile_id")
      .eq("id", pinID)
      .single();

    if (pinCheckError || !pin) {
      return res.status(404).json({ error: "Pin not found" });
    }

    if (pin.profile_id !== userID) {
      return res.status(403).json({ error: "Unauthorized to update this pin" });
    }

    // Update the pin in the database
    const { error: updateError } = await supabase
      .from("pins")
      .update(updatedFields)
      .eq("id", pinID);

    if (updateError) {
      console.error("Error updating pin:", updateError);
      return res.status(500).json({ error: "Error updating pin" });
    }

    res.status(200).json({ message: "Pin updated successfully" });
  } catch (error) {
    console.error("Error during pin update:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a pin by User ID and Pin ID
router.delete("/:id/:pinid", async (req, res) => {
  const userID = req.params.id;
  const pinID = req.params.pinid;

  try {
    const { data: pin, error: pinCheckError } = await supabase
      .from("pins")
      .select("profile_id")
      .eq("id", pinID)
      .single();

    if (pinCheckError || !pin) {
      return res.status(404).json({ error: "Pin not found" });
    }

    if (pin.profile_id !== userID) {
      return res.status(403).json({ error: "Unauthorized to delete this pin" });
    }

    const { error: deleteError } = await supabase
      .from("pins")
      .delete()
      .eq("id", pinID);

    if (deleteError) {
      console.error("Error deleting pin:", deleteError);
      return res.status(500).json({ error: "Error deleting pin" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error during pin deletion:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
