const express = require('express')
const rateLimit = require('express-rate-limit')
const r = express.Router()
const cu = require('../controller/user.con')
const ca = require('../controller/auth.con')
const auth = require('../middleware/auth.mid')
const upload = require('../middleware/upload.mid')

// กันเดารหัสผ่าน: login ผิดได้ไม่เกิน 10 ครั้งต่อ 15 นาทีต่อ IP
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { status: false, message: 'ลองเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่' }
})

const ALL = ['Admin', 'Staff', 'User']

// เข้าสู่ระบบ (public)
r.post('/user/login', loginLimit, ca.login)

// บัญชีของตัวเอง — id มาจาก token ไม่รับจาก URL
r.get('/user/me', auth(ALL), cu.me)
r.put('/user/me', auth(ALL), cu.updateMe)
r.put('/user/me/password', auth(ALL), cu.changePassword)
r.post('/user/me/photo', auth(ALL), upload.single('photo'), cu.changePhoto)

// ดูข้อมูลผู้ใช้
r.get('/user/getall', auth(['Admin', 'Staff']), cu.getAll)
r.get('/user/getid/:id', auth(ALL), cu.getId) // User ดูได้แค่ id ตัวเอง (เช็คใน controller)
r.get('/user/getlevels', auth(ALL), cu.getLevels)
r.get('/user/stats', auth(['Admin', 'Staff']), cu.stats)

// จัดการผู้ใช้
r.post('/user/create', auth(['Admin', 'Staff']), cu.create) // Staff สร้างได้แค่ User
r.put('/user/update/:id', auth(['Admin']), cu.update)
r.delete('/user/delete/:id', auth(['Admin']), cu.delete)

module.exports = r
