FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
# branch นี้ไม่มี package-lock.json จึงใช้ npm install แทน npm ci
# โค้ดเรียก require('bcrypt') แต่ package.json มีแค่ bcryptjs (บั๊ก B1)
# ติดตั้ง bcrypt เพิ่มใน image เพื่อให้ server เริ่มได้ โดยไม่แก้โค้ดตามสไลด์
RUN npm install --omit=dev && npm install --omit=dev --no-save bcrypt
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
