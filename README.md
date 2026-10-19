# KBTC Competition 2026

ระบบจัดการผู้ใช้งานแบบแบ่งสิทธิ์ (Admin / Staff / User) สำหรับงานแข่งขัน
ประกอบด้วย 3 ส่วน:

| โฟลเดอร์ | เทคโนโลยี | หน้าที่ |
|---|---|---|
| [`backend/`](backend) | Node.js, Express, MySQL, JWT, bcryptjs, multer | REST API + ระบบ login / สิทธิ์ |
| [`frontend/`](frontend) | Nuxt 4, Vue 3, Chart.js | หน้าเว็บ login, ตั้งค่าบัญชี, จัดการผู้ใช้ |
| [`network/`](network) | MikroTik hAP lite, Cisco CBS350 | VLAN, DHCP, NAT, Firewall |

---

## เริ่มใช้งาน (เครื่องตัวเอง)

### 1. ฐานข้อมูล
เปิด phpMyAdmin → แท็บ SQL → วางไฟล์ [`backend/database/schema.sql`](backend/database/schema.sql) แล้วกด Go

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # แก้ DB_PASSWORD และ JWT_KEY
npm run seed              # สร้างผู้ใช้ตัวอย่าง (รหัสผ่านจริงถูก hash)
npm run dev               # http://127.0.0.1:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
```

### บัญชีทดสอบ (หลัง `npm run seed`)

| Username | Role | Password |
|---|---|---|
| admin | Admin | ค่า `SEED_PASSWORD` ใน `.env` (เริ่มต้น `Kbtc@2026`) |
| staff_jane | Staff | 〃 |
| user_boy | User | 〃 |

---

## API

Base URL: `http://127.0.0.1:5000/api` — ส่ง token ใน header `Authorization: Bearer <token>`

| Method | URL | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| POST | `/user/login` | ทุกคน | เข้าสู่ระบบ รับ token (จำกัด 10 ครั้งผิด / 15 นาที) |
| GET | `/user/me` | ทุก role | ข้อมูลของตัวเอง |
| PUT | `/user/me` | ทุก role | แก้ชื่อ นามสกุล ที่อยู่ ของตัวเอง |
| PUT | `/user/me/password` | ทุก role | เปลี่ยนรหัสผ่าน (`old_password`, `new_password`) |
| POST | `/user/me/photo` | ทุก role | อัปโหลดรูป (form-data `photo`, JPG/PNG/WEBP ≤ 2MB) |
| GET | `/user/getall` | Admin, Staff | ผู้ใช้ทั้งหมด |
| GET | `/user/getid/:id` | ทุก role | Admin/Staff ดูได้ทุกคน, User ดูได้แค่ตัวเอง |
| GET | `/user/getlevels` | ทุก role | รายการระดับผู้ใช้ |
| GET | `/user/stats` | Admin, Staff | จำนวนผู้ใช้แยกตามระดับ (ใช้ทำกราฟ) |
| POST | `/user/create` | Admin, Staff | เพิ่มผู้ใช้ — Staff สร้างได้แค่ระดับ User |
| PUT | `/user/update/:id` | Admin | แก้ข้อมูล/ระดับผู้ใช้ (ช่องที่ไม่ส่ง = คงค่าเดิม) |
| DELETE | `/user/delete/:id` | Admin | ลบผู้ใช้ (ลบตัวเองไม่ได้) |

ทุก response ใช้รูปแบบเดียวกัน: `{ "status": true|false, "message": "...", "data": ... }`

---

## สิ่งที่แก้จากเอกสารต้นฉบับ

**Backend**
- ใช้ `bcryptjs` ให้ตรงกับที่ติดตั้ง (เดิม require `bcrypt` แล้ว crash)
- ไม่ส่ง `u_password` กลับใน response ใดๆ
- แยก `/user/me` ให้แก้ข้อมูลตัวเองได้เฉพาะชื่อ/นามสกุล/ที่อยู่ — **User เลื่อนตัวเองเป็น Admin ไม่ได้**
- User ดู/แก้ข้อมูลคนอื่นไม่ได้ (กัน IDOR), Staff สร้างบัญชี Admin ไม่ได้
- เพิ่ม API เปลี่ยนรหัสผ่าน และอัปโหลดรูป (ใช้ multer ที่ติดตั้งไว้)
- ค่า DB / JWT อ่านจาก `.env`, มี rate limit ที่ login, error ไม่เปิดเผยรายละเอียด SQL
- ตอบ 404 เมื่อแก้/ลบ id ที่ไม่มี, ตอบ 409 เมื่อ username ซ้ำ
- `npm run seed` สร้างผู้ใช้ตัวอย่างที่ hash รหัสผ่านจริง (ข้อมูลในสไลด์ login ไม่ได้)

**Frontend**
- ไฟล์ทั้งหมดอยู่ใน `app/` ตามโครงสร้าง Nuxt 4
- ชื่อ cookie ใช้จุดเดียวใน `useAuth()` — logout ล้าง token จริง (เดิมชื่อ cookie ไม่ตรงกัน)
- login เรียก API จริง, ไม่ log รหัสผ่าน
- `middleware/auth.global.ts` บังคับ login และเช็ค role ต่อหน้า
- Navbar แสดงชื่อ/role จาก JWT (ใช้ `jwt-decode`) แทนข้อความตายตัว
- token หมดอายุ (401) → ล้าง cookie และกลับหน้า login อัตโนมัติ
- หน้าตั้งค่าบัญชีทั้ง 4 หน้าใช้งานได้จริง + หน้าจัดการผู้ใช้ + กราฟสถิติ (Chart.js)
- footer ไม่ทับเนื้อหาอีก, ใช้งานบนมือถือได้

**Network** — ดู [`network/README.md`](network/README.md)

---

## Deploy บน Production Server (Docker)

```bash
cp .env.example .env            # ตั้ง SERVER_IP, DB_PASSWORD, JWT_KEY
docker compose up -d --build
docker compose exec backend npm run seed
```
เปิด `http://<SERVER_IP>:3000`

## โครงสร้าง

```
backend/
  config/db.js              เชื่อมต่อฐานข้อมูล (อ่านค่าจาก .env)
  controller/auth.con.js    login
  controller/user.con.js    CRUD + บัญชีของตัวเอง
  middleware/auth.mid.js    ตรวจ token และ role
  middleware/upload.mid.js  อัปโหลดรูป
  route/user.rou.js         เส้นทาง API + สิทธิ์
  database/schema.sql       สร้างตาราง
  scripts/seed.js           สร้างผู้ใช้ตัวอย่าง
frontend/app/
  composables/useAuth.ts    token, user จาก JWT, logout
  composables/useApi.ts     get / post / put / del / upload
  middleware/auth.global.ts กันหน้าที่ต้อง login / role
  layouts/                  default, empty, account
  components/               AppNavbar, AppFooter, UserAvatar
  pages/                    index, login, users, account/*
network/
  mikrotik-hap-lite.rsc     สคริปต์ตั้งค่า MikroTik
  cisco-cbs350.txt          คำสั่งตั้งค่า Cisco
```
