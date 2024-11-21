const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const checkApiKey = require("../utils/apiKeyCheck");
const generateUniqueId = require("../utils/uuid-generator");

router.use(checkApiKey);

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "User Route",
    routes: {
      "/all": "Get all users and their data",
      "/:id": "Get a user by ID",
      "/": "Create a new user and default settings",
      "/:id": "Update a user by User ID",
      "/:id": "Delete a user by User ID",
      "/login": "Login route",
    },
  });
});

// Get all users
router.get("/all", async (req, res) => {
  try {
    const { data: users, error } = await supabase.from("profile").select(`
        id, name, email, settings_id, avatar, banner, new_notifications, status, role, news_count
      `);

    if (error) throw error;
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  const userID = req.params.id;

  try {
    const { data: user, error: userError } = await supabase
      .from("profile")
      .select(
        `
        id, name, email, settings_id, avatar, banner, new_notifications, status, role, news_count
      `
      )
      .eq("id", userID)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return res.status(500).json({ error: "Error fetching user" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("id", user.settings_id)
      .single();

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      return res.status(500).json({ error: "Error fetching settings" });
    }

    res.status(200).json({ ...user, settings });
  } catch (error) {
    console.error("Error during user fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new user and default settings
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  try {
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from("profile")
      .select("email")
      .eq("email", email)
      .limit(1)
      .single();

    if (emailCheckError && emailCheckError.code !== "PGRST116") {
      console.error("Error checking email:", emailCheckError);
      return res.status(500).json({ error: "Error checking email" });
    }

    if (existingEmail) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const { data: existingName, error: nameCheckError } = await supabase
      .from("profile")
      .select("name")
      .eq("name", name)
      .limit(1)
      .single();

    if (nameCheckError && nameCheckError.code !== "PGRST116") {
      console.error("Error checking name:", nameCheckError);
      return res.status(500).json({ error: "Error checking name" });
    }

    if (existingName) {
      return res.status(400).json({ error: "Name is already taken" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const settingsId = await generateUniqueId();
    const userId = await generateUniqueId();

    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .insert([{ id: settingsId, maptheme: "default", language: "en", notification: true }])
      .select("id")
      .single();

    if (settingsError) {
      console.error("Error creating settings:", settingsError);
      return res.status(500).json({ error: "Error creating settings" });
    }

    const { error: profileError } = await supabase.from("profile").insert([
      {
        id: userId,
        name,
        email,
        password: hashedPassword,
        settings_id: settingsData.id,
      },
    ]);

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
router.put("/:id", async (req, res) => {
  const userID = req.params.id;
  const { name, email, password, avatar } = req.body;

  const updatedFields = {};
  if (avatar) updatedFields.avatar = avatar;
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
router.delete("/:id", async (req, res) => {
  const userID = req.params.id;

  try {
    const { data: profile, error: fetchError } = await supabase
      .from("profile")
      .select("settings_id")
      .eq("id", userID)
      .single();

    if (fetchError) {
      console.error("Error fetching user profile:", fetchError);
      return res.status(500).json({ error: "Error checking user profile" });
    }

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    const { settings_id } = profile;

    const { error: deletePinsError } = await supabase
      .from("pins")
      .delete()
      .eq("profile_id", userID);

    if (deletePinsError) {
      console.error("Error deleting user pins:", deletePinsError);
      return res.status(500).json({ error: "Error deleting user pins" });
    }

    if (settings_id) {
      const { error: deleteSettingsError } = await supabase
        .from("settings")
        .delete()
        .eq("id", settings_id);

      if (deleteSettingsError) {
        console.error("Error deleting user settings:", deleteSettingsError);
        return res.status(500).json({ error: "Error deleting user settings" });
      }
    }

    const { error: deleteReportsError } = await supabase
      .from("reports")
      .delete()
      .eq("reported_user_id", userID);

    if (deleteReportsError) {
      console.error("Error deleting user reports:", deleteReportsError);
      return res.status(500).json({ error: "Error deleting user reports" });
    }

    const { error: deleteProfileError } = await supabase
      .from("profile")
      .delete()
      .eq("id", userID)
      .single();

    if (deleteProfileError) {
      console.error("Error deleting user profile:", deleteProfileError);
      return res.status(500).json({ error: "Error deleting user profile" });
    }

    res.status(200).send();
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
