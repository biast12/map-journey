const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const checkApiKey = require("../utils/apiKeyCheck");
const generateUniqueId = require("../utils/uuid-generator");
const checkUserRole = require("../utils/checkUserRole");
const deleteImageFromBucket = require("../utils/deleteBucketIMGs");

router.use(checkApiKey);

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Pins Route",
    routes: {
      "/all/:id": "Get all public pins",
      "/:id": "Get pins by user ID",
      "/:id": "Create a new pin",
      "/:id/:pinid": "Update a pin by User ID and Pin ID",
      "/:id/:pinid": "Delete a pin by User ID and Pin ID",
    },
  });
});

// Get all public pins
router.get("/all/:id", checkUserRole("user"), async (req, res) => {
  const userID = req.params.id;

  try {
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profile")
      .select("status")
      .eq("id", userID)
      .single();

    if (userProfileError) {
      console.error("Error fetching user profile:", userProfileError);
      return res.status(500).json({ error: "Error fetching user profile" });
    }

    const isUserBanned = userProfile.status === "banned";

    const { data: pins, error: pinsError } = await supabase
    .from("pins")
    .select(
      `*,
      profile:profile_id (
        id,
        name,
        avatar,
        status
      ),
      reports (
        profile_id
      )`
    )
    .eq("status", "public")
    .filter("profile.status", "eq", "public");

    if (pinsError) {
      console.error("Error fetching public pins:", pinsError);
      return res.status(500).json({ error: "Error fetching public pins" });
    }

    const filteredPins = pins.map((pin) => {
      if (!pin.profile) return null;

      if (isUserBanned) {
        pin.reported = true;
      } else {
        const isReported = pin.reports.some((report) => report.profile_id === userID);
        pin.reported = isReported;
      }

      return pin;
    }).filter(Boolean);

    res.status(200).json(filteredPins);
  } catch (error) {
    console.error("Error during fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get pins by user ID
router.get("/:id", checkUserRole("user"), async (req, res) => {
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
      console.error("Error fetching user pins:", error);
      return res.status(500).json({ error: "Error fetching user pins" });
    }

    res.status(200).json(pins);
  } catch (error) {
    console.error("Error during fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new pin
router.post("/:id", checkUserRole("user"), async (req, res) => {
  const profile_id = req.params.id;
  const { title, description, location, longitude, latitude, imgurls, status } =
    req.body;

  if (
    !profile_id ||
    !title ||
    !description ||
    !location ||
    !longitude ||
    !latitude ||
    !imgurls
  ) {
    return res.status(400).json({
      error:
        "All required fields must be provided: title, description, location, longitude, latitude, imgurls.",
    });
  }

  try {
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profile")
      .select("status")
      .eq("id", profile_id)
      .single();

    if (userProfileError) {
      console.error("Error fetching user profile:", userProfileError);
      return res.status(500).json({ error: "Error fetching user profile" });
    }

    if (userProfile.status === "banned") {
      return res
        .status(403)
        .json({ error: "You are banned and cannot create a pin." });
    }

    let adjustedLongitude = parseFloat(longitude);
    let adjustedLatitude = parseFloat(latitude);
    let isUnique = false;

    while (!isUnique) {
      console.log("Checking Longitude:", adjustedLongitude.toFixed(7));
      console.log("Checking Latitude:", adjustedLatitude.toFixed(7));

      const { data: existingPin } = await supabase
        .from("pins")
        .select("id")
        .eq("longitude", adjustedLongitude.toFixed(7))
        .eq("latitude", adjustedLatitude.toFixed(7))
        .single();

      if (existingPin) {
        console.log(
          `Conflict found at Longitude: ${adjustedLongitude.toFixed(7)}, Latitude: ${adjustedLatitude.toFixed(7)}`
        );

        adjustedLongitude += (Math.random() > 0.5 ? 1 : -1) * 0.000005;
        adjustedLatitude += (Math.random() > 0.5 ? 1 : -1) * 0.000005;

        adjustedLongitude = parseFloat(adjustedLongitude.toFixed(7));
        adjustedLatitude = parseFloat(adjustedLatitude.toFixed(7));
      } else {
        isUnique = true;
        console.log(
          `Unique coordinates found: Longitude: ${adjustedLongitude.toFixed(7)}, Latitude: ${adjustedLatitude.toFixed(7)}`
        );
      }
    }

    const uniqueId = await generateUniqueId();

    const pinData = {
      id: uniqueId,
      profile_id,
      title,
      description,
      location,
      longitude: adjustedLongitude.toFixed(7),
      latitude: adjustedLatitude.toFixed(7),
      imgurls,
      status: status === "true" ? "public" : "private",
    };

    const { error: pinError } = await supabase.from("pins").insert([pinData]);

    if (pinError) {
      console.error("Error creating pin:", pinError);

      try {
        await deleteImageFromBucket(imgurls);
        console.log("Pin image deleted from storage after creation failure.");
      } catch (imageDeleteError) {
        console.error("Error deleting image from storage:", imageDeleteError);
        return res.status(500).json({ error: "Error deleting pin image from storage" });
      }

      return res.status(500).json({ error: "Error creating pin" });
    }

    res.status(201).json({ message: "Pin created successfully" });
  } catch (error) {
    console.error("Error during pin creation:", error);

    try {
      await deleteImageFromBucket(imgurls);
      console.log("Pin image deleted from storage after unexpected error.");
    } catch (imageDeleteError) {
      console.error("Error deleting image from storage:", imageDeleteError);
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a pin by User ID and Pin ID
router.put("/:pinid/:id", checkUserRole("user"), async (req, res) => {
  const userID = req.params.id;
  const pinID = req.params.pinid;
  const { title, description, location, longitude, latitude, imgurls, status } =
    req.body;
    
  const updatedFields = {};
  if (title) updatedFields.title = title;
  if (description) updatedFields.description = description;
  if (location) updatedFields.location = location;
  if (longitude) updatedFields.longitude = longitude;
  if (latitude) updatedFields.latitude = latitude;
  if (imgurls) updatedFields.imgurls = imgurls;
  if (typeof(status) === "boolean") updatedFields.status = status === true ? "public" : "private";

  try {
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profile")
      .select("status, role")
      .eq("id", userID)
      .single();

    if (userProfileError) {
      console.error("Error fetching user profile:", userProfileError);
      if (imgurls) await deleteImageFromBucket(imgurls);
      return res.status(500).json({ error: "Error fetching user profile" });
    }

    if (userProfile.status === "banned") {
      return res
        .status(403)
        .json({ error: "You are banned and cannot update a pin." });
    }

    const { data: pin, error: pinCheckError } = await supabase
      .from("pins")
      .select("profile_id, imgurls")
      .eq("id", pinID)
      .single();

    if (pinCheckError || !pin) {
      return res.status(404).json({ error: "Pin not found" });
    }

    if (pin.profile_id !== userID && userProfile.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to update this pin" });
    }

    if (imgurls && pin.imgurls && imgurls !== pin.imgurls) {
      await deleteImageFromBucket(pin.imgurls);
    }

    const { error: updateError } = await supabase
      .from("pins")
      .update(updatedFields)
      .eq("id", pinID);

    if (updateError) {
      console.error("Error updating pin:", updateError);
      if (imgurls) await deleteImageFromBucket(imgurls);
      return res.status(500).json({ error: "Error updating pin" });
    }

    res.status(200).json({ message: "Pin updated successfully" });
  } catch (error) {
    console.error("Error during pin update:", error);
    if (imgurls) await deleteImageFromBucket(imgurls);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a pin by User ID and Pin ID
router.delete("/:pinid/:id", checkUserRole("user"), async (req, res) => {
  const userID = req.params.id;
  const pinID = req.params.pinid;

  try {
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profile")
      .select("status, role")
      .eq("id", userID)
      .single();

    if (userProfileError) {
      console.error("Error fetching user profile:", userProfileError);
      return res.status(500).json({ error: "Error fetching user profile" });
    }

    if (userProfile.status === "banned") {
      return res
        .status(403)
        .json({ error: "You are banned and cannot delete a pin." });
    }

    const { data: pin, error: pinCheckError } = await supabase
      .from("pins")
      .select("profile_id, imgurls")
      .eq("id", pinID)
      .single();

    if (pinCheckError || !pin) {
      return res.status(404).json({ error: "Pin not found" });
    }

    if (pin.profile_id !== userID && userProfile.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to delete this pin" });
    }

    await deleteImageFromBucket(pin.imgurls);

    const { error: deleteReportsError } = await supabase
      .from("reports")
      .delete()
      .eq("reported_pin_id", pinID);

    if (deleteReportsError) {
      console.error("Error deleting reports for pin:", deleteReportsError);
      return res.status(500).json({ error: "Error deleting reports for pin" });
    }

    const { error: deletePinError } = await supabase
      .from("pins")
      .delete()
      .eq("id", pinID);

    if (deletePinError) {
      console.error("Error deleting pin:", deletePinError);
      return res.status(500).json({ error: "Error deleting pin" });
    }

    res.status(200).send("Pin and associated image deleted successfully");
  } catch (error) {
    console.error("Error during pin deletion:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
