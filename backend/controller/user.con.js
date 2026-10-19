const db = require('../config/db')              // ติดต่อฐานข้อมูล
const bcrypt = require('bcrypt');
// Table User , sys_Levels : CURD
// หมายเหตุ: สไลด์แสดงโค้ดแค่ getAll, ต้น getId และส่วน create
// ฟังก์ชันที่เหลือ (getId ส่วนท้าย, getLevels, update, delete) เขียนต่อให้ตรงกับผลทดสอบ Postman ในสไลด์

// 1. Get All Users (แสดงพร้อมชื่อ Level)
exports.getAll = async (req, res) => {
    try {
        // ใช้ JOIN เพื่อดึง level_name มาแสดงด้วย
        const sql = `
            SELECT u.*, l.level_name
            FROM users u
            LEFT JOIN sys_levels l ON u.u_level_id = l.level_id
        `;
        const [rows] = await db.query(sql);
        res.json({
            status: true,
            total: rows.length,
            data: rows
        });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.getId = async (req, res) => {
    try {
        const { id } = req.params; // รับค่า id จาก URL (เช่น /user/getid/1)

        const sql = `
            SELECT u.*, l.level_name
            FROM users u
            LEFT JOIN sys_levels l ON u.u_level_id = l.level_id
            WHERE u.u_id = ?
        `;
        const [rows] = await db.query(sql, [id]);
        res.json({ status: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.getLevels = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sys_levels');
        res.json({ status: true, data: rows });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// 2. Create User (เพิ่มผู้ใช้)
exports.create = async (req, res) => {
    try {

        const { u_username, u_password, u_firstname, u_lastname, u_address, u_position, u_level_id } = req.body;

        const sql = `INSERT INTO users (u_username, u_password, u_firstname, u_lastname, u_address, u_position, u_level_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const txt_password = await bcrypt.hash(u_password, 10);
        // ถ้าไม่ส่ง u_level_id มา จะให้เป็น 3 (User) ตามที่ตั้งไว้ใน Database
        const [result] = await db.query(sql, [
            u_username,
            txt_password,
            u_firstname,
            u_lastname,
            u_address,
            u_position,
            u_level_id || 3
        ]);

        res.status(201).json({ status: true, message: "เพิ่มผู้ใช้งานเรียบร้อยแล้ว", userId: result.insertId });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// 3. Update User (แก้ไขข้อมูล)
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { u_firstname, u_lastname, u_address, u_position, u_level_id } = req.body;

        const sql = `UPDATE users SET u_firstname = ?, u_lastname = ?, u_address = ?, u_position = ?, u_level_id = ?
                     WHERE u_id = ?`;
        await db.query(sql, [u_firstname, u_lastname, u_address, u_position, u_level_id, id]);

        res.json({ status: true, message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// 4. Delete User (ลบข้อมูล)
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM users WHERE u_id = ?', [id]);
        res.json({ status: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};
