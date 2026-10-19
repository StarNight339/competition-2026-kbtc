// เรียกใช้ Library
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const multer = require('multer')

if (!process.env.JWT_KEY || process.env.JWT_KEY.length < 16) {
  console.error('ต้องตั้งค่า JWT_KEY ใน .env (ยาวอย่างน้อย 16 ตัวอักษร)')
  process.exit(1)
}

// ตั้งค่า
const app = express()
const origins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim())

// เรียกใช้งาน
app.use(cors({ origin: origins }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Route API : /api/user/...
app.use('/api', require('./route/user.rou'))

app.get('/api/health', (req, res) => res.json({ status: true }))

// ไม่พบเส้นทาง
app.use((req, res) => res.status(404).json({ status: false, message: 'Not found' }))

// จัดการ error กลาง (เช่น ไฟล์ upload ผิดประเภท / ใหญ่เกิน / JSON เสีย)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.startsWith('อนุญาตเฉพาะ')) {
    return res.status(400).json({ status: false, message: err.message })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: false, message: 'JSON ไม่ถูกต้อง' })
  }
  console.error(err)
  res.status(500).json({ status: false, message: 'Server error' })
})

// Server Run
const port = process.env.PORT_SERVER || 5000
app.listen(port, () => console.log('Server Running ' + port))
