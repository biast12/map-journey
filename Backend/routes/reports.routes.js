const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const checkApiKey = require("../apiKeyCheck");

router.use(checkApiKey);

const Maxnumber = 5;

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

      if (profileReportCount >= Maxnumber) {
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

      if (pinReportCount >= Maxnumber) {
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
    const { data: reportToDelete, error: fetchError } = await supabase
      .from("reports")
      .select("reported_user_id, reported_pin_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    if (!reportToDelete) {
      return res.status(404).json({ message: "Report not found" });
    }

    const { reported_user_id, reported_pin_id } = reportToDelete;

    const { data, error } = await supabase
      .from("reports")
      .delete()
      .eq("id", id);

    if (error) throw error;

    if (reported_user_id) {
      const { count: userReportCount, error: userCountError } = await supabase
        .from("reports")
        .select("*", { count: "exact" })
        .eq("reported_user_id", reported_user_id)
        .eq("active", true);

      if (userCountError) throw userCountError;

      if (userReportCount < Maxnumber) {
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("status")
          .eq("id", reported_user_id)
          .single();

        if (profileError) throw profileError;

        if (profileData.status === "reported") {
          const { error: updateProfileError } = await supabase
            .from("profile")
            .update({ status: "offline" })
            .eq("id", reported_user_id);

          if (updateProfileError) throw updateProfileError;
        }
      }
    }

    if (reported_pin_id) {
      const { count: pinReportCount, error: pinCountError } = await supabase
        .from("reports")
        .select("*", { count: "exact" })
        .eq("reported_pin_id", reported_pin_id)
        .eq("active", true);

      if (pinCountError) throw pinCountError;

      if (pinReportCount < Maxnumber) {
        const { data: pinData, error: pinError } = await supabase
          .from("pins")
          .select("status")
          .eq("id", reported_pin_id)
          .single();

        if (pinError) throw pinError;

        if (pinData.status === "reported") {
          const { error: updatePinError } = await supabase
            .from("pins")
            .update({ status: "offline" })
            .eq("id", reported_pin_id);

          if (updatePinError) throw updatePinError;
        }
      }
    }

    res.status(200).json({ message: "Report deleted successfully", data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete report", error: error.message });
  }
});

module.exports = router;
