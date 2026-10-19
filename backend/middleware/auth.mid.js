const jwt = require("jsonwebtoken");

module.exports = (roles = []) => (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const token = header.slice(7);
    const user = jwt.verify(token, process.env.JWT_KEY);

    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    req.user = user;
    next();

  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

};
