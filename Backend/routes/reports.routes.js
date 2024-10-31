const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");


// Root route
router.get("/", (req, res) => {
    res.json({
        message: "Pins Route",
        routes: {
            "/create": "Create a new report",
            "/delete/:id": "Delete a report by ID"
        }
    });
});


// POST /create - Create a new report
router.post("/create", async (req, res) => {
    const { profile_id, text } = req.body;

    try {
        const { data, error } = await supabase
            .from("reports")
            .insert([{ profile_id, text }]); // No need to include 'date'

        if (error) throw error;
        res.status(201).json({ message: "Report created successfully", data });
    } catch (error) {
        res.status(500).json({ message: "Failed to create report", error: error.message });
    }
});


// DELETE /delete/:id - Delete a report by ID
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from("reports")
            .delete()
            .eq("id", id);

        if (error) throw error;
        res.status(200).json({ message: "Report deleted successfully", data });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete report", error: error.message });
    }
});

module.exports = router;
