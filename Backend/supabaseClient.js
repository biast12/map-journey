// supabaseClient.js
require('dotenv').config(); // Load environment variables from .env file
const { createClient } = require("@supabase/supabase-js");

// Create a Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = supabase; // Export the client for use in other files
