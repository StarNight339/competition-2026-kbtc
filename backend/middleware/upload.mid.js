const multer = require('multer')
const path = require('path')
const fs = require('fs')

const dir = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(dir, { recursive: true })

const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }

const storage = multer.diskStorage({
  destination: dir,
  // ตั้งชื่อไฟล์เอง ไม่ใช้ชื่อที่ผู้ใช้ส่งมา กันชื่อไฟล์แปลกหรือ path traversal
  filename: (req, file, cb) => cb(null, `u${req.user.id}-${Date.now()}${ALLOWED[file.mimetype]}`)
})

module.exports = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED[file.mimetype]) return cb(null, true)
    cb(new Error('อนุญาตเฉพาะไฟล์ JPG, PNG, WEBP'))
  }
})
