const express = require("express");
require("dotenv").config();
const cors = require("cors");
const session = require("express-session");
const formData = require("express-form-data");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const setupRoutes = require("./routes");
const keepSupabaseActive = require("./utils/keepSupabaseActive");

// Initialize Express app
const app = express();

// Environment variables
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8101;
const SESS_SECRET = process.env.SESS_SECRET || "SESS_SECRET";
const SESSION_NAME = process.env.SESSION_NAME || "server";
const NODE_ENV = process.env.NODE_ENV || "production";
const COOKIE_AGE = (process.env.COOKIE_AGE || 2) * 1000 * 60 * 60 * 24; // Default: 2 days
const KEEP_SUPABASE_ACTIVE = (process.env.KEEP_SUPABASE_ACTIVE || 86400) * 1000; // Default to 86400 seconds (1 days)

// Middleware
app.use(helmet());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/documentation", express.static("documentation"));
app.use(formData.parse());
app.use(compression());
app.use(morgan(":method :url :status - :response-time ms"));

// Session configuration
app.use(
  session({
    name: SESSION_NAME,
    resave: true,
    rolling: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
      maxAge: COOKIE_AGE,
      sameSite: "strict",
      secure: NODE_ENV,
      httpOnly: true,
    },
  })
);

// Middleware to keep Supabase active on every request (Render workaround)
app.use((req, res, next) => {
  keepSupabaseActive();
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Server is active!");
});

// Setup routes
setupRoutes(app);

// Call keepSupabaseActive function on startup
keepSupabaseActive(); 
// Set interval to call keepSupabaseActive based on KEEP_SUPABASE_ACTIVE
setInterval(keepSupabaseActive, KEEP_SUPABASE_ACTIVE);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
app.listen(PORT, () => console.log(`Listening on: http://${HOST}:${PORT}`));
