# =====================================================================
#  MikroTik hAP lite (RouterOS v7) — Router + DHCP + NAT + Firewall
#  KBTC Competition 2026
#
#  ether1 = WAN (172.16.3.x)
#  ether2, ether3 = LAN default (VLAN 1 / 10.1.1.0/24) ใช้ต่อคอมเข้าไปตั้งค่า
#  ether4 = Trunk ไป Cisco GE8 (VLAN 100, 200 tagged + VLAN 1 untagged)
#
#  Default 10.1.1.0/24  -> จัดการอุปกรณ์ (Router .1 / Switch .254)
#  VLAN100 10.10.1.0/24 -> Server / AP / IoT   (Cisco GE1-2)
#  VLAN200 10.20.1.0/24 -> Client               (Cisco GE3-4)
#
#  วิธีใช้: ต่อคอมเข้า ether2 แล้วรีเซ็ตแบบ "No Default Configuration"
#          เปิด Winbox (เข้าด้วย MAC) > New Terminal > วางทั้งไฟล์
#          หรืออัปโหลดไฟล์แล้วรัน: /import file-name=mikrotik-hap-lite.rsc
#
#  ⚠ ถ้าโจทย์กำหนด IP / VLAN ต่างจากนี้ ให้แก้ค่าในส่วน "ตัวแปร" ก่อน
# =====================================================================


# ---------- 1) ตั้งชื่อเครื่อง + รหัสผ่าน admin (เปลี่ยนก่อนแข่ง!) ----------
/system identity set name=KBTC-Router
/user set admin password="ChangeMe@2026"

# ---------- 2) Interface list (ใช้กับ Firewall / NAT) ----------
/interface list
add name=WAN
add name=LAN

# ---------- 3) Bridge + พอร์ต ----------
# สร้าง bridge แต่ยังไม่เปิด vlan-filtering (เปิดเป็นขั้นสุดท้าย กัน Winbox หลุด)
/interface bridge add name=bridge vlan-filtering=no comment="LAN bridge"

/interface bridge port
add bridge=bridge interface=ether2 pvid=1
add bridge=bridge interface=ether3 pvid=1
add bridge=bridge interface=ether4 pvid=1 comment="Trunk to Cisco GE8"

# ---------- 4) VLAN interface (สร้างบน bridge) ----------
/interface vlan
add name=vlan100 vlan-id=100 interface=bridge
add name=vlan200 vlan-id=200 interface=bridge

/interface list member
add list=WAN interface=ether1
add list=LAN interface=bridge
add list=LAN interface=vlan100
add list=LAN interface=vlan200

# ---------- 5) WAN ----------
# แบบ DHCP จากเครือข่ายกรรมการ
/ip dhcp-client add interface=ether1 add-default-route=yes use-peer-dns=no disabled=no
# ถ้ากรรมการให้ IP แบบ static ให้ปิดบรรทัดบน แล้วใช้ 2 บรรทัดนี้แทน (แก้ xxx และ gateway)
# /ip address add address=172.16.3.xxx/24 interface=ether1
# /ip route add dst-address=0.0.0.0/0 gateway=172.16.3.1

# ---------- 6) IP Address ----------
/ip address
add address=10.1.1.1/24  interface=bridge  comment="Default / Management"
add address=10.10.1.1/24 interface=vlan100 comment="VLAN100 Server"
add address=10.20.1.1/24 interface=vlan200 comment="VLAN200 Client"

# ---------- 7) DNS ----------
/ip dns set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes

# ---------- 8) DHCP Server (แจกทั้ง 2 VLAN + default) ----------
# pool ไม่รวม .2-.100 เพื่อเก็บไว้เป็น IP static (Server, AP 10.10.1.100, Switch)
/ip pool
add name=pool-default ranges=10.1.1.101-10.1.1.200
add name=pool-vlan100 ranges=10.10.1.101-10.10.1.250
add name=pool-vlan200 ranges=10.20.1.101-10.20.1.250

/ip dhcp-server
add name=dhcp-default interface=bridge  address-pool=pool-default lease-time=1h disabled=no
add name=dhcp-vlan100 interface=vlan100 address-pool=pool-vlan100 lease-time=1h disabled=no
add name=dhcp-vlan200 interface=vlan200 address-pool=pool-vlan200 lease-time=1h disabled=no

/ip dhcp-server network
add address=10.1.1.0/24  gateway=10.1.1.1  dns-server=10.1.1.1
add address=10.10.1.0/24 gateway=10.10.1.1 dns-server=10.10.1.1
add address=10.20.1.0/24 gateway=10.20.1.1 dns-server=10.20.1.1

# ---------- 9) NAT (rule เดียวครอบทุก VLAN) ----------
/ip firewall nat
add chain=srcnat out-interface-list=WAN action=masquerade comment="LAN -> Internet"

# ---------- 10) Firewall (กันเข้าเราเตอร์จากฝั่ง WAN) ----------
/ip firewall filter
add chain=input action=accept connection-state=established,related,untracked comment="input: established"
add chain=input action=drop connection-state=invalid
add chain=input action=accept protocol=icmp
add chain=input action=accept in-interface-list=LAN comment="input: allow LAN (Winbox/DNS/DHCP)"
add chain=input action=drop comment="input: drop everything else (WAN)"

add chain=forward action=fasttrack-connection connection-state=established,related hw-offload=yes
add chain=forward action=accept connection-state=established,related,untracked
add chain=forward action=drop connection-state=invalid
add chain=forward action=drop in-interface-list=WAN connection-nat-state=!dstnat comment="forward: drop WAN -> LAN"
# (ถ้าโจทย์ต้องการแยก VLAN ไม่ให้คุยกัน ให้เปิดบรรทัดนี้)
# add chain=forward action=drop in-interface=vlan200 out-interface=vlan100 comment="Client -> Server blocked"

# ---------- 11) ปิด service ที่ไม่ใช้ ----------
/ip service
set telnet disabled=yes
set ftp disabled=yes
set api disabled=yes
set api-ssl disabled=yes
/ip neighbor discovery-settings set discover-interface-list=LAN
/tool mac-server set allowed-interface-list=LAN
/tool mac-server mac-winbox set allowed-interface-list=LAN

# ---------- 12) Bridge VLAN table (Tagged = Trunk / Untagged = Access) ----------
/interface bridge vlan
add bridge=bridge vlan-ids=100 tagged=bridge,ether4 comment="VLAN100"
add bridge=bridge vlan-ids=200 tagged=bridge,ether4 comment="VLAN200"

# ---------- 13) เปิด VLAN Filtering เป็นขั้นสุดท้าย ----------
/interface bridge set bridge vlan-filtering=yes

:log info "KBTC config applied"
:put "เสร็จแล้ว — ทดสอบ: /ping 8.8.8.8 และดู /ip dhcp-server lease print"
