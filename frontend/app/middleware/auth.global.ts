import type { Role } from '~/composables/useAuth'

// ทำงานทุกครั้งที่เปลี่ยนหน้า
// - ยังไม่ login -> ไปหน้า login
// - login แล้วเข้าหน้า login -> กลับหน้าแรก
// - หน้าที่กำหนด definePageMeta({ roles: [...] }) -> role ไม่ตรงให้กลับหน้าแรก
// หมายเหตุ: นี่คือการกันฝั่งหน้าเว็บเพื่อ UX เท่านั้น ความปลอดภัยจริงอยู่ที่ backend
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, user } = useAuth()

  if (to.path === '/login') {
    return isLoggedIn.value ? navigateTo('/') : undefined
  }
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }

  const roles = to.meta.roles as Role[] | undefined
  if (roles && !roles.includes(user.value!.role)) {
    return navigateTo('/')
  }
})
