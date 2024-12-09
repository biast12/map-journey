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

      if (error) {
        if (error.code === "PGRST116") {
          return res.status(401).send("Unauthorized: User not found");
        }
        console.error("Error fetching user role:", error);
        return res.status(500).send("Server error during authorization");
      }

      if (!user) {
        return res.status(401).send("Unauthorized: User not found");
      }

      if (user.role === "admin" || (user.role === "user" && requiredRole === "user")) {
        return next();
      }

      return res.status(403).send("Forbidden: Insufficient permissions");

    } catch (err) {
      console.error("Authorization error:", err);
      return res.status(500).send("Server error during authorization");
    }
  };
};

module.exports = checkUserRole;
