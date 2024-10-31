const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");


// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Pins Route",
    routes: {
      "/all": "Get all pins with associated profile data",
      "/:id": "Get pins by user ID",
      "/create/:id": "Create a new pin",
      "/edit/:id/:pinid": "Update a pin by User ID and Pin ID",
      "/delete/:id/:pinid": "Delete a pin by User ID and Pin ID"
    }
  });
});


// Get all pins with associated profile data
router.get("/all", async (req, res) => {
  try {
    // Query the 'pins' table, joining the 'profile' table on profile_id
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

    // Handle any potential errors from the query
    if (error) {
      console.error("Error fetching public pins:", error);
      return res.status(500).json({ error: "Error fetching public pins" });
    }

    // Return the list of public pins with profile data
    res.status(200).json(pins);
  } catch (error) {
    console.error("Error during fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Get pins by user ID
router.get("/:id", async (req, res) => {
  const userID = req.params.id; // This is expected to be a UUID

  try {
    // Query the 'pins' table, joining the 'profile' table on profile_id
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
      .eq("profile_id", userID); // Filter pins by the specified user ID

    // Handle any potential errors from the query
    if (error) {
      console.error("Error fetching pins for user ID:", error);
      return res.status(500).json({ error: "Error fetching pins for user" });
    }

    // Return the list of pins for the specified user
    res.status(200).json(pins);
  } catch (error) {
    console.error("Error during fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Create a new pin
router.post("/create/:id", async (req, res) => {
  const profile_id = req.params.id; // Get profile_id from URL params
  const {
    title,
    description,
    location,
    longitude,
    latitude,
    imgurls,
    groups, // Optional field
    status, // Optional field, expected to be a boolean
  } = req.body;

  // Validate required input fields
  if (
    !profile_id || // profile_id is now obtained from params, no need to check it here
    !title ||
    !description ||
    !location ||
    !longitude ||
    !latitude ||
    !imgurls
  ) {
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  // Prepare the data to insert
  const pinData = {
    profile_id, // Ensure this is a UUID from the URL
    title,
    description,
    location,
    longitude,
    latitude,
    imgurls,
  };

  // Set status based on boolean value, defaulting to "private" if not provided
  pinData.status = status === true ? "public" : "private";

  // Include groups if provided by the user
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
router.put("/edit/:id/:pinid", async (req, res) => {
  const userID = req.params.id; // User ID from the request
  const pinID = req.params.pinid; // Pin ID from the request

  // Fields to update
  const {
    title,
    description,
    location,
    longitude,
    latitude,
    imgurls,
    groups, // Optional field
    status, // Optional field
  } = req.body;

  // Create an object to hold the updated fields
  const updatedFields = {};
  if (title) updatedFields.title = title;
  if (description) updatedFields.description = description;
  if (location) updatedFields.location = location;
  if (longitude) updatedFields.longitude = longitude;
  if (latitude) updatedFields.latitude = latitude;
  if (imgurls) updatedFields.imgurls = imgurls;
  if (groups) updatedFields.groups = groups;
  if (status) updatedFields.status = status === true ? "public" : "private"; // Ensure status is set correctly

  try {
    // Check if the pin belongs to the user
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
router.delete("/delete/:id/:pinid", async (req, res) => {
  const userID = req.params.id; // User ID from the request
  const pinID = req.params.pinid; // Pin ID from the request

  try {
    // Check if the pin belongs to the user
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

    // Delete the pin from the database
    const { error: deleteError } = await supabase
      .from("pins")
      .delete()
      .eq("id", pinID);

    if (deleteError) {
      console.error("Error deleting pin:", deleteError);
      return res.status(500).json({ error: "Error deleting pin" });
    }

    res.status(204).send(); // Successfully deleted with no content
  } catch (error) {
    console.error("Error during pin deletion:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;