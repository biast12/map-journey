const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Import the Supabase client

// Route to create a new profile and default settings
router.post("/", async (req, res) => {
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

    if (settingsData) {
      // Step 2: Create the profile
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

    // Send a success response
    res.status(201).json({ message: "Profile created successfully" });
  } catch (error) {
    console.error("Error during profile creation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
