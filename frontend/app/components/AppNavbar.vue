<script setup lang="ts">
// ชื่อและ role อ่านจาก token จริง ไม่เขียนตายตัว
const { user, hasRole, logout } = useAuth()
</script>

<template>
  <nav class="navbar">
    <div class="group">
      <NuxtLink to="/" class="brand">KBTC</NuxtLink>
      <NuxtLink to="/" class="menu" exact-active-class="active">หน้าแรก</NuxtLink>
      <NuxtLink v-if="hasRole('Admin', 'Staff')" to="/users" class="menu" active-class="active">
        จัดการผู้ใช้
      </NuxtLink>
    </div>

    <div v-if="user" class="group">
      <span class="user">{{ user.username }} <span class="badge">{{ user.role }}</span></span>
      <div class="line" />
      <NuxtLink to="/account/profile" class="menu" active-class="active">ตั้งค่าบัญชี</NuxtLink>
      <button class="logout" @click="logout">ออกจากระบบ</button>
    </div>
  </nav>
</template>

<style scoped>
.navbar, .group { display: flex; align-items: center; }
.navbar {
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid var(--border);
}
.group { gap: 8px; flex-wrap: wrap; }
.brand { font-weight: 600; color: var(--text); text-decoration: none; margin-right: 8px; letter-spacing: 0.04em; }

.menu, .logout {
  padding: 7px 12px;
  border-radius: 6px;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: 0.2s;
}
.menu { color: var(--text); }
.menu:hover, .menu.active { background: var(--primary-soft); color: var(--primary); }

.user { font-size: 0.9rem; color: var(--muted); display: inline-flex; align-items: center; gap: 6px; }
.line { width: 1px; height: 16px; background: var(--border); }

.logout { background: var(--danger-soft); border: 1px solid #ffccc7; color: var(--danger); cursor: pointer; }
.logout:hover { background: var(--danger); color: #fff; }
</style>
