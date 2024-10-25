const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8101;

// Supabase Client Initialization
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// APP ----------------------------------------------------------------
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

// SESSION --------------------------------------------------------------
const session = require("express-session");

const TWO_DAYS = 1000 * 60 * 60 * 60 * 24 * 2;

app.use(
  session({
    name: process.env.SESSION_NAME || "server",
    resave: true,
    rolling: false,
    saveUninitialized: false,
    secret: process.env.SESS_SECRET,
    cookie: {
      maxAge: TWO_DAYS,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

// HEROKU
//app.set('trust proxy', 1); // trust first proxy

const formData = require('express-form-data');
app.use(formData.parse());

// ROUTES ----------------------------------------------------------

//  INDEX
app.get("/", async (req, res) => {
  console.log("Hey! this server is active!");
});

//  ROUTES -------------------------------------------
app.use("/globalmap", require("./routes/globalmap.routes.js"));
app.use("/ownmap", require("./routes/ownmap.routes.js"));
app.use("/users", require("./routes/users.routes.js"));
app.use("/notification", require("./routes/notification.routes.js"));
app.use("/pins", require("./routes/pins.routes.js"));

// LISTEN --------------------------------------------------------------------------------------------------
app.listen(PORT, () =>
  console.log(`listenng on port ${HOST}:${PORT}`)
);