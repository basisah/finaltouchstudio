const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_dev_secret");
    req.user = decoded;
  } catch (_) {
    // Invalid token — proceed as guest
  }

  next();
};

module.exports = optionalAuth;
