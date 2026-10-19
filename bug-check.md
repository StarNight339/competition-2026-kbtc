# Bug Check — Old Version

ตรวจโค้ดใน branch `old-version` (โค้ดตามสไลด์ต้นฉบับ) ทุกข้อแก้แล้วใน branch `main`

**ระดับความรุนแรง**
- 🔴 **Critical**: ระบบพัง หรือถูกยึดสิทธิ์ได้
- 🟠 **High**: ข้อมูลรั่ว หรือฟีเจอร์หลักใช้ไม่ได้
- 🟡 **Medium**: ความปลอดภัยหรือความถูกต้องที่ควรแก้
- ⚪ **Low**: ความเรียบร้อยของโค้ด

## สรุป

| # | ระดับ | ส่วน | ปัญหา |
|---|---|---|---|
| B1 | 🔴 | Backend | `require('bcrypt')` แต่ติดตั้ง `bcryptjs` → server เริ่มไม่ได้ |
| B2 | 🔴 | Backend | User เลื่อนตัวเองเป็น Admin ผ่าน `update/:id` |
| B3 | 🔴 | Backend | Staff สร้างบัญชี Admin ได้ |
| B4 | 🟠 | Backend | IDOR: User ดู/แก้ข้อมูลของ id อื่นได้ |
| B5 | 🟠 | Backend | ส่ง `u_password` (hash) กลับใน response |
| B6 | 🟠 | Database | ข้อมูลตัวอย่างไม่ได้ hash → login บัญชีตัวอย่างไม่ได้ |
| B7 | 🟡 | Backend | `JWT_KEY` เดาง่าย และค่า DB เขียนตายตัวในโค้ด |
| B8 | 🟡 | Backend | ส่ง `error.message` ของ SQL กลับให้ client |
| B9 | 🟡 | Backend | ไม่ตรวจ input ที่จำเป็น (body ว่างแล้ว error 500) |
| B10 | 🟡 | Backend | แก้/ลบ/ดู id ที่ไม่มีอยู่ แต่ยังตอบว่าสำเร็จ |
| B11 | 🟡 | Backend | `update` ล้างค่าช่องที่ไม่ได้ส่งมาเป็น NULL |
| B12 | 🟡 | Backend | Login ไม่มี rate limit (โดนเดารหัสผ่านได้) |
| B13 | 🟡 | Backend | Admin ลบหรือลดสิทธิ์ตัวเองได้ |
| B14 | ⚪ | Backend | รูปแบบ response ไม่ตรงกัน (`success` กับ `status`) |
| B15 | ⚪ | Backend | ฟีเจอร์ในตารางสิทธิ์ยังไม่มี API (เปลี่ยนรหัสผ่าน, รูป) |
| F1 | 🔴 | Frontend | ชื่อ cookie ไม่ตรงกัน → logout ไม่ล้าง token |
| F2 | 🟠 | Frontend | Login ไม่เรียก API และ `console.log` รหัสผ่าน |
| F3 | 🟠 | Frontend | ไม่มี middleware → เข้าหน้า `/account/*` ได้โดยไม่ login |
| F4 | 🟡 | Frontend | ชื่อและ role ใน Navbar เขียนตายตัว |
| F5 | 🟡 | Frontend | token หมดอายุ (401) แล้วไม่พากลับหน้า login |
| F6 | ⚪ | Frontend | ลิงก์ `/all` ไม่มีหน้า → 404 |
| F7 | ⚪ | Frontend | footer `position: fixed` ทับเนื้อหา |
| F8 | ⚪ | Frontend | `apiBase` เขียนตายตัว |
| N1 | 🔴 | Network | แผน IP กับภาพหน้าจอไม่ตรงกัน |
| N2 | 🔴 | Network | ใช้ `ether5` แต่ hAP lite มีแค่ ether1–4 |
| N3 | 🟠 | Network | ไม่มีขั้นตอนตั้งค่า WAN และ default route |
| N4 | 🟠 | Network | ไม่มี Firewall + เปิด DNS remote → open resolver |
| N5 | 🟠 | Network | AP ใช้ gateway `0.0.0.0` และ IP อยู่ใน DHCP pool |
| N6 | 🟡 | Network | ระบุ DHCP Snooping แต่ไม่ได้ตั้งค่า (และต้องตั้ง trusted port) |
| N7 | 🟡 | Network | ไม่ได้เปลี่ยนรหัสผ่านค่าเริ่มต้นของอุปกรณ์ |

---

## Backend

### B1 🔴 `bcrypt` กับ `bcryptjs` ไม่ตรงกัน
- **ที่**: `backend/controller/auth.con.js:3`, `backend/controller/user.con.js:2`
- **อาการ**: รัน `npm run dev` แล้ว crash ทันที (ทดสอบแล้ว)
  ```
  Error: Cannot find module 'bcrypt'
  ```
- **สาเหตุ**: สไลด์ติดตั้ง `bcryptjs` แต่โค้ดเรียก `require('bcrypt')` ซึ่งเป็นคนละแพ็กเกจ
- **แก้**: `const bcrypt = require('bcryptjs')`

### B2 🔴 User เลื่อนตัวเองเป็น Admin
- **ที่**: `backend/route/user.rou.js:24`, `backend/controller/user.con.js:84-88`
- **อาการ**: route `update/:id` อนุญาต role User และรับ `u_level_id` จาก body โดยไม่กรอง
- **ทดสอบ**: login ด้วยบัญชี User แล้วส่ง
  ```
  PUT /api/user/update/3
  { "u_level_id": 1 }
  ```
  login ใหม่อีกครั้งจะได้ token ที่ role เป็น `Admin`
- **แก้**: ให้ `update/:id` เป็นของ Admin อย่างเดียว แล้วแยก `PUT /user/me` ที่รับแค่ชื่อ นามสกุล และที่อยู่ โดยใช้ id จาก token

### B3 🔴 Staff สร้างบัญชี Admin ได้
- **ที่**: `backend/controller/user.con.js:71`
- **อาการ**: `u_level_id || 3` เอาค่าจาก body มาใช้ตรงๆ Staff จึงส่ง `"u_level_id": 1` ได้
- **แก้**: ถ้าผู้เรียกไม่ใช่ Admin ให้บังคับเป็น 3
  ```js
  const level = req.user.role === 'Admin' ? (u_level_id || 3) : 3
  ```

### B4 🟠 IDOR: เข้าถึงข้อมูลของคนอื่น
- **ที่**: `backend/route/user.rou.js:14,24`
- **อาการ**: User ที่มี id 3 เรียก `getid/1` หรือ `update/1` ได้ ทั้งที่ตารางสิทธิ์ให้เฉพาะ "ข้อมูลส่วนตัว"
- **แก้**: เช็คใน controller
  ```js
  if (req.user.role === 'User' && req.user.id !== Number(req.params.id)) return res.status(403)...
  ```

### B5 🟠 ส่ง password hash กลับไปให้ client
- **ที่**: `backend/controller/user.con.js:12,32` (`SELECT u.*`)
- **อาการ**: `getall` และ `getid` มี `u_password` อยู่ใน response (เห็นได้ในภาพ Postman ของสไลด์)
- **แก้**: ระบุคอลัมน์ที่ต้องการเองแทน `u.*`

### B6 🟠 ข้อมูลตัวอย่างไม่ได้ hash
- **ที่**: `backend/database/db-kbtcweb.sql` (`hash_password_123` ฯลฯ)
- **อาการ**: `bcrypt.compare` ได้ผลเป็น false เสมอ บัญชี admin01, staff_jane และ user_boy จึง login ไม่ได้ ระบบจะเริ่มใช้งานได้ก็ต่อเมื่อมี Admin อยู่แล้ว ซึ่งยังไม่มีใคร login ได้สักคน
- **แก้**: สคริปต์ seed ที่ hash รหัสผ่านก่อน insert (`npm run seed` ใน `main`)
- **หมายเหตุ**: ในสไลด์มีข้อความว่า "ต้องเข้ารหัสก่อนนำไปเช็ค" ซึ่งไม่ถูกต้อง เพราะ `bcrypt.compare(plain, hash)` รับรหัสผ่านดิบได้เลย ถ้าเอาไป hash ใหม่ก่อนเทียบจะไม่มีวันตรง เพราะ salt สุ่มใหม่ทุกครั้ง

### B7 🟡 ค่าลับและ config
- **ที่**: `backend/.env.example` (`JWT_KEY = 'kbtc@1234'`), `backend/config/db.js:5-6`
- **อาการ**: key สั้นและเดาง่าย ใครรู้ key ก็ปลอม token เป็น Admin ได้ ส่วน user/password ของ DB เขียนอยู่ในโค้ด
- **แก้**: ใช้ key สุ่มยาว 32 ตัวขึ้นไป อ่านค่า DB จาก `.env` และใส่ `.env` ไว้ใน `.gitignore`

### B8 🟡 เปิดเผย error ภายใน
- **ที่**: ทุก `catch` ใน controller (`error: error.message`)
- **อาการ**: เช่นสมัคร username ซ้ำ จะได้ข้อความ `Duplicate entry 'x' for key ...` ออกไปพร้อมสถานะ 500
- **แก้**: log ไว้ฝั่ง server แล้วตอบข้อความทั่วไป ส่วนกรณี username ซ้ำให้ตอบ 409

### B9 🟡 ไม่ตรวจ input
- **ที่**: `backend/controller/user.con.js:57-62`, `auth.con.js:7`
- **อาการ**: ส่ง body ว่างไปที่ `create` จะเกิด `bcrypt.hash(undefined)` แล้ว error 500 และไม่มีการกำหนดความยาวขั้นต่ำของรหัสผ่าน
- **แก้**: เช็คช่องที่จำเป็นแล้วตอบ 400

### B10 🟡 ตอบว่าสำเร็จแม้ไม่มีข้อมูล
- **ที่**: `backend/controller/user.con.js:38` (getId), `update`, `delete`
- **อาการ**: `getid/999` ตอบ `{ status: true }` แต่ไม่มี `data` ส่วน `delete/999` ก็ตอบ "deleted successfully"
- **แก้**: เช็ค `rows.length` หรือ `result.affectedRows === 0` แล้วตอบ 404

### B11 🟡 `update` ล้างช่องที่ไม่ได้ส่ง
- **ที่**: `backend/controller/user.con.js:86-88`
- **อาการ**: ส่งมาแค่ `{ "u_position": "x" }` ชื่อ นามสกุล ที่อยู่ และระดับจะกลายเป็น NULL ทั้งหมด
- **แก้**: ใช้ `COALESCE(?, column)` เพื่อคงค่าเดิมไว้เมื่อไม่ได้ส่งช่องนั้นมา

### B12 🟡 Login ไม่มี rate limit
- **ที่**: `backend/route/user.rou.js:8`
- **แก้**: ใช้ `express-rate-limit` เช่น ผิดได้ 10 ครั้งต่อ 15 นาที

### B13 🟡 Admin ลบหรือลดสิทธิ์ตัวเองได้
- **ที่**: `update`, `delete`
- **อาการ**: ระบบอาจไม่เหลือ Admin เลย
- **แก้**: ห้ามเมื่อ `id === req.user.id`

### B14 ⚪ รูปแบบ response ไม่สม่ำเสมอ
- **ที่**: `backend/middleware/auth.mid.js:7,15,22` ใช้ `success` แต่ controller ใช้ `status`
- **แก้**: ใช้ `status` ทุกที่

### B15 ⚪ API ที่ยังขาด
- ตารางสิทธิ์ในสไลด์มี "เปลี่ยนรหัสผ่าน" และหน้า frontend มี "เปลี่ยนรูปโปรไฟล์" แต่ไม่มี route รองรับ และตาราง `users` ไม่มีคอลัมน์รูป
- `multer` ติดตั้งไว้แต่ไม่ได้ใช้ ส่วน `nodemon` ควรเป็น devDependency

---

## Frontend

### F1 🔴 cookie ชื่อไม่ตรงกัน
- **ที่**: `frontend/app/components/AppNavbar.vue:20` (`auth_token`) กับ `frontend/app/composables/useApi.ts:3` (`token`)
- **อาการ**: กดออกจากระบบแล้ว token ที่ใช้เรียก API ยังอยู่ ผู้ใช้จึงไม่ได้ออกจากระบบจริง
- **แก้**: รวมการจัดการ cookie ไว้ที่ composable เดียว (`useAuth()`)

### F2 🟠 Login ไม่ทำงานจริง
- **ที่**: `frontend/app/pages/login.vue:35`
- **อาการ**: ไม่ได้เรียก `/user/login` และ `console.log` รหัสผ่านลงใน console
- **แก้**: เรียก `api.post('/user/login')` เก็บ token ลง cookie แล้วพาไปหน้าแรก และลบ `console.log` ออก

### F3 🟠 ไม่มีการกันหน้า
- **ที่**: `frontend/app/middleware/` (ว่างเปล่า)
- **อาการ**: เปิด `/account/profile` ได้โดยไม่ต้อง login
- **แก้**: เพิ่ม `middleware/auth.global.ts` ที่เช็ค token และ role (การกันฝั่งหน้าเว็บมีไว้เพื่อ UX เท่านั้น ความปลอดภัยจริงอยู่ที่ backend)

### F4 🟡 Navbar เขียนชื่อตายตัว
- **ที่**: `frontend/app/components/AppNavbar.vue:10` (`ศรัญญู (Admin)`)
- **แก้**: ใช้ `jwt-decode` อ่าน `username` และ `role` จาก token (ติดตั้งไว้แล้วแต่ยังไม่ได้ใช้)

### F5 🟡 ไม่จัดการ token หมดอายุ
- **ที่**: `frontend/app/composables/useApi.ts`
- **อาการ**: หลังผ่านไป 1 ชั่วโมง ทุก request ได้ 401 แต่หน้าเว็บค้างอยู่ที่เดิม
- **แก้**: ดัก 401 ใน `useApi` แล้วล้าง cookie และพาไปหน้า `/login`

### F6 ⚪ ลิงก์ `/all` ไม่มีหน้า
- **ที่**: `frontend/app/components/AppNavbar.vue:6` กดแล้วเจอ 404

### F7 ⚪ footer ทับเนื้อหา
- **ที่**: `frontend/app/components/AppFooter.vue:9` (`position: fixed` ไม่มีพื้นหลังและความกว้าง)
- **แก้**: ใช้ layout แบบ flex column ดัน footer ลงล่างแทน

### F8 ⚪ `apiBase` เขียนตายตัว
- **ที่**: `frontend/nuxt.config.ts`
- **แก้**: ตั้งค่าผ่าน env `NUXT_PUBLIC_API_BASE` ตอน deploy ขึ้น Production Server

---

## Network (จาก `docs/Network.pdf`)

### N1 🔴 แผน IP กับภาพหน้าจอไม่ตรงกัน
- แผนกำหนด VLAN100 เป็น `10.10.1.0/24` และ VLAN200 เป็น `10.20.1.0/24` แต่ภาพ Winbox ใช้ `172.16.10/20/30.0/24` และมี VLAN300
- แผนกำหนดพอร์ต Cisco 1-2 เป็น VLAN100 และ 3-4 เป็น VLAN200 แต่ภาพ Port VLAN Membership เป็น GE1=100, GE2=200, GE3=300
- WAN เป็น `172.16.3.x` ถ้า subnet ฝั่ง WAN เป็น /16 จะชนกับ LAN ที่เป็น 172.16.x
- **แก้**: ยึดตามโจทย์ที่ได้รับ และใช้ 10.x ตามแผน

### N2 🔴 ใช้พอร์ตที่ไม่มีอยู่จริง
- ภาพ Bridge VLAN ใช้ `ether5` เป็น trunk แต่ hAP lite มีแค่ ether1–4 ตามแผนต้องเป็น `ether4`

### N3 🟠 ไม่มีการตั้งค่า WAN
- ไม่มี DHCP client หรือ static IP บน ether1 และไม่มี default route ทำให้ NAT และ DNS ออกอินเทอร์เน็ตไม่ได้

### N4 🟠 ไม่มี Firewall
- เปิด DNS แบบ "Allow Remote Requests" แต่ไม่บล็อก input จาก WAN เราเตอร์จึงเป็น open resolver และ Winbox ก็เปิดให้ฝั่ง WAN เข้าถึงได้
- **แก้**: เพิ่ม rule รับ established/related, รับจาก LAN และ drop ที่เหลือใน chain input

### N5 🟠 Access Point
- gateway เป็น `0.0.0.0` ทำให้จัดการ AP จาก VLAN อื่นไม่ได้ ต้องใส่ `10.10.1.1`
- IP `10.10.1.100` อยู่ในช่วง DHCP pool ค่าเริ่มต้น (.2–.254) เสี่ยง IP ชนกัน
- ต้องปิด DHCP Server ของ AP ด้วย

### N6 🟡 DHCP Snooping
- ระบุไว้ใน Config แต่ไม่ได้ตั้งค่า ถ้าเปิดใช้ต้องตั้ง GE8 (trunk) เป็น trusted ไม่งั้น DHCP จาก MikroTik จะถูกบล็อก

### N7 🟡 รหัสผ่านค่าเริ่มต้น
- `admin/cisco` และ `admin/admin` ต้องเปลี่ยนทุกเครื่อง รวมถึงตั้งรหัสผ่าน admin ของ MikroTik ด้วย

---

## วิธีทดสอบซ้ำ

1. `cd backend && npm install && npm run dev` เพื่อยืนยัน **B1** (crash ทันที)
2. `npm install bcrypt` เพื่อให้ server รันได้ แล้ว import `database/db-kbtcweb.sql`
3. login ด้วย `admin01` ไม่ได้ เพื่อยืนยัน **B6**
4. สร้าง Admin ชั่วคราวด้วย hash จริง (หรือเอา `auth` ออกจาก route `create` ชั่วคราว) แล้วทดสอบ **B2–B5, B10, B11** ด้วย Postman
