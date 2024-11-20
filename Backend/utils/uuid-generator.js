const supabase = require("../supabaseClient");
const crypto = require("crypto");

const generateUniqueId = async () => {
  let uniqueId;
  let exists = true;

  while (exists) {
    uniqueId = crypto.randomUUID();

    // Check if the ID exists in the `profile` table
    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("id")
      .eq("id", uniqueId)
      .single();

    // Check if the ID exists in the `pins` table
    const { data: pinsData, error: pinsError } = await supabase
      .from("pins")
      .select("id")
      .eq("id", uniqueId)
      .single();

    // Check if the ID exists in the `settings` table
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .select("id")
      .eq("id", uniqueId)
      .single();

    exists =
      profileData !== null || pinsData !== null || settingsData !== null;

    // Handle errors during the checks
    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error checking profile table:", profileError);
      throw new Error("Error checking profile table");
    }

    if (pinsError && pinsError.code !== "PGRST116") {
      console.error("Error checking pins table:", pinsError);
      throw new Error("Error checking pins table");
    }

    if (settingsError && settingsError.code !== "PGRST116") {
      console.error("Error checking settings table:", settingsError);
      throw new Error("Error checking settings table");
    }
  }

  return uniqueId;
};

module.exports = generateUniqueId;
