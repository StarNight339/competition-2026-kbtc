-- ฐานข้อมูล db-kbtcweb
-- รันไฟล์นี้ใน phpMyAdmin (แท็บ SQL) แล้วรัน `npm run seed` เพื่อสร้างผู้ใช้ตัวอย่างที่ hash รหัสผ่านแล้ว

CREATE DATABASE IF NOT EXISTS `db-kbtcweb`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db-kbtcweb`;

CREATE TABLE IF NOT EXISTS sys_levels (
  level_id   INT PRIMARY KEY,
  level_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO sys_levels (level_id, level_name) VALUES
  (1, 'Admin'), (2, 'Staff'), (3, 'User');

CREATE TABLE IF NOT EXISTS users (
  u_id        INT AUTO_INCREMENT PRIMARY KEY,
  u_username  VARCHAR(50)  NOT NULL UNIQUE,
  u_password  VARCHAR(255) NOT NULL,          -- เก็บเป็น bcrypt hash เท่านั้น
  u_firstname VARCHAR(100) NULL,
  u_lastname  VARCHAR(100) NULL,
  u_address   TEXT         NULL,
  u_position  VARCHAR(100) NULL,
  u_photo     VARCHAR(255) NULL,              -- path รูปโปรไฟล์ เช่น /uploads/u1-xxx.jpg
  u_level_id  INT NOT NULL DEFAULT 3,
  CONSTRAINT fk_users_level FOREIGN KEY (u_level_id) REFERENCES sys_levels(level_id)
);

-- ถ้ามีตาราง users เดิมอยู่แล้ว (ตามสไลด์) ให้เพิ่มคอลัมน์รูปด้วยคำสั่งนี้แทน:
-- ALTER TABLE users ADD COLUMN u_photo VARCHAR(255) NULL AFTER u_position;
