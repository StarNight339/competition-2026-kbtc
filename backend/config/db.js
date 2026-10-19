const mysql = require('mysql2/promise')

// ค่าเชื่อมต่ออ่านจาก .env ไม่เขียนรหัสผ่านไว้ในโค้ด
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db-kbtcweb',
  waitForConnections: true,
  connectionLimit: 10
})

module.exports = db
