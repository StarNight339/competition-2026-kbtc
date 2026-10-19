<template>
  <div class="layout">
    <AppNavbar />
    <div class="account-layout">
      <aside class="sidebar">
        <nav>
          <NuxtLink to="/account/profile" class="nav-item">ข้อมูลส่วนตัว</NuxtLink>
          <NuxtLink to="/account/change-photo" class="nav-item">เปลี่ยนรูปโปรไฟล์</NuxtLink>
          <NuxtLink to="/account/edit-profile" class="nav-item">แก้ไขข้อมูลส่วนตัว</NuxtLink>
          <NuxtLink to="/account/change-password" class="nav-item">เปลี่ยนรหัสผ่าน</NuxtLink>
        </nav>
      </aside>

      <main class="content">
        <slot />
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }
.account-layout {
  flex: 1;
  display: flex;
  gap: 24px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px;
}
.sidebar { width: 230px; flex-shrink: 0; }
.sidebar nav { display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: block; padding: 9px 12px; border-radius: 8px; text-decoration: none; color: var(--text); }
.nav-item:hover { background: #fff; }
.router-link-active { color: var(--primary); font-weight: 600; background: var(--primary-soft); }
.content { flex: 1; min-width: 0; }

@media (max-width: 720px) {
  .account-layout { flex-direction: column; }
  .sidebar { width: 100%; }
  .sidebar nav { flex-direction: row; overflow-x: auto; }
  .nav-item { white-space: nowrap; }
}
</style>
