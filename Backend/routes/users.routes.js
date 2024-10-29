const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// Root route
router.get("/", (req, res) => {
  res.send("User Route");
});

// Get all users (Add security)
router.get("/all", (req, res) => {
  res.send("Get all users");
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  const userID = req.params.id;

  try {
    // Query the 'profile' table for the user with the given ID
    const { data: user, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", userID)
      .single();

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
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash the password

    // Step 1: Create default settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .insert([
        {
          maptheme: "default",
          language: "en",
          notification: true,
        },
      ])
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
          settings_id: settingsData.id,
        },
      ]);

      // Handle profile creation error
      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Delete the created settings if profile creation fails
        await supabase.from("settings").delete().eq("id", settingsData.i);
        return res.status(500).json({ error: "Error creating profile" });
      }
    }

    res.status(201).json({ message: "Profile created successfully" });
  } catch (error) {
    console.error("Error during profile creation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a user by User ID (Add security)
router.put("/:id", (req, res) => {
  const userID = req.params.id;
  res.send(`Updates user with ID: ${userID}`);
});

// Delete a user by User ID (Add security)
router.delete("/:id", (req, res) => {
  const userID = req.params.id;
  res.send(`Deletes user with ID: ${userID}`);
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // Get email and password from the request

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Query the 'profile' table to find the user by email
    const { data: users, error } = await supabase
      .from("profile")
      .select("*")
      .eq("email", email)
      .single(); // Use .single() to fetch only one record

    // If user not found or any error occurs
    if (error || !users) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password: hashedPassword } = users; // Get the hashed password from the user record

    // Compare the hashed password with the provided password
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Successful login response
    res.status(200).json({
      message: "Login successful",
      user: users, // Optionally, only send non-sensitive user info
    });
  } catch (err) {
    // Handle unexpected server errors
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

module.exports = router;
