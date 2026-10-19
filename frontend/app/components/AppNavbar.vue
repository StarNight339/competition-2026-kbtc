<template>
  <nav class="navbar">

    <div class="group">
      <NuxtLink to="/" class="menu">หน้าแรก</NuxtLink>
      <NuxtLink to="/all" class="menu">เมนูอื่นๆ ตามระบบ</NuxtLink>
    </div>

    <div class="group">
      <span class="user">ศรัญญู (Admin)</span>
      <div class="line"></div>

      <NuxtLink to="/account/profile" class="menu">ตั้งค่าบัญชี</NuxtLink>
      <button @click="logout" class="logout">ออกจากระบบ</button>
    </div>
  </nav>
</template>

<script setup>
    const token = useCookie('auth_token')
    const logout = () => {
        token.value = null
        navigateTo('/login')
    }
</script>

<style scoped>
.navbar, .group { display: flex; align-items: center; }
.navbar {
  justify-content: space-between;
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid #eee;
  font-family: sans-serif;
}
.group { gap: 10px; }

/* ยุบรวมเมนูและปุ่มไว้ด้วยกันในส่วนที่เหมือนกัน */
.menu, .logout {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  transition: 0.2s;
  text-decoration: none;
}

.menu { color: #333; }
.menu:hover, .router-link-active { background: #f0f7ff; color: #2f81ed; }

.user { font-size: 0.85rem; color: #27ae60; }
.line { width: 1px; height: 15px; background: #ddd; }

.logout {
  background: #fff0f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  cursor: pointer;
}
.logout:hover { background: #ff4d4f; color: #fff; }
</style>
