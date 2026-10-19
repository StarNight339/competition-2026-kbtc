# Network — KBTC Competition 2026

## แผน IP

| เครือข่าย | VLAN | Subnet | Gateway | DHCP pool | Static ที่จองไว้ |
|---|---|---|---|---|---|
| Default / Management | 1 | 10.1.1.0/24 | 10.1.1.1 | .101–.200 | Switch .254 |
| Server / AP / IoT | 100 | 10.10.1.0/24 | 10.10.1.1 | .101–.250 | VM1 .10, VM2 .20, AP .100 |
| Client | 200 | 10.20.1.0/24 | 10.20.1.1 | .101–.250 | — |
| WAN | — | 172.16.3.x | จากกรรมการ | — | — |

> ยึดตามโจทย์ที่ได้รับจริงเสมอ ถ้าโจทย์กำหนด IP ต่างจากนี้ให้แก้ในไฟล์ config ก่อนใช้

## การต่อสาย

```
WAN ── ether1 [MikroTik hAP lite] ether4 ══ trunk ══ GE8 [Cisco CBS350]
                      ether2/3 = ช่องเสียบคอมตั้งค่า          GE1-2 = VLAN100 (Server, AP)
                                                          GE3-4 = VLAN200 (Client)
```

## ไฟล์

| ไฟล์ | ใช้กับ |
|---|---|
| `mikrotik-hap-lite.rsc` | MikroTik — Bridge, VLAN, IP, DNS, DHCP, NAT, Firewall |
| `cisco-cbs350.txt` | Cisco — VLAN, Access/Trunk, Management IP, DHCP Snooping |

## ลำดับการทำ

1. **MikroTik**: รีเซ็ตแบบ No Default Configuration → เข้า Winbox ด้วย MAC ผ่าน ether2 → รัน `mikrotik-hap-lite.rsc`
2. **Cisco**: ตั้งค่าตาม `cisco-cbs350.txt` → **Save**
3. **Access Point** (ค่าเริ่มต้น 192.168.0.254 admin/admin)
   - SSID `AP-KBTC` / WPA2-PSK AES / รหัสผ่านตามโจทย์
   - LAN: Static IP `10.10.1.100` / `255.255.255.0` / Gateway **`10.10.1.1`** / DNS `10.10.1.1`
   - **ปิด DHCP Server ของ AP** (ให้ MikroTik แจกอย่างเดียว)
   - เสียบเข้า Cisco GE1 หรือ GE2
4. **VM Server**: ตั้ง static IP ใน VLAN100 (นอก pool) เช่น VM2 `10.10.1.20/24` gateway `10.10.1.1`
5. เปลี่ยนรหัสผ่าน admin ของทุกอุปกรณ์

## ตรวจสอบ

- คอมใน GE3 ได้ IP `10.20.1.x` และ ping `8.8.8.8` ได้
- คอมใน VLAN200 ping `10.10.1.20` (Server) ได้ (inter-VLAN routing ผ่าน MikroTik)
- เปิด `http://10.10.1.100` เข้าหน้า AP ได้จาก VLAN อื่น (ต้องตั้ง gateway ที่ AP ไว้)
- MikroTik: `/ip dhcp-server lease print`, `/interface bridge vlan print`
- Cisco: `show vlan`, `show interfaces switchport GE8`

## ข้อควรระวัง

- **hAP lite มีแค่ ether1–4** ตัว trunk คือ `ether4` (ภาพในสไลด์เป็น ether5 ซึ่งไม่มีบนรุ่นนี้)
- เปิด **VLAN Filtering เป็นขั้นตอนสุดท้าย** เสมอ ถ้าเปิดก่อน Winbox อาจหลุด
- ถ้าเปิด DHCP Snooping บน Cisco ต้องตั้ง GE8 เป็น **trusted**
- อย่าเปิด DNS `allow-remote-requests` โดยไม่มี firewall บล็อก input จาก WAN (สคริปต์นี้ใส่ไว้แล้ว)
