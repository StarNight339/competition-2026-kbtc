// เรียกใช้ Library
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()


// ตั้งค่า
const app = express();

// เรียกใช้งาน
app.use(cors())
app.use(express.json())
// Use route API User : /api/funtion/:param
app.use("/api", require("./route/user.rou"));



// Server Run
const port = process.env.PORT_SERVER || 3000
app.listen(port,()=>console.log('Server Running '+port))
