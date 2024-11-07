const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const checkApiKey = require("../apiKeyCheck");

router.use(checkApiKey);

// Helper function to validate UUIDs
function isValidUUID(uuid) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Pins Route",
    routes: {
      "/all": "Get all reports",
      "/": "Create a new report",
      "/:id": "Delete a report by ID",
      "/dismissed/:id": "dismissed a report by ID",
    },
  });
});

// Get all reports
router.get("/all", async (req, res) => {
  try {
    const { data: reports, error } = await supabase.from("reports").select("*");

    if (error) throw error;
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Error fetching reports" });
  }
});

// make a report
router.post("/:id", async (req, res) => {
  const { text, reported_user_id, reported_pin_id } = req.body;
  const profile_id = req.params.id;

  if (!text) {
    return res.status(400).json({ message: "Text field is required" });
  }

  if (
    (!reported_user_id && !reported_pin_id) ||
    (reported_user_id && reported_pin_id)
  ) {
    return res.status(400).json({
      message:
        "One and only one of reported_user_id or reported_pin_id must be provided",
    });
  }

  let sanitizedReportedUserId = null;
  let sanitizedReportedPinId = null;

  if (reported_user_id) {
    if (
      typeof reported_user_id !== "string" ||
      !isValidUUID(reported_user_id)
    ) {
      return res
        .status(400)
        .json({ message: "reported_user_id must be a valid UUID" });
    }
    sanitizedReportedUserId = reported_user_id;
  }

  if (reported_pin_id) {
    sanitizedReportedPinId = parseInt(reported_pin_id, 10);
    if (isNaN(sanitizedReportedPinId)) {
      return res
        .status(400)
        .json({ message: "reported_pin_id must be a valid integer" });
    }
  }

  try {
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .insert([
        {
          profile_id,
          text,
          reported_user_id: sanitizedReportedUserId,
          reported_pin_id: sanitizedReportedPinId,
          active: true,
        },
      ]);

    if (reportError) throw reportError;

    if (sanitizedReportedUserId) {
      const { count: profileReportCount, error: profileCountError } =
        await supabase
          .from("reports")
          .select("*", { count: "exact" })
          .eq("reported_user_id", sanitizedReportedUserId)
          .eq("active", true);

      if (profileCountError) throw profileCountError;

      if (profileReportCount > 5) {
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("status")
          .eq("id", sanitizedReportedUserId)
          .single();

        if (profileError) throw profileError;

        if (
          profileData.status !== "offline" &&
          profileData.status !== "reported"
        ) {
          const { error: updateProfileError } = await supabase
            .from("profile")
            .update({ status: "reported" })
            .eq("id", sanitizedReportedUserId);

          if (updateProfileError) throw updateProfileError;
        }
      }
    } else if (sanitizedReportedPinId) {
      const { count: pinReportCount, error: pinCountError } = await supabase
        .from("reports")
        .select("*", { count: "exact" })
        .eq("reported_pin_id", sanitizedReportedPinId)
        .eq("active", true);

      if (pinCountError) throw pinCountError;

      if (pinReportCount > 5) {
        const { data: pinData, error: pinError } = await supabase
          .from("pins")
          .select("status")
          .eq("id", sanitizedReportedPinId)
          .single();

        if (pinError) throw pinError;

        if (pinData.status !== "offline" && pinData.status !== "reported") {
          const { error: updatePinError } = await supabase
            .from("pins")
            .update({ status: "reported" })
            .eq("id", sanitizedReportedPinId);

          if (updatePinError) throw updatePinError;
        }
      }
    }

    res
      .status(201)
      .json({ message: "Report created successfully", data: reportData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create report", error: error.message });
  }
});

// Delete a report by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("reports")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.status(200).json({ message: "Report deleted successfully", data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete report", error: error.message });
  }
});

// actions for report by ID
router.put("/actions/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // Extract 'action' from the request body

  if (action === "dismiss") {
    try {
      let updateField;
      let updateStatusField;
      let targetTable;

      // Check if ID is a valid UUID or an integer (assumed to represent a pin ID)
      if (isValidUUID(id)) {
        updateField = "reported_user_id";
        updateStatusField = "profile";
        targetTable = "profile";
      } else if (!isNaN(parseInt(id, 10))) {
        updateField = "reported_pin_id";
        updateStatusField = "pins";
        targetTable = "pins";
      } else {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      // Update the status in the target table to 'public'
      const { error: updateStatusError } = await supabase
        .from(targetTable)
        .update({ status: "public" })
        .eq("id", id);

      if (updateStatusError) throw updateStatusError;

      // Deactivate related reports in the reports table
      const { error: deactivateReportsError } = await supabase
        .from("reports")
        .update({ active: false })
        .eq(updateField, id);

      if (deactivateReportsError) throw deactivateReportsError;

      // Respond with a success message
      res.status(200).json({
        message: "Reports dismissed successfully, status set to public, and all related reports deactivated.",
      });
    } catch (error) {
      console.error("Error dismissing reports:", error);
      res.status(500).json({
        message: "Failed to dismiss reports",
        error: error.message,
      });
    }
  } else if (action === "ban") {
    try {
      if (isValidUUID(id)) {
        const { error: deactivateUserReportsError } = await supabase
          .from("reports")
          .update({ active: false })
          .eq("reported_user_id", id);

        if (deactivateUserReportsError) throw deactivateUserReportsError;
        const { error: banUserError } = await supabase
          .from("profile")
          .update({ status: "banned" })
          .eq("id", id);

        if (banUserError) throw banUserError;
        const { data: userPins, error: pinDataError } = await supabase
          .from("pins")
          .select("id")
          .eq("profile_id", id);

        if (pinDataError) throw pinDataError;

        if (userPins && userPins.length > 0) {
          const { error: updatePinsError } = await supabase
            .from("pins")
            .update({ status: "banned" })
            .in("id", userPins.map(pin => pin.id));

          if (updatePinsError) throw updatePinsError;
        }

        res.status(200).json({ message: "User has been banned, all pins created by the user have been banned, and reported pins marked as deleted." });
      } else if (!isNaN(parseInt(id, 10))) {
        const { error: deactivatePinReportsError } = await supabase
          .from("reports")
          .update({ active: false })
          .eq("reported_pin_id", id);

        if (deactivatePinReportsError) throw deactivatePinReportsError;
        const { data: pinData, error: pinDataError } = await supabase
          .from("pins")
          .select("profile_id")
          .eq("id", id)
          .single();

        if (pinDataError) throw pinDataError;

        if (pinData && pinData.profile_id) {
          const profileId = pinData.profile_id;
          const { error: banPinUserError } = await supabase
            .from("profile")
            .update({ status: "banned" })
            .eq("id", profileId);

          if (banPinUserError) throw banPinUserError;
          const { data: userPins, error: pinDataError } = await supabase
            .from("pins")
            .select("id")
            .eq("profile_id", profileId);

          if (pinDataError) throw pinDataError;

          if (userPins && userPins.length > 0) {
            const { error: updatePinsError } = await supabase
              .from("pins")
              .update({ status: "banned" })
              .in("id", userPins.map(pin => pin.id));

            if (updatePinsError) throw updatePinsError;
          }

          res.status(200).json({ message: "User who created the pin has been banned, all their pins have been banned." });
        } else {
          res.status(400).json({ message: "Pin data not found or pin does not exist" });
        }
      } else {
        res.status(400).json({ message: "Invalid ID format" });
      }
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({
        message: "Failed to ban user",
        error: error.message,
      });
    }
  } else if (action === "warning") {
    try {
      if (!isNaN(parseInt(id, 10))) {
        // Handle warning for a reported pin only
        const { error: deactivatePinReportsError } = await supabase
          .from("reports")
          .update({ active: false })
          .eq("reported_pin_id", id);
  
        if (deactivatePinReportsError) throw deactivatePinReportsError;
  
        // Mark the pin as "warned"
        const { error: warningPinError } = await supabase
          .from("pins")
          .update({ status: "warning" })
          .eq("id", id);
  
        if (warningPinError) throw warningPinError;
  
        res.status(200).json({ message: "Reported pin has been warned." });
      } else {
        res.status(400).json({ message: "Invalid pin ID format" });
      }
    } catch (error) {
      console.error("Error warning pin:", error);
      res.status(500).json({
        message: "Failed to warn pin",
        error: error.message,
      });
    }
  } else {
    res.status(400).json({ message: "Invalid action" });
  }
});

module.exports = router;
