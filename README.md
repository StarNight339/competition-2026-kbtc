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

### รันด้วย Docker

```bash
docker compose up -d --build
```

- Frontend: http://localhost:3000 · API: http://localhost:5000/api
- phpMyAdmin: http://localhost:8080 (user `root` รหัสผ่านเว้นว่าง)
- MySQL import `backend/database/db-kbtcweb.sql` ให้อัตโนมัติตอนรันครั้งแรก (ล้างข้อมูลด้วย `docker compose down -v`)
- ไม่ได้แก้โค้ดตามสไลด์: ทุก container ใช้ network เดียวกับ `db` (`network_mode: service:db`) จึงต่อ `127.0.0.1` ได้เหมือนรันเครื่องเดียว
- image ของ backend ติดตั้ง `bcrypt` เพิ่มให้ เพื่อเลี่ยง crash จากบั๊ก B1 ส่วนบั๊กอื่นยังอยู่ครบ (เช่น login บัญชีตัวอย่างไม่ได้ตาม B6)

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
