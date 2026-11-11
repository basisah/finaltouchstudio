/** Must run after the `auth` middleware — rejects any non-admin token. */
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ error: "Access denied. Admin role required." });
}

module.exports = isAdmin;
