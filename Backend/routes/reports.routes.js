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

// Get all reports
router.get("/all/:id", checkUserRole("admin"), async (req, res) => {
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

// set user status to privte
router.post("/seen/:id", checkUserRole("user"), async (req, res) => {
  const id = req.params.id;
  console.log(req.params);

  if (!id) {
    return res.status(400).json({ message: "Profile ID is required." });
  }

  try {
    const { data: userProfile, error: profileError } = await supabase
      .from("profile")
      .select("id, status")
      .eq("id", id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return res.status(500).json({ message: "Error fetching user profile" });
    }

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userProfile.status === "warning") {
      const { error: updateProfileError } = await supabase
        .from("profile")
        .update({ status: "private" })
        .eq("id", id);

      if (updateProfileError) {
        console.error(
          "Error updating user profile status:",
          updateProfileError
        );
        return res
          .status(500)
          .json({ message: "Error updating user profile status" });
      }

      return res.status(200).json({
        message: "User status updated from 'warning' to 'private'.",
        userProfile: { id: userProfile.id, status: "private" },
      });
    } else {
      return res
        .status(400)
        .json({ message: "User is not in 'warning' status." });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(500)
      .json({ message: "Failed to process request", error: error.message });
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
    .select("status")
    .eq("id", profile_id)
    .single();

  if (reportingUserError || !reportingUser) {
    return res.status(404).json({ message: "Reporting user not found" });
  }

  if (reportingUser.status === "banned") {
    return res.status(403).json({ message: "You are banned and cannot create a report." });
  }

  try {
    const { data: existingReports, error: reportFetchError } = await supabase
      .from("reports")
      .select("*")
      .eq("profile_id", profile_id);

    if (reportFetchError) {
      console.error("Error checking existing report:", reportFetchError);
      return res.status(500).json({ message: "Error checking existing report" });
    }

    const isDuplicateReport = existingReports.some(report => 
      report.reported_user_id === reported_user_id || report.reported_pin_id === reported_pin_id
    );

    if (isDuplicateReport) {
      return res.status(403).json({ message: "You can't report this user or pin again." });
    }

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

    res.status(201).json({ message: "Report created successfully" });
  } catch (error) {
    console.error("Error during report creation:", error);
    res.status(500).json({ message: "Failed to create report", error: error.message });
  }
});

// admin actions: dismiss / warn / ban
router.post("/:id/:rpid", checkUserRole("admin"), async (req, res) => {
  const { rpid } = req.params;
  const { action } = req.body;

  if (!action) {
    return res.status(400).json({ message: "Action parameter is required" });
  }

  try {
    const { data: report, error: reportFetchError } = await supabase
      .from("reports")
      .select("reported_user_id, reported_pin_id")
      .eq("id", rpid)
      .single();

    if (reportFetchError) throw reportFetchError;

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const { reported_user_id, reported_pin_id } = report;

    if (reported_pin_id) {
      const { data: pin, error: pinFetchError } = await supabase
        .from("pins")
        .select("profile_id")
        .eq("id", reported_pin_id)
        .single();

      if (pinFetchError) throw pinFetchError;

      if (pin && pin.profile_id === reported_user_id) {
        const { data: pinOwner, error: pinOwnerFetchError } = await supabase
          .from("users")
          .select("role")
          .eq("id", pin.profile_id)
          .single();

        if (pinOwnerFetchError) throw pinOwnerFetchError;

        if (pinOwner.role === "admin") {
          return res
            .status(403)
            .json({
              message: "Cannot perform actions on pins owned by admin users",
            });
        }
      }
    }

    if (reported_user_id) {
      // Check if the reported user is an admin
      const { data: reportedUser, error: userFetchError } = await supabase
        .from("users")
        .select("role")
        .eq("id", reported_user_id)
        .single();

      if (userFetchError) throw userFetchError;

      if (reportedUser.role === "admin") {
        return res
          .status(403)
          .json({ message: "Cannot perform actions on admin users" });
      }
    }

    switch (action) {
      case "dismiss":
        const { data: deletedReport, error: deleteReportError } = await supabase
          .from("reports")
          .delete()
          .eq("id", rpid);

        if (deleteReportError) {
          console.error("Error deleting report:", deleteReportError);
          return res.status(500).json({ message: "Error deleting report" });
        }

        if (reported_user_id) {
          const { count: profileReportCount, error: profileCountError } =
            await supabase
              .from("reports")
              .select("*", { count: "exact" })
              .eq("reported_user_id", reported_user_id)
              .eq("active", true);

          if (profileCountError) throw profileCountError;

          if (profileReportCount < Maxnumber) {
            const { data: profileData, error: profileError } = await supabase
              .from("profile")
              .select("status")
              .eq("id", reported_user_id)
              .single();

            if (profileError) throw profileError;

            if (profileData.status !== "private") {
              const { error: updateProfileError } = await supabase
                .from("profile")
                .update({ status: "private" })
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

            if (pinData.status !== "private") {
              const { error: updatePinError } = await supabase
                .from("pins")
                .update({ status: "private" })
                .eq("id", reported_pin_id);

              if (updatePinError) throw updatePinError;
            }
          }
        }

        return res.status(200).json({
          message: "Report dismissed successfully",
          deletedReport,
        });

      case "warn":
        if (reported_user_id) {
          const { data: userProfile, error: userProfileError } = await supabase
            .from("profile")
            .select("status")
            .eq("id", reported_user_id)
            .single();

          if (userProfileError) {
            console.error("Error fetching user profile:", userProfileError);
            return res
              .status(500)
              .json({ message: "Error fetching user profile" });
          }

          if (
            userProfile.status !== "reported" &&
            userProfile.status !== "warning"
          ) {
            const { error: updateUserError } = await supabase
              .from("profile")
              .update({ status: "warning" })
              .eq("id", reported_user_id);

            if (updateUserError) {
              console.error("Error updating user profile:", updateUserError);
              return res
                .status(500)
                .json({ message: "Error updating user profile" });
            }
          }

          const { error: deleteReportsErrorUser } = await supabase
            .from("reports")
            .delete()
            .eq("reported_user_id", reported_user_id);

          if (deleteReportsErrorUser) {
            console.error(
              "Error deleting user reports:",
              deleteReportsErrorUser
            );
            return res
              .status(500)
              .json({ message: "Error deleting user reports" });
          }

          return res.status(200).json({
            message: "User status updated to warning and all reports deleted.",
          });
        }

        if (reported_pin_id) {
          const { data: pinData, error: pinError } = await supabase
            .from("pins")
            .select("id, profile_id")
            .eq("id", reported_pin_id)
            .single();

          if (pinError) {
            console.error("Error fetching pin:", pinError);
            return res.status(500).json({ message: "Error fetching pin" });
          }

          if (pinData) {
            const { profile_id } = pinData;

            const { data: deletedPinData, error: deletePinError } =
              await supabase.from("pins").delete().eq("id", reported_pin_id);

            if (deletePinError) {
              console.error("Error deleting pin:", deletePinError);
              return res.status(500).json({ message: "Error deleting pin" });
            }

            const { data: profileData, error: profileError } = await supabase
              .from("profile")
              .select("status")
              .eq("id", profile_id)
              .single();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
              return res
                .status(500)
                .json({ message: "Error fetching user profile" });
            }

            if (
              profileData.status !== "reported" &&
              profileData.status !== "warning"
            ) {
              const { error: updateProfileError } = await supabase
                .from("profile")
                .update({ status: "warning" })
                .eq("id", profile_id);

              if (updateProfileError) {
                console.error("Error updating profile:", updateProfileError);
                return res
                  .status(500)
                  .json({ message: "Error updating profile" });
              }
            }

            const { error: deleteReportsErrorPin } = await supabase
              .from("reports")
              .delete()
              .eq("reported_pin_id", reported_pin_id);

            if (deleteReportsErrorPin) {
              console.error(
                "Error deleting pin reports:",
                deleteReportsErrorPin
              );
              return res
                .status(500)
                .json({ message: "Error deleting pin reports" });
            }

            return res.status(200).json({
              message:
                "Pin deleted, user status updated to warning, and all reports deleted.",
              deletedPinData,
            });
          }
        }

        break;

      case "ban":
        if (reported_user_id) {
          const { data: userProfile, error: userProfileError } = await supabase
            .from("profile")
            .select("status")
            .eq("id", reported_user_id)
            .single();

          if (userProfileError) {
            console.error("Error fetching user profile:", userProfileError);
            return res
              .status(500)
              .json({ message: "Error fetching user profile" });
          }

          if (userProfile.status !== "banned") {
            const { error: updateUserError } = await supabase
              .from("profile")
              .update({ status: "banned" })
              .eq("id", reported_user_id);

            if (updateUserError) {
              console.error("Error banning user:", updateUserError);
              return res.status(500).json({ message: "Error banning user" });
            }
          }

          const { data: userPins, error: pinsFetchError } = await supabase
            .from("pins")
            .select("id")
            .eq("profile_id", reported_user_id);

          if (pinsFetchError) {
            console.error("Error fetching user's pins:", pinsFetchError);
            return res
              .status(500)
              .json({ message: "Error fetching user's pins" });
          }

          const { error: updatePinsError } = await supabase
            .from("pins")
            .update({ status: "banned" })
            .eq("profile_id", reported_user_id);

          if (updatePinsError) {
            console.error("Error banning user's pins:", updatePinsError);
            return res
              .status(500)
              .json({ message: "Error banning user's pins" });
          }

          const { error: deleteReportsErrorUser } = await supabase
            .from("reports")
            .delete()
            .eq("reported_user_id", reported_user_id);

          if (deleteReportsErrorUser) {
            console.error(
              "Error deleting user reports:",
              deleteReportsErrorUser
            );
            return res
              .status(500)
              .json({ message: "Error deleting user reports" });
          }

          return res.status(200).json({
            message:
              "User banned, all associated pins set to banned, and user reports deleted",
            userPins,
          });
        }

        if (reported_pin_id) {
          const { data: pinData, error: pinError } = await supabase
            .from("pins")
            .select("id, profile_id")
            .eq("id", reported_pin_id)
            .single();

          if (pinError) {
            console.error("Error fetching pin:", pinError);
            return res.status(500).json({ message: "Error fetching pin" });
          }

          if (pinData) {
            const { profile_id } = pinData;

            const { data: profileData, error: profileError } = await supabase
              .from("profile")
              .select("status")
              .eq("id", profile_id)
              .single();

            if (profileError) {
              console.error("Error fetching user profile:", profileError);
              return res
                .status(500)
                .json({ message: "Error fetching user profile" });
            }

            if (profileData.status !== "banned") {
              const { error: updateProfileError } = await supabase
                .from("profile")
                .update({ status: "banned" })
                .eq("id", profile_id);

              if (updateProfileError) {
                console.error("Error banning user:", updateProfileError);
                return res.status(500).json({ message: "Error banning user" });
              }
            }

            const { data: deletedPinData, error: deletePinError } =
              await supabase.from("pins").delete().eq("id", reported_pin_id);

            if (deletePinError) {
              console.error("Error deleting pin:", deletePinError);
              return res.status(500).json({ message: "Error deleting pin" });
            }

            const { error: deleteReportsErrorPin } = await supabase
              .from("reports")
              .delete()
              .eq("reported_pin_id", reported_pin_id);

            if (deleteReportsErrorPin) {
              console.error(
                "Error deleting pin reports:",
                deleteReportsErrorPin
              );
              return res
                .status(500)
                .json({ message: "Error deleting pin reports" });
            }

            const { error: updateAllPinsError } = await supabase
              .from("pins")
              .update({ status: "banned" })
              .eq("profile_id", profile_id);

            if (updateAllPinsError) {
              console.error(
                "Error banning all pins for user:",
                updateAllPinsError
              );
              return res
                .status(500)
                .json({ message: "Error banning user's pins" });
            }

            return res.status(200).json({
              message:
                "Pin deleted, user's profile and pins set to banned, and reports deleted",
              deletedPinData,
            });
          }
        }

        break;

      default:
        return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(500)
      .json({ message: "Failed to process request", error: error.message });
  }
});

module.exports = router;
