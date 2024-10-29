const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// Root route
router.get("/", (req, res) => {
  res.send("Pins Route");
});

// Get all pins with associated profile data
router.get("/all", async (req, res) => {
  try {
    // Query the 'pins' table, joining the 'profile' table on profile_id
    const { data: pins, error } = await supabase
      .from("pins")
      .select(
        `
        *,
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
  const userID = req.params.id;

  try {
    // Query the 'pins' table, joining the 'profile' table on profile_id
    const { data: pins, error } = await supabase
      .from("pins")
      .select(
        `
        *,
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
router.post("/", async (req, res) => {
  const {
    profile_id,
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

  // Prepare the data to insert
  const pinData = {
    profile_id,
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

// Update a pin by User ID and Pin ID (Add security)
router.put("/:id/:pinid", (req, res) => {
  const userID = req.params.id;
  const pinID = req.params.pinid;
  res.send(`Updates user with ID: ${userID} and ${pinID}`);
});

// Delete a pin by User ID and Pin ID (Add security)
router.delete("/:id/:pinid", (req, res) => {
  const userID = req.params.id;
  const pinID = req.params.pinid;
  res.send(`Deletes user with ID and Pin ID: ${userID} and ${pinID}`);
});

module.exports = router;
