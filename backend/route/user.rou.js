const express = require('express')
const r  = express.Router()
const cu = require('../controller/user.con')
const ca = require('../controller/auth.con')
const auth = require('../middleware/auth.mid')

//  เข้าสู่ระบบ
r.post("/user/login",ca.login);

//  ดึงข้อมูลทั้งหมด
r.get("/user/getall", auth(["Admin","Staff"]) , cu.getAll);

//  ดึงข้อมูลเฉพาะบุคคล
r.get("/user/getid/:id", auth(["Admin","Staff","User"]) , cu.getId);

// ดึงระดับผู้ใช้ (ย้ายมาไว้ข้างบนเพื่อให้ชัดเจน)
r.get("/user/getlevels", cu.getLevels);

// สร้างผู้ใช้ใหม่
r.post("/user/create", auth(["Admin","Staff"]) , cu.create);
// r.post("/user/create", cu.create);

// แก้ไขข้อมูล (ต้องมี /:id เพื่อรับค่า id ของผู้ใช้)
r.put("/user/update/:id", auth(["Admin","Staff","User"]) , cu.update);

//  ลบข้อมูล (เปลี่ยนจาก get เป็น delete และใส่ /:id)
r.delete("/user/delete/:id", auth(["Admin"]) , cu.delete);

module.exports =r
