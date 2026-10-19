// สร้าง/รีเซ็ตผู้ใช้ตัวอย่าง พร้อม hash รหัสผ่านจริง
// ใช้: npm run seed   (รหัสผ่านทุกคน = SEED_PASSWORD ใน .env)
require('dotenv').config()
const bcrypt = require('bcryptjs')
const db = require('../config/db')

const users = [
  ['admin',      'สมชาย',  'สายลุย',  '123 กทม.',        'System Admin',  1],
  ['staff_jane', 'เจนจิรา', 'ดีงาม',   '45/1 นนทบุรี',     'Manager',       2],
  ['user_boy',   'มานะ',   'อดทน',    '99 เชียงใหม่',     'General Staff', 3]
]

;(async () => {
  const password = process.env.SEED_PASSWORD || 'Kbtc@2026'
  const hash = await bcrypt.hash(password, 10)

  for (const [username, first, last, address, position, level] of users) {
    await db.query(
      `INSERT INTO users (u_username, u_password, u_firstname, u_lastname, u_address, u_position, u_level_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE u_password = VALUES(u_password)`,
      [username, hash, first, last, address, position, level]
    )
    console.log('✓', username)
  }
  console.log(`\nรหัสผ่านของทุกบัญชี: ${password}`)
  await db.end()
})().catch((e) => { console.error(e.message); process.exit(1) })
