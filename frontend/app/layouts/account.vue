<template>
    <AppNavbar/>
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
      <slot /> </main>
  </div>
  <AppFooter/>
</template>

<style scoped>
.account-layout { display: flex; gap: 30px; padding: 20px; }
.sidebar { width: 250px; display: flex; flex-direction: column; gap: 10px; }
.nav-item { display: block; padding: 10px; text-decoration: none; color: #333; }
.router-link-active { color: #2f81ed; font-weight: bold; background: #f0f7ff; }
</style>
