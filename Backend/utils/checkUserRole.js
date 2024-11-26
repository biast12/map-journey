// checkUserRole.js
const supabase = require("../supabaseClient");

const checkUserRole = (requiredRole) => {
  return async (req, res, next) => {
    const userID = req.params.id;

    if (!userID) {
      return res.status(401).send("Unauthorized: Missing user ID");
    }

    try {
      const { data: user, error } = await supabase
        .from("profile")
        .select("role")
        .eq("id", userID)
        .single();

      if (error || !user) {
        console.error("Error fetching user role:", error || "User not found");
        return res.status(401).send("Unauthorized: User not found");
      }

      if (user.role !== requiredRole && user.role !== "admin") {
        return res.status(403).send("Forbidden: Insufficient permissions");
      }

      next();
    } catch (err) {
      console.error("Authorization error:", err);
      res.status(500).send("Server error during authorization");
    }
  };
};

module.exports = checkUserRole;
