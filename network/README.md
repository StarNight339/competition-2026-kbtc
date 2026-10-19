# Network (ตามสไลด์ต้นฉบับ)

สไลด์ต้นฉบับอยู่ที่ [`docs/Network.pdf`](../docs/Network.pdf) — ตั้งค่าผ่านหน้า GUI (Winbox / เว็บ Cisco / เว็บ AP) จึงไม่มีไฟล์ config

## แผน IP

| เครือข่าย | Subnet |
|---|---|
| Default | 10.1.1.0/24 |
| X — VLAN100 | 10.10.1.0/24 |
| Y — VLAN200 | 10.20.1.0/24 |
| WAN | 172.16.3.xxx |

## การต่อสาย
- MikroTik hAP lite: Port 1 = WAN, Port 4 = Trunk (VLAN 100, 200)
- Cisco CBS350: Port 8 = Trunk, Port 1-2 = VLAN100, Port 3-4 = VLAN200

## MikroTik (Winbox)
1. สร้าง Bridge เก็บ VLAN ทั้งหมด
2. สร้าง VLAN (Interfaces > VLAN) ชื่อ vlan100, ID 100, interface = bridge — ทำทุก VLAN
3. กำหนด IP Address ให้ VLAN แต่ละตัว (IP > Addresses)
4. ตั้งค่า DNS 8.8.8.8 + Allow Remote Requests
5. DHCP Server > DHCP Setup — ทำทุก VLAN
6. NAT: srcnat, Src. Address = VLAN ต้นทาง, Out. Interface = ether1, Action = masquerade — ทำทุก VLAN
7. Bridge > VLANs: Tagged = Trunk port, Untagged = Access port / Bridge > Ports เพิ่ม interface / เปิด VLAN Filtering

## Cisco CBS350 L3
- ค่าเริ่มต้น: 192.168.1.254 / admin / cisco
- VLAN Settings: เพิ่ม VLAN ID ตามที่กำหนด
- Port to VLAN: เลือก VLAN > Go > เลือกพอร์ตเป็น Untagged > Apply
- ตรวจสอบที่ Port VLAN Membership
- ทีมใช้ MikroTik จัดการ DHCP, Routing และ NAT

## Access Point (LINK)
- ค่าเริ่มต้น: 192.168.0.254 / admin / admin
- SSID: AP-KBTC / WPA2-PSK AES
- IP: 10.10.1.100/24
