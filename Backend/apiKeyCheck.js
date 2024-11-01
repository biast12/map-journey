
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(403).send("Forbidden: Invalid API key");
  }

  next();
};

module.exports = checkApiKey;
