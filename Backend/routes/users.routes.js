const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Import the Supabase client

router.get("/", (req, res) => {
  res.send("User Route");
});

// Get all users
router.get("/all", (req, res) => {
  res.send("Get all users");
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params; // Get the user ID from the request parameters

  try {
    // Query the 'profile' table for the user with the given ID
    const { data: user, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", id)
      .single(); // Get a single user by ID

    // Handle any errors during the query
    if (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Error fetching user" });
    }

    // Check if user was found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the found user data
    res.status(200).json(user);
  } catch (error) {
    console.error("Error during user fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new user and default settings
router.post("/create", async (req, res) => {
  const { name, email, password } = req.body; // Destructure request body

  // Validate input
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  try {
    // Step 1: Create default settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .insert([
        {
          maptheme: "default",
          language: "en",
          notification: true,
        },
      ]) // Default values
      .select("id") // Request the ID of the newly created settings
      .single(); // Get the created settings entry

    // Check for errors during settings creation
    if (settingsError) {
      console.error("Error creating settings:", settingsError);
      return res.status(500).json({ error: "Error creating settings" });
    }

    // Step 2: Create the user profile
    if (settingsData) {
      const { error: profileError } = await supabase.from("profile").insert([
        {
          name,
          email,
          password,
          settings_id: settingsData.id, // Use the settings ID
        },
      ]);

      // Handle profile creation error
      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Optional: Rollback the settings creation if necessary
        await supabase.from("settings").delete().eq("id", settingsData.i); // Delete the created settings if profile creation fails
        return res.status(500).json({ error: "Error creating profile" });
      }
    }

    res.status(201).json({ message: "Profile created successfully" });
  } catch (error) {
    console.error("Error during profile creation:", error);
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

// Get a user's settings by ID (Fixed)
router.get("/settings/:id", (req, res) => {
  const userId = req.params.id; // Extract user ID from the request parameters
  res.send(`You got the settings for user with ID: ${userId}`);
});

// Update a user's settings by ID (Fixed)
router.put("/settings/:id", (req, res) => {
  const userId = req.params.id; // Extract user ID from the request parameters
  res.send(`You updated the settings for user with ID: ${userId}`);
});

module.exports = router;
