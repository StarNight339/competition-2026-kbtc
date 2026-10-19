# คู่มือแล็บจำลอง — KBTC Competition 2026

ซ้อมทั้งระบบโดยไม่ต้องใช้อุปกรณ์จริง แบ่งเป็น 3 ระดับ เลือกทำตามเวลาและสเปกเครื่อง

| ระดับ | ใช้อะไร | ซ้อมอะไร | เวลา |
|---|---|---|---|
| [1. Code อย่างเดียว](#ระดับ-1--code-อย่างเดียว) | Laragon / XAMPP + Node.js | Backend, Frontend, API | 30 นาที |
| [2. Cisco CLI](#ระดับ-2--cisco-cli-ด้วย-packet-tracer) | Cisco Packet Tracer | VLAN, Trunk, Inter-VLAN, DHCP | 1 ชม. |
| [3. แล็บเต็มระบบ](#ระดับ-3--แล็บเต็มระบบด้วย-gns3--mikrotik-chr) ⭐ | GNS3 + MikroTik CHR + Ubuntu VM | Network จริงตามโจทย์ + deploy เว็บ | 3–4 ชม. (ครั้งแรก) |

---

## ระดับ 1 — Code อย่างเดียว

ทำตาม [README หลัก](../README.md#เริ่มใช้งาน-เครื่องตัวเอง) แล้วทดสอบตามเช็คลิสต์นี้

| # | ทดสอบ | ผลที่ต้องได้ |
|---|---|---|
| C1 | `POST /api/user/login` ด้วย `admin` | ได้ `token` |
| C2 | login รหัสผิด 11 ครั้ง | ครั้งที่ 11 ได้ 429 "ลองเข้าสู่ระบบบ่อยเกินไป" |
| C3 | `GET /api/user/getall` ด้วย token ของ `user_boy` | 403 Forbidden |
| C4 | `PUT /api/user/me` ด้วย token User แล้วส่ง `"u_level_id": 1` | ระดับยังเป็น User |
| C5 | Staff `POST /api/user/create` ส่ง `"u_level_id": 1` | บัญชีที่สร้างเป็นระดับ User |
| C6 | `GET /api/user/getall` ด้วย token Admin | ไม่มีฟิลด์ `u_password` |
| C7 | เปิด `http://localhost:3000/account/profile` โดยไม่ login | ถูกพาไปหน้า `/login` |
| C8 | login แล้วกด "ออกจากระบบ" แล้วกด Back | ถูกพากลับหน้า `/login` |
| C9 | login เป็น `user_boy` แล้วเปิด `/users` | ถูกพากลับหน้าแรก และไม่มีเมนู "จัดการผู้ใช้" |
| C10 | อัปโหลดรูป `.png` และไฟล์ `.txt` | `.png` ผ่าน, `.txt` ขึ้น "อนุญาตเฉพาะไฟล์ JPG, PNG, WEBP" |

---

## ระดับ 2 — Cisco CLI ด้วย Packet Tracer

Packet Tracer ไม่มี CBS350 และรัน MikroTik ไม่ได้ จึงใช้ Catalyst 2960 แทนสวิตช์ และใช้ Router 2911 แบบ router-on-a-stick แทน MikroTik **แนวคิดเหมือนวันแข่งทุกอย่าง** ต่างกันแค่ชื่อพอร์ตและคำสั่งบางคำสั่ง

### ติดตั้ง
1. สมัครบัญชีฟรีที่ Cisco Networking Academy (netacad.com)
2. ดาวน์โหลด Packet Tracer จากหน้า Resources แล้ว login ด้วยบัญชีเดียวกัน

### Topology
```
            [Router 2911]
              G0/0 (trunk)
                 │
             G0/1│
          [Switch 2960]
   Fa0/1  Fa0/2     Fa0/3  Fa0/4
     │      │         │      │
  Server  Laptop     PC1    PC2
  └─ VLAN100 ─┘     └─ VLAN200 ─┘
```

### Switch 2960
```
enable
configure terminal
hostname SW1
vlan 100
 name Vlan100
vlan 200
 name Vlan200
exit
interface range fa0/1-2
 switchport mode access
 switchport access vlan 100
interface range fa0/3-4
 switchport mode access
 switchport access vlan 200
interface gi0/1
 switchport mode trunk
 switchport trunk allowed vlan 1,100,200
end
write memory
```

### Router 2911 (ทำหน้าที่แทน MikroTik)
```
enable
configure terminal
hostname R1
interface g0/0
 no shutdown
interface g0/0.100
 encapsulation dot1Q 100
 ip address 10.10.1.1 255.255.255.0
interface g0/0.200
 encapsulation dot1Q 200
 ip address 10.20.1.1 255.255.255.0
exit
ip dhcp excluded-address 10.10.1.1 10.10.1.100
ip dhcp excluded-address 10.20.1.1 10.20.1.100
ip dhcp pool VLAN100
 network 10.10.1.0 255.255.255.0
 default-router 10.10.1.1
 dns-server 8.8.8.8
ip dhcp pool VLAN200
 network 10.20.1.0 255.255.255.0
 default-router 10.20.1.1
 dns-server 8.8.8.8
end
write memory
```

### ทดสอบ
- PC1 → Desktop → IP Configuration → **DHCP** ต้องได้ `10.20.1.101`
- Server ตั้ง Static `10.10.1.20 / 255.255.255.0 / gateway 10.10.1.1`
- PC1 → Command Prompt → `ping 10.10.1.20` ต้องตอบกลับ (inter-VLAN ผ่าน router)
- SW1: `show vlan brief`, `show interfaces trunk`
- R1: `show ip dhcp binding`

### เทียบกับวันแข่ง
| Packet Tracer | วันแข่ง |
|---|---|
| Catalyst 2960, `fa0/1` | CBS350, `GE1` (ตั้งผ่านหน้าเว็บหรือ CLI ใน `network/cisco-cbs350.txt`) |
| `gi0/1` trunk | `GE8` trunk |
| Router 2911 + subinterface `g0/0.100` | MikroTik bridge + `vlan100` บน bridge |
| `ip dhcp pool` | `/ip dhcp-server` |

---

## ระดับ 3 — แล็บเต็มระบบด้วย GNS3 + MikroTik CHR

ใช้ RouterOS ตัวเดียวกับ hAP lite จริง และรันสคริปต์ `network/mikrotik-hap-lite.rsc` ได้ตรงๆ

### สเปกที่ต้องมี
- RAM **16 GB** ขึ้นไป (Ubuntu VM ใช้ 4 GB, GNS3 VM ใช้ 4 GB, CHR ใช้ 256 MB ต่อตัว)
- CPU ที่เปิด Virtualization (VT-x / AMD-V) ใน BIOS แล้ว
- พื้นที่ว่าง 40 GB

### Topology
```
                 [NAT]  ← อินเทอร์เน็ตจำลอง (แทน WAN 172.16.3.x)
                   │
                ether1
             [R1: MikroTik CHR]
                ether4  (trunk: VLAN1 untagged + 100,200 tagged)
                   │
                port 8 (dot1q)
           [SW1: GNS3 Ethernet switch]   ← แทน Cisco CBS350
   port1     port2         port3      port4
     │         │             │          │
 [Ubuntu]   [VPCS]        [VPCS]    [Webterm]
 Server VM   AP-sim         PC1      เบราว์เซอร์
 10.10.1.20 10.10.1.100   (DHCP)      (DHCP)
 └──── VLAN100 ────┘      └──── VLAN200 ────┘
```

### ขั้นที่ 1: ติดตั้งโปรแกรม
1. **VirtualBox** หรือ VMware Workstation Player
2. **GNS3 all-in-one** จาก gns3.com และ **GNS3 VM** รุ่นที่ตรงกับโปรแกรมข้อ 1
   - ตอนเปิด GNS3 ครั้งแรก Setup Wizard จะถาม ให้เลือก **Run appliances in a virtual machine** แล้วเลือก GNS3 VM ที่ import ไว้
   - Linux ไม่ต้องใช้ GNS3 VM เลือก local server ได้เลย
3. **Winbox** จาก mikrotik.com (ไม่บังคับ เพราะใช้ console แทนได้)

### ขั้นที่ 2: เพิ่ม MikroTik CHR
1. GNS3 → **File → New template** → *Install an appliance from the GNS3 server* → ค้นหา **MikroTik CHR** → Install
2. ระบบจะให้ดาวน์โหลดไฟล์ image ของ CHR จาก mikrotik.com ให้เลือกเวอร์ชัน **7.x** ให้ตรงกับเครื่องจริง
3. คลิกขวาที่ template → *Configure template* → **Adapters = 5** (จะได้ ether1–ether5)

> CHR รุ่นฟรีจำกัดความเร็ว 1 Mbps ต่อพอร์ต ไม่มีผลกับการซ้อมตั้งค่า

### ขั้นที่ 3: เตรียม Server VM (Ubuntu)
1. สร้าง VM ใน VirtualBox: **Ubuntu Server 24.04**, RAM 4 GB, ดิสก์ 25 GB ติดตั้งให้เสร็จแล้วปิดเครื่อง
2. GNS3 → **Edit → Preferences → VirtualBox VMs → New** → เลือก VM นี้ → ติ๊ก **Allow GNS3 to use any configured VirtualBox adapter**

### ขั้นที่ 4: วางอุปกรณ์และต่อสาย
สร้างโปรเจกต์ใหม่ แล้วลากอุปกรณ์จากแถบซ้ายมาวาง

| อุปกรณ์ | ชื่อ | หาได้ที่ |
|---|---|---|
| NAT | NAT1 | End devices |
| MikroTik CHR | R1 | Routers |
| Ethernet switch | SW1 | Switches |
| Ubuntu VM | Server | End devices |
| VPCS | AP-sim, PC1 | End devices |
| Webterm | Browser | Marketplace → *webterm* (ติดตั้งเหมือนขั้นที่ 2) |

**ตั้งพอร์ต SW1**: คลิกขวาที่ SW1 → Configure แล้วลบพอร์ตเดิมออก จากนั้นเพิ่มพอร์ตตามนี้

| Port | Type | VLAN | ต่อกับ |
|---|---|---|---|
| 1 | access | 100 | Server |
| 2 | access | 100 | AP-sim |
| 3 | access | 200 | PC1 |
| 4 | access | 200 | Browser |
| 8 | **dot1q** | 1 (native) | R1 ether4 |

**ต่อสาย**: R1 `ether1` ↔ NAT1, R1 `ether4` ↔ SW1 port 8 และอุปกรณ์อื่นตามตารางด้านบน

กด ▶ Start all

### ขั้นที่ 5: ตั้งค่า MikroTik
1. ดับเบิลคลิก R1 เพื่อเปิด console แล้ว login `admin` (ไม่มีรหัส) ระบบจะให้ตั้งรหัสใหม่ทันที
2. ล้างค่าเริ่มต้นก่อน:
   ```
   /system reset-configuration no-defaults=yes skip-backup=yes
   ```
   กด `y` แล้วรอ reboot จากนั้น login ใหม่
3. เปิดไฟล์ `network/mikrotik-hap-lite.rsc` ใน repo แล้ว**คัดลอกไปวางใน console ทีละหัวข้อ** (1, 2, 3 ...) ไม่วางทั้งไฟล์ทีเดียว เพราะ console ของ GNS3 อาจตัดตัวอักษรถ้าวางยาวเกินไป
   - ข้อ 1 ในสคริปต์ตั้งรหัส admin เป็น `ChangeMe@2026` (เปลี่ยนในสคริปต์ก่อนได้)
   - ในแล็บ ether1 จะได้ IP `192.168.122.x` จาก NAT1 แทน `172.16.3.x` ใช้งานได้เหมือนกัน
4. ตรวจผล:
   ```
   /ip dhcp-client print            # ether1 ต้อง status=bound
   /ping 8.8.8.8 count=3            # ต้องตอบกลับ
   /interface bridge vlan print     # VLAN 100, 200 tagged=bridge,ether4
   /ip address print                # 10.1.1.1, 10.10.1.1, 10.20.1.1
   ```

### ขั้นที่ 6: ทดสอบด้วย VPCS
**PC1** (VLAN200) ดับเบิลคลิกเพื่อเปิด console:
```
PC1> ip dhcp
DORA IP 10.20.1.101/24 GW 10.20.1.1

PC1> ping 10.20.1.1      # gateway
PC1> ping 8.8.8.8        # อินเทอร์เน็ตผ่าน NAT
PC1> ping 10.10.1.20     # ข้าม VLAN ไปหา Server (ทำหลังขั้นที่ 7)
```

**AP-sim** (VLAN100) ตั้ง static เหมือน Access Point จริง:
```
AP-sim> ip 10.10.1.100/24 10.10.1.1
AP-sim> ping 10.20.1.101  # ข้าม VLAN ไปหา PC1
AP-sim> save
```

ดู lease บน R1: `/ip dhcp-server lease print`

### ขั้นที่ 7: Deploy เว็บบน Server
เปิด console ของ Server (หรือหน้าต่าง VirtualBox) แล้ว:

**7.1 ตั้ง IP static** ดูชื่อการ์ดก่อนด้วย `ip a` (มักเป็น `enp0s3`)
```bash
ls /etc/netplan/                       # ดูชื่อไฟล์ เช่น 50-cloud-init.yaml
sudo nano /etc/netplan/50-cloud-init.yaml
```
```yaml
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: false
      addresses: [10.10.1.20/24]
      routes:
        - to: default
          via: 10.10.1.1
      nameservers:
        addresses: [10.10.1.1]
```
```bash
sudo netplan apply
ping -c 3 8.8.8.8
```

**7.2 ติดตั้ง Docker แล้ว deploy**
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker

git clone https://github.com/StarNight339/competition-2026-kbtc.git
cd competition-2026-kbtc
cp .env.example .env
nano .env        # SERVER_IP=10.10.1.20 และเปลี่ยน DB_PASSWORD, JWT_KEY

docker compose up -d --build      # ครั้งแรกใช้เวลา 5–10 นาที
docker compose ps                 # ต้องเห็น db, backend, frontend เป็น running
docker compose exec backend npm run seed
```
> ถ้า repo เป็น private ต้อง login ตอน clone ด้วย Personal Access Token หรือใช้ `gh auth login` ก่อน

**7.3 ทดสอบจากเครื่องฝั่ง VLAN200**
ก่อน Start ให้คลิกขวาที่ **Browser** → *Edit config* แล้วเอา `#` หน้าบรรทัด `auto eth0` กับ `iface eth0 inet dhcp` ออก เพื่อให้ขอ IP จาก DHCP
จากนั้นดับเบิลคลิก Browser จะได้หน้าต่าง Firefox แล้วเปิด
- `http://10.10.1.20:3000` แล้ว login ด้วย `admin` (รหัสตาม `SEED_PASSWORD`)
- `http://10.10.1.20:5000/api/health` ต้องได้ `{"status":true}`

นี่คือการจำลองการใช้งานจริงตามโจทย์ คือเครื่อง Client ใน VLAN200 เปิดเว็บที่อยู่บน Production Server ใน VLAN100

### ขั้นที่ 8 (เสริม): Winbox จากเครื่องจริง
ถ้าอยากใช้ Winbox แทน console:
1. Windows: สร้าง **Microsoft KM-TEST Loopback Adapter** ผ่าน `hdwwiz` แล้วตั้ง IP `10.1.1.10/24`
2. ลาก **Cloud** node มาวาง → เลือก loopback adapter นั้น → ต่อเข้า R1 `ether2`
3. เปิด Winbox แล้วเชื่อมต่อไปที่ `10.1.1.1`

### ขั้นที่ 9 (เสริม): Git Server (VM1)
GitLab ต้องใช้ RAM 4 GB ขึ้นไป ถ้าเครื่องไม่พอให้ใช้ **Gitea** แทน รันบน Server VM ได้เลย:
```bash
docker run -d --name gitea -p 3001:3000 -p 2222:22 -v gitea:/data gitea/gitea:latest
```
เปิด `http://10.10.1.20:3001` จาก Browser เพื่อตั้งค่าครั้งแรก

---

## เช็คลิสต์แล็บ (ระดับ 3)

| # | ทดสอบ | ผลที่ต้องได้ | ถ้าไม่ผ่าน ดูที่ |
|---|---|---|---|
| N1 | R1 `/ip dhcp-client print` | ether1 `bound` | NAT1 ต่อกับ ether1 จริงไหม |
| N2 | R1 `/ping 8.8.8.8` | ตอบกลับ | N1 / `/ip route print` มี default route |
| N3 | PC1 `ip dhcp` | ได้ `10.20.1.x` | T1, T2 |
| N4 | PC1 `ping 8.8.8.8` | ตอบกลับ | NAT rule `/ip firewall nat print` |
| N5 | PC1 `ping 10.10.1.20` | ตอบกลับ | Server ตั้ง gateway `10.10.1.1` หรือยัง |
| N6 | AP-sim `ping 10.20.1.101` | ตอบกลับ | AP-sim ใส่ gateway หรือยัง |
| N7 | Browser เปิด `10.10.1.20:3000` | หน้า login | `docker compose ps`, `SERVER_IP` ใน `.env` |
| N8 | login + เปิดหน้าจัดการผู้ใช้ | เห็นรายชื่อ | `docker compose logs backend` |

## แก้ปัญหาที่เจอบ่อย

**T1 — VPCS ขอ DHCP ไม่ได้ (`DDD` timeout)**
- `/interface bridge vlan print` ต้องมี VLAN 200 โดย tagged = `bridge,ether4`
- `/interface bridge print` ค่า `vlan-filtering` ต้องเป็น `yes`
- SW1 port 8 ต้องเป็น **dot1q** ไม่ใช่ access

**T2 — ได้ IP `10.1.1.x` แทน `10.20.1.x`**
- พอร์ตของ SW1 ยังเป็น access VLAN 1 อยู่ ให้ตั้งใหม่ตามตารางในขั้นที่ 4

**T3 — Winbox หลุดหลังเปิด vlan-filtering**
- ต้องต่อ Winbox ผ่าน ether2 หรือ ether3 ซึ่งเป็น untagged VLAN 1 อยู่ใน bridge ถ้าหลุด ให้เข้า console ของ R1 แล้วสั่ง `/interface bridge set bridge vlan-filtering=no` เพื่อแก้ก่อน

**T4 — `docker compose up` build frontend ไม่ผ่าน**
- RAM ของ VM น้อยเกินไป ให้เพิ่มเป็น 4 GB แล้วสั่งใหม่

**T5 — เว็บเปิดได้แต่ login แล้วขึ้น "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"**
- `SERVER_IP` ใน `.env` ต้องเป็น IP ที่เบราว์เซอร์เข้าถึงได้ (`10.10.1.20`) ไม่ใช่ `localhost` แก้แล้วสั่ง `docker compose up -d` ใหม่

**T6 — รีเซ็ตแล็บกลับไปเริ่มใหม่**
- R1: `/system reset-configuration no-defaults=yes skip-backup=yes`
- Server: `docker compose down -v` (ข้อมูลในฐานข้อมูลจะหายหมด)
