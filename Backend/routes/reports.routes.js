const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const checkApiKey = require("../apiKeyCheck");

router.use(checkApiKey);

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Pins Route",
    routes: {
      "/all": "Get all reports",
      "/": "Create a new report",
      "/:id": "Delete a report by ID",
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

// Create a new report
router.post("/", async (req, res) => {
  const { profile_id, text } = req.body;

  try {
    const { data, error } = await supabase
      .from("reports")
      .insert([{ profile_id, text }]);

    if (error) throw error;
    res.status(201).json({ message: "Report created successfully", data });
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

module.exports = router;
