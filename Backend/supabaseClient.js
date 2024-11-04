// supabaseClient.js
require("dotenv").config(); // Load environment variables from .env file
const { createClient } = require("@supabase/supabase-js");

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

// Supabase Client
let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
  console.error("Error initializing Supabase client:", error);
  process.exit(1);
}

module.exports = supabase;
