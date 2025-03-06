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
const KEEP_ALIVE_INTERVAL = (process.env.KEEP_ALIVE_INTERVAL || 432000) * 1000; // Default to 432000 seconds (5 days)

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
const TWO_DAYS = 1000 * 60 * 60 * 24 * 2;
app.use(
  session({
    name: SESSION_NAME,
    resave: true,
    rolling: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
      maxAge: TWO_DAYS,
      sameSite: "strict",
      secure: NODE_ENV,
      httpOnly: true,
    },
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Server is active!");
});

// Setup routes
setupRoutes(app);

// Call keepSupabaseActive function on startup
keepSupabaseActive(); 
// Set interval to call keepSupabaseActive based on KEEP_ALIVE_INTERVAL
setInterval(keepSupabaseActive, KEEP_ALIVE_INTERVAL);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
app.listen(PORT, () => console.log(`Listening on: http://${HOST}:${PORT}`));
