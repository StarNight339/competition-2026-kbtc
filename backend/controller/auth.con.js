const db = require('../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// POST /api/user/login
exports.login = async (req, res) => {
  try {
    const { u_username, u_password } = req.body || {}
    if (!u_username || !u_password) {
      return res.status(400).json({ status: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' })
    }

    const sql = `SELECT u.u_id, u.u_username, u.u_password, l.level_name
                 FROM users u LEFT JOIN sys_levels l ON u.u_level_id = l.level_id
                 WHERE u.u_username = ?`
    const [rows] = await db.query(sql, [u_username])
    const user = rows[0]

    // bcrypt.compare รับรหัสผ่านดิบได้เลย ไม่ต้อง hash ก่อนเทียบ
    if (!user || !(await bcrypt.compare(u_password, user.u_password))) {
      return res.status(401).json({ status: false, message: 'Username หรือ Password ไม่ถูกต้อง' })
    }

    const token = jwt.sign(
      { id: user.u_id, username: user.u_username, role: user.level_name },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXPIRES || '1h' }
    )
    res.json({ status: true, message: 'Login Success', token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: false, message: 'Server error' })
  }
}
