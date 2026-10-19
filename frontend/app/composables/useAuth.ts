import { jwtDecode } from 'jwt-decode'

export type Role = 'Admin' | 'Staff' | 'User'
export interface AuthUser {
  id: number
  username: string
  role: Role
  exp: number
}

// ชื่อ cookie ใช้ที่เดียวตรงนี้ ทุกไฟล์เรียกผ่าน useAuth() จึงไม่มีทางชื่อไม่ตรงกัน
const COOKIE = 'token'

export const useAuth = () => {
  const token = useCookie<string | null>(COOKIE, {
    maxAge: 60 * 60, // เท่ากับอายุ JWT ฝั่ง backend (1 ชม.)
    sameSite: 'strict'
  })

  // อ่าน id / username / role จาก token (แค่แสดงผล ความปลอดภัยจริงอยู่ที่ backend)
  const user = computed<AuthUser | null>(() => {
    if (!token.value) return null
    try {
      const u = jwtDecode<AuthUser>(token.value)
      return u.exp * 1000 > Date.now() ? u : null
    } catch {
      return null
    }
  })

  const isLoggedIn = computed(() => !!user.value)
  const hasRole = (...roles: Role[]) => !!user.value && roles.includes(user.value.role)

  const logout = () => {
    token.value = null
    return navigateTo('/login')
  }

  return { token, user, isLoggedIn, hasRole, logout }
}
