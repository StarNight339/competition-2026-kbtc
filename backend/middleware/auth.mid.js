const jwt = require('jsonwebtoken')

// ตรวจ token และ role
// auth()                      -> ต้อง login อย่างเดียว
// auth(['Admin', 'Staff'])    -> ต้อง login และเป็น role ที่กำหนด
module.exports = (roles = []) => (req, res, next) => {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'Unauthorized' })
  }

  try {
    const user = jwt.verify(header.slice(7), process.env.JWT_KEY)

    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ status: false, message: 'Forbidden' })
    }

    req.user = user // { id, username, role }
    next()
  } catch {
    return res.status(401).json({ status: false, message: 'Invalid or expired token' })
  }
}
