const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Import the Supabase client

// Define your routes here
router.get("/", (req, res) => {
  res.send("Pins Route");
});

// Get all pins
router.get("/all", async (req, res) => {
  try {
    // Query the 'pins' table, filtering for status 'public'
    const { data: pins, error } = await supabase
      .from("pins")
      .select("*")
      .eq("status", "public");

    // Handle any potential errors from the query
    if (error) {
      console.error("Error fetching public pins:", error);
      return res.status(500).json({ error: "Error fetching public pins" });
    }

    // Return the list of public pins
    res.status(200).json(pins);
  } catch (error) {
    console.error("Error during fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get pins by user ID
router.get("/:id", (req, res) => {
  res.send("Get pin from ID");
});

router.get("/user/:id", (req, res) => {
  res.send("Get pins from users ID");
});

router.post("/create", async (req, res) => {
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

// Update a user by ID
router.put("/:id", (req, res) => {
  res.send("Updates user by ID");
});

// Delete a user by ID
router.delete("/:id", (req, res) => {
  res.send("Deletes user by ID");
});

// Get a user's settings by ID
router.get("/settings/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`You got the settings for user with ID: ${userId}`);
});

// Update a user's settings by ID
router.put("/settings/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`You updated the settings for user with ID: ${userId}`);
});

module.exports = router;
