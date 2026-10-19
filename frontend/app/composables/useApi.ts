// เรียก API ได้ทั้ง get post put del และ upload — แนบ token ให้อัตโนมัติถ้า login อยู่
export const useApi = () => {
  const { public: { apiBase } } = useRuntimeConfig()
  const { token, logout } = useAuth()

  const req = async <T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, body?: any) => {
    try {
      return await $fetch<T>(`${apiBase}${url}`, {
        method,
        body,
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {}
      })
    } catch (e: any) {
      // token หมดอายุหรือไม่ถูกต้อง -> ล้าง cookie แล้วกลับหน้า login
      if (e?.response?.status === 401 && token.value) await logout()
      throw e
    }
  }

  return {
    get: <T = any>(url: string) => req<T>('GET', url),
    post: <T = any>(url: string, body?: any) => req<T>('POST', url, body),
    put: <T = any>(url: string, body?: any) => req<T>('PUT', url, body),
    del: <T = any>(url: string) => req<T>('DELETE', url),
    upload: <T = any>(url: string, form: FormData) => req<T>('POST', url, form)
  }
}
