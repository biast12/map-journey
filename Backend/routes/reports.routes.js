const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const checkApiKey = require("../utils/apiKeyCheck");
const checkUserRole = require("../utils/checkUserRole");

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
    message: "reports Route",
    routes: {
      "/all": "Get all reports",
      "/:id": "Create a new report",
      "/:id": "Delete a report by ID",
    },
  });
});

// Get all reports
router.get("/all:id", checkUserRole("admin"), async (req, res) => {
  try {
    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("*");

    if (reportsError) throw reportsError;

    const enhancedReports = await Promise.all(
      reports.map(async (report) => {
        const { data: reportingUser, error: reportingUserError } =
          await supabase
            .from("profile")
            .select("id, name, email, avatar")
            .eq("id", report.profile_id)
            .single();

        if (reportingUserError) {
          console.error(
            `Error fetching reporting user (profile_id: ${report.profile_id}):`,
            reportingUserError
          );
          throw reportingUserError;
        }

        let reportedUser = null;
        if (report.reported_user_id) {
          const { data: reportedUserData, error: reportedUserError } =
            await supabase
              .from("profile")
              .select("id, name, email, avatar")
              .eq("id", report.reported_user_id)
              .single();

          if (reportedUserError) {
            console.error(
              `Error fetching reported user (reported_user_id: ${report.reported_user_id}):`,
              reportedUserError
            );
            throw reportedUserError;
          }

          reportedUser = reportedUserData;
        }

        let reportedPin = null;
        if (report.reported_pin_id) {
          const { data: reportedPinData, error: reportedPinError } =
            await supabase
              .from("pins")
              .select(
                "id, profile_id, title, description, imgurls, date, location, longitude, latitude"
              )
              .eq("id", report.reported_pin_id)
              .single();

          if (reportedPinError) {
            console.error(
              `Error fetching reported pin (reported_pin_id: ${report.reported_pin_id}):`,
              reportedPinError
            );
            throw reportedPinError;
          }

          reportedPin = reportedPinData;
        }

        return {
          id: report.id,
          reporting_user: reportingUser,
          text: report.text,
          date: report.date,
          reported_user: reportedUser,
          reported_pin: reportedPin,
          active: report.active,
        };
      })
    );

    res.status(200).json(enhancedReports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Error fetching reports" });
  }
});

// make a report
router.post("/:id", checkUserRole("user"), async (req, res) => {
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

  if (!isValidUUID(profile_id)) {
    return res.status(400).json({ message: "Invalid profile ID" });
  }

  const { data: reportingUser, error: reportingUserError } = await supabase
    .from("profile")
    .select("id")
    .eq("id", profile_id)
    .single();

  if (reportingUserError || !reportingUser) {
    return res.status(404).json({ message: "Reporting user not found" });
  }

  if (reported_user_id) {
    if (!isValidUUID(reported_user_id)) {
      return res
        .status(400)
        .json({ message: "reported_user_id must be a valid UUID" });
    }

    const { data: reportedUser, error: reportedUserError } = await supabase
      .from("profile")
      .select("id")
      .eq("id", reported_user_id)
      .single();

    if (reportedUserError || !reportedUser) {
      return res.status(404).json({ message: "Reported user not found" });
    }
  }

  if (reported_pin_id) {
    if (!isValidUUID(reported_pin_id)) {
      return res
        .status(400)
        .json({ message: "reported_pin_id must be a valid UUID" });
    }

    const { data: reportedPin, error: reportedPinError } = await supabase
      .from("pins")
      .select("id")
      .eq("id", reported_pin_id)
      .single();

    if (reportedPinError || !reportedPin) {
      return res.status(404).json({ message: "Reported pin not found" });
    }
  }

  try {
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .insert([
        {
          profile_id,
          text,
          reported_user_id: reported_user_id || null,
          reported_pin_id: reported_pin_id || null,
          active: true,
        },
      ]);

    if (reportError) throw reportError;

    if (reported_user_id) {
      const { count: profileReportCount, error: profileCountError } =
        await supabase
          .from("reports")
          .select("*", { count: "exact" })
          .eq("reported_user_id", reported_user_id)
          .eq("active", true);

      if (profileCountError) throw profileCountError;

      if (profileReportCount >= Maxnumber) {
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("status")
          .eq("id", reported_user_id)
          .single();

        if (profileError) throw profileError;

        if (
          profileData.status !== "offline" &&
          profileData.status !== "reported"
        ) {
          const { error: updateProfileError } = await supabase
            .from("profile")
            .update({ status: "reported" })
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

      if (pinReportCount >= Maxnumber) {
        const { data: pinData, error: pinError } = await supabase
          .from("pins")
          .select("status")
          .eq("id", reported_pin_id)
          .single();

        if (pinError) throw pinError;

        if (pinData.status !== "offline" && pinData.status !== "reported") {
          const { error: updatePinError } = await supabase
            .from("pins")
            .update({ status: "reported" })
            .eq("id", reported_pin_id);

          if (updatePinError) throw updatePinError;
        }
      }
    }
    res
      .status(201)
      .json({ message: "Report created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create report", error: error.message });
  }
});

// Delete a report by ID
router.delete("/:id", checkUserRole("admin"), async (req, res) => {
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
