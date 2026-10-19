-- ฐานข้อมูล db-kbtcweb ตามสไลด์ (โครงสร้างและข้อมูลตัวอย่างเดิม)

CREATE DATABASE IF NOT EXISTS `db-kbtcweb`;
USE `db-kbtcweb`;

CREATE TABLE sys_levels (
  level_id   INT NOT NULL PRIMARY KEY,
  level_name VARCHAR(50) NOT NULL
);

INSERT INTO sys_levels (level_id, level_name) VALUES
  (1, 'Admin'), (2, 'Staff'), (3, 'User');

CREATE TABLE users (
  u_id        INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  u_username  VARCHAR(50)  NOT NULL UNIQUE,
  u_password  VARCHAR(255) NOT NULL,
  u_firstname VARCHAR(100) NULL,
  u_lastname  VARCHAR(100) NULL,
  u_address   TEXT         NULL,
  u_position  VARCHAR(100) NULL,
  u_level_id  INT NULL DEFAULT 3,
  FOREIGN KEY (u_level_id) REFERENCES sys_levels(level_id)
);

INSERT INTO users (u_username, u_password, u_firstname, u_lastname, u_address, u_position, u_level_id) VALUES
  ('admin01',    'hash_password_123', 'สมชาย',  'สายลุย', '123 กทม.',    'System Admin',  1),
  ('staff_jane', 'hash_password_456', 'เจนจิรา', 'ดีงาม',  '45/1 นนทบุรี', 'Manager',       2),
  ('user_boy',   'hash_password_789', 'มานะ',   'อดทน',   '99 เชียงใหม่', 'General Staff', 3);
