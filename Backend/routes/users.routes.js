const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Helper function to generate a unique 10-character alphanumeric ID
const generateUniqueId = () => {
  return crypto.randomBytes(5).toString("hex");
};

// Function to check if an ID already exists in the "profile" table
const idExists = async (id) => {
  const { data, error } = await supabase
    .from("profile")
    .select("id")
    .eq("id", id)
    .single();
  return !!data; // Returns true if ID exists, false otherwise
};

// Root route
router.get("/", (req, res) => {
  res.send("User Route");
});

// Get all users
router.get("/all", async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("profile")
      .select("*");

    if (error) throw error;
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  const userID = req.params.id; // This is expected to be a UUID

  try {
    const { data: user, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", userID)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Error fetching user" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error during user fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new user and default settings
router.post("/create", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Step 1: Create default settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .insert([{ maptheme: "default", language: "en", notification: true }])
      .select("id")
      .single();

    if (settingsError) {
      console.error("Error creating settings:", settingsError);
      return res.status(500).json({ error: "Error creating settings" });
    }

    // Step 2: Function to generate unique UUID
    const generateUniqueId = async () => {
      let uniqueId;
      let exists = true;
      while (exists) {
        uniqueId = crypto.randomUUID(); // Generate a new UUID
        const { data, error } = await supabase
          .from("profile")
          .select("id")
          .eq("id", uniqueId)
          .single(); // Check if the ID already exists
        exists = data !== null; // If data is not null, UUID already exists
      }
      return uniqueId;
    };

    // Generate a unique UUID
    const uniqueId = await generateUniqueId();

    // Step 3: Create the user profile
    const { error: profileError } = await supabase.from("profile").insert([{
      id: uniqueId,
      name,
      email,
      password: hashedPassword,
      settings_id: settingsData.id,
    }]);

    if (profileError) {
      console.error("Error creating profile:", profileError);
      await supabase.from("settings").delete().eq("id", settingsData.id);
      return res.status(500).json({ error: "Error creating profile" });
    }

    res.status(201).json({ message: "Profile created successfully" });
  } catch (error) {
    console.error("Error during profile creation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Update a user by User ID
router.put("/edit/:id", async (req, res) => {
  const userID = req.params.id;
  const { name, email, password } = req.body;

  // Create an object to hold the fields to update
  const updatedFields = {};
  if (name) updatedFields.name = name;
  if (email) updatedFields.email = email;
  if (password) updatedFields.password = await bcrypt.hash(password, 10);

  try {
    const { data, error } = await supabase
      .from("profile")
      .update(updatedFields)
      .eq("id", userID)
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ error: "Error updating user" });
    }

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: data });
  } catch (error) {
    console.error("Error during user update:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a user by User ID
router.delete("/delete/:id", async (req, res) => {
  const userID = req.params.id;

  try {
    const { data, error } = await supabase
      .from("profile")
      .delete()
      .eq("id", userID)
      .single();

    if (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ error: "Error deleting user" });
    }

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).send(); // Successfully deleted with no content
  } catch (error) {
    console.error("Error during user deletion:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const { data: user, error } = await supabase
      .from("profile")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password: hashedPassword } = user;
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

module.exports = router;