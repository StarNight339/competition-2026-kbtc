const db = require('../config/db');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    try {
        const { u_username, u_password } = req.body;
        const sql = 'SELECT * FROM users as u LEFT JOIN sys_levels as l ON u.u_level_id = l.level_id WHERE u.u_username = ?';

        const [rows] = await db.query(sql, [u_username]);
        const user = rows[0];

        // ตรวจสอบเงื่อนไข
        if (rows.length === 0 || !(await bcrypt.compare(u_password, user.u_password))) {
            return res.status(401).json({ status: false, message: "Username หรือ Password ไม่ถูกต้อง" });
        }

        const token = jwt.sign({ id: user.u_id, username: user.u_username, role: user.level_name}, process.env.JWT_KEY, { expiresIn: "1h" });
        res.json({ status: true, message: "Login Success", token });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};
