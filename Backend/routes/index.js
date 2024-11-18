const notification = require("./notification.routes.js");
const pins = require("./pins.routes.js");
const settings = require("./settings.routes.js");
const users = require("./users.routes.js");
const reports = require("./reports.routes.js");

module.exports = (app) => {
  app.use("/notification", notification);
  app.use("/pins", pins);
  app.use("/reports", reports);
  app.use("/settings", settings);
  app.use("/users", users);
};