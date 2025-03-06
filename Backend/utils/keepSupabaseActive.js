const supabase = require("../supabaseClient");

// Function to keep Supabase active
const keepSupabaseActive = async () => {
  try {
    const { data, error } = await supabase.from("news").select("title").limit(1);
    if (error) {
      console.error("\nError keeping Supabase active:", error);
    } else {
      console.log("\nSupabase kept active");
    }
    console.log("Date:", new Date().toLocaleString());
  } catch (error) {
    console.error("\nError in keepSupabaseActive function:", error);
  }
};

module.exports = keepSupabaseActive;
