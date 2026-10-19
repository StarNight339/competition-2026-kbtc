const db = require('../config/db')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// คอลัมน์ที่ส่งกลับไปได้ — ไม่มี u_password เด็ดขาด
const PUBLIC_COLS = `u.u_id, u.u_username, u.u_firstname, u.u_lastname, u.u_address,
                     u.u_position, u.u_photo, u.u_level_id, l.level_name`
const FROM_JOIN = `FROM users u LEFT JOIN sys_levels l ON u.u_level_id = l.level_id`

const LEVEL = { Admin: 1, Staff: 2, User: 3 }

const fail = (res, error) => {
  console.error(error)
  res.status(500).json({ status: false, message: 'Server error' })
}

const findById = async (id) => {
  const [rows] = await db.query(`SELECT ${PUBLIC_COLS} ${FROM_JOIN} WHERE u.u_id = ?`, [id])
  return rows[0]
}

/* ---------- ทุก role: จัดการบัญชีตัวเอง (id มาจาก token เสมอ) ---------- */

// GET /api/user/me
exports.me = async (req, res) => {
  try {
    const user = await findById(req.user.id)
    if (!user) return res.status(404).json({ status: false, message: 'ไม่พบผู้ใช้' })
    res.json({ status: true, data: user })
  } catch (e) { fail(res, e) }
}

// PUT /api/user/me  — แก้ได้แค่ชื่อ นามสกุล ที่อยู่
exports.updateMe = async (req, res) => {
  try {
    const { u_firstname = null, u_lastname = null, u_address = null } = req.body || {}
    await db.query(
      'UPDATE users SET u_firstname = ?, u_lastname = ?, u_address = ? WHERE u_id = ?',
      [u_firstname, u_lastname, u_address, req.user.id]
    )
    res.json({ status: true, message: 'บันทึกข้อมูลส่วนตัวเรียบร้อย', data: await findById(req.user.id) })
  } catch (e) { fail(res, e) }
}

// PUT /api/user/me/password
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body || {}
    if (!old_password || !new_password) {
      return res.status(400).json({ status: false, message: 'กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่' })
    }
    if (new_password.length < 8) {
      return res.status(400).json({ status: false, message: 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร' })
    }

    const [rows] = await db.query('SELECT u_password FROM users WHERE u_id = ?', [req.user.id])
    if (!rows[0] || !(await bcrypt.compare(old_password, rows[0].u_password))) {
      return res.status(400).json({ status: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' })
    }

    const hash = await bcrypt.hash(new_password, 10)
    await db.query('UPDATE users SET u_password = ? WHERE u_id = ?', [hash, req.user.id])
    res.json({ status: true, message: 'เปลี่ยนรหัสผ่านเรียบร้อย' })
  } catch (e) { fail(res, e) }
}

// POST /api/user/me/photo  (form-data field: photo)
exports.changePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: false, message: 'กรุณาเลือกไฟล์รูป' })

    const [rows] = await db.query('SELECT u_photo FROM users WHERE u_id = ?', [req.user.id])
    const old = rows[0]?.u_photo

    const photo = `/uploads/${req.file.filename}`
    await db.query('UPDATE users SET u_photo = ? WHERE u_id = ?', [photo, req.user.id])

    // ลบรูปเก่าทิ้ง (เฉพาะไฟล์ในโฟลเดอร์ uploads)
    if (old?.startsWith('/uploads/')) {
      fs.unlink(path.join(__dirname, '..', old), () => {})
    }
    res.json({ status: true, message: 'เปลี่ยนรูปโปรไฟล์เรียบร้อย', data: { u_photo: photo } })
  } catch (e) { fail(res, e) }
}

/* ---------- จัดการผู้ใช้คนอื่น ---------- */

// GET /api/user/getall  (Admin, Staff)
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT ${PUBLIC_COLS} ${FROM_JOIN} ORDER BY u.u_id`)
    res.json({ status: true, total: rows.length, data: rows })
  } catch (e) { fail(res, e) }
}

// GET /api/user/getid/:id  (Admin, Staff ดูได้ทุกคน / User ดูได้แค่ตัวเอง)
exports.getId = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (req.user.role === 'User' && req.user.id !== id) {
      return res.status(403).json({ status: false, message: 'Forbidden' })
    }
    const user = await findById(id)
    if (!user) return res.status(404).json({ status: false, message: 'ไม่พบผู้ใช้' })
    res.json({ status: true, data: user })
  } catch (e) { fail(res, e) }
}

// GET /api/user/getlevels
exports.getLevels = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT level_id, level_name FROM sys_levels ORDER BY level_id')
    res.json({ status: true, data: rows })
  } catch (e) { fail(res, e) }
}

// GET /api/user/stats  (Admin, Staff) จำนวนผู้ใช้แยกตามระดับ ใช้ทำกราฟ
exports.stats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.level_id, l.level_name, COUNT(u.u_id) AS total
      FROM sys_levels l LEFT JOIN users u ON u.u_level_id = l.level_id
      GROUP BY l.level_id, l.level_name ORDER BY l.level_id`)
    res.json({ status: true, data: rows })
  } catch (e) { fail(res, e) }
}

// POST /api/user/create  (Admin, Staff)
exports.create = async (req, res) => {
  try {
    const { u_username, u_password, u_firstname = null, u_lastname = null,
            u_address = null, u_position = null, u_level_id } = req.body || {}

    if (!u_username || !u_password) {
      return res.status(400).json({ status: false, message: 'กรุณากรอก username และ password' })
    }
    if (u_password.length < 8) {
      return res.status(400).json({ status: false, message: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร' })
    }

    // Staff สร้างได้แค่ User — กันการสร้างบัญชี Admin
    const level = req.user.role === 'Admin' ? (Number(u_level_id) || LEVEL.User) : LEVEL.User

    const hash = await bcrypt.hash(u_password, 10)
    const [result] = await db.query(
      `INSERT INTO users (u_username, u_password, u_firstname, u_lastname, u_address, u_position, u_level_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [u_username, hash, u_firstname, u_lastname, u_address, u_position, level]
    )
    res.status(201).json({ status: true, message: 'เพิ่มผู้ใช้งานเรียบร้อยแล้ว', userId: result.insertId })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: false, message: 'username นี้มีผู้ใช้แล้ว' })
    }
    if (e.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ status: false, message: 'ระดับผู้ใช้ไม่ถูกต้อง' })
    }
    fail(res, e)
  }
}

// PUT /api/user/update/:id  (Admin เท่านั้น — แก้ได้ทุกช่องรวมระดับ)
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id)
    // ช่องที่ไม่ได้ส่งมา = คงค่าเดิมไว้ (COALESCE) / ส่ง '' มา = ล้างค่า
    const { u_firstname = null, u_lastname = null, u_address = null,
            u_position = null, u_level_id } = req.body || {}

    const level = u_level_id === undefined || u_level_id === '' ? null : Number(u_level_id)

    // กัน Admin ลดสิทธิ์ตัวเองจนไม่เหลือ Admin ในระบบ
    if (id === req.user.id && level !== null && level !== LEVEL.Admin) {
      return res.status(400).json({ status: false, message: 'ไม่สามารถลดสิทธิ์ของตัวเองได้' })
    }

    const [result] = await db.query(
      `UPDATE users SET u_firstname = COALESCE(?, u_firstname), u_lastname = COALESCE(?, u_lastname),
              u_address = COALESCE(?, u_address), u_position = COALESCE(?, u_position),
              u_level_id = COALESCE(?, u_level_id)
       WHERE u_id = ?`,
      [u_firstname, u_lastname, u_address, u_position, level, id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ status: false, message: 'ไม่พบผู้ใช้' })
    res.json({ status: true, message: 'User updated successfully' })
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ status: false, message: 'ระดับผู้ใช้ไม่ถูกต้อง' })
    }
    fail(res, e)
  }
}

// DELETE /api/user/delete/:id  (Admin เท่านั้น)
exports.delete = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (id === req.user.id) {
      return res.status(400).json({ status: false, message: 'ไม่สามารถลบบัญชีของตัวเองได้' })
    }
    const [result] = await db.query('DELETE FROM users WHERE u_id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ status: false, message: 'ไม่พบผู้ใช้' })
    res.json({ status: true, message: 'User deleted successfully' })
  } catch (e) { fail(res, e) }
}
