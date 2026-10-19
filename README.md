# KBTC Competition 2026 — Old Version

Branch นี้เก็บ **เวอร์ชันเก่าตามสไลด์ต้นฉบับ** ไว้อ้างอิง โค้ดเขียนตามที่แสดงในสไลด์ (รวมบั๊กเดิม)
เวอร์ชันที่แก้แล้วอยู่ที่ branch [`main`](../../tree/main)

## ไฟล์ต้นฉบับ (PDF)

| ไฟล์ | เนื้อหา |
|---|---|
| [`docs/BASIC_BACKEND_v2.pdf`](docs/BASIC_BACKEND_v2.pdf) | Backend: Express + MySQL + JWT |
| [`docs/frontend.pdf`](docs/frontend.pdf) | Frontend: Nuxt + layouts + useApi |
| [`docs/Network.pdf`](docs/Network.pdf) | Network: MikroTik, Cisco, AP |

## โครงสร้าง

```
backend/     server.js, config/db.js, controller/, middleware/auth.mid.js, route/user.rou.js
             database/db-kbtcweb.sql (ตาราง + ข้อมูลตัวอย่างตามสไลด์)
frontend/    app/ (pages, components, layouts, composables) ตามสไลด์
network/     สรุปขั้นตอนตั้งค่าจากสไลด์
docs/        PDF ต้นฉบับ
```

## รัน

```bash
cd backend && npm install && cp .env.example .env && npm run dev
cd frontend && npm install && npm run dev
```

## ปัญหาที่รู้อยู่ในเวอร์ชันนี้ (แก้แล้วใน `main`)

รายละเอียดเต็มพร้อมตำแหน่งในโค้ดและวิธีแก้อยู่ที่ [`bug-check.md`](bug-check.md)

- ติดตั้ง `bcryptjs` แต่โค้ด `require('bcrypt')` → server เริ่มไม่ได้จนกว่าจะ `npm install bcrypt`
- ข้อมูลตัวอย่างใน DB ไม่ได้ hash รหัสผ่าน → login บัญชีตัวอย่างไม่ได้
- response ส่ง `u_password` กลับไปด้วย
- User เรียก `update/:id` แล้วส่ง `u_level_id: 1` ได้ → เลื่อนตัวเองเป็น Admin
- User ดู/แก้ข้อมูลของ id อื่นได้ (IDOR), Staff สร้างบัญชี Admin ได้
- Frontend: cookie ชื่อไม่ตรงกัน (`auth_token` กับ `token`) → logout ไม่ล้าง token
- Frontend: login ยังไม่เรียก API, ไม่มี middleware กันหน้า, ชื่อใน Navbar เขียนตายตัว
- `user.con.js` ในสไลด์แสดงไม่ครบ ส่วน `getLevels`, `update`, `delete` เขียนต่อให้ตรงกับผลทดสอบใน Postman
