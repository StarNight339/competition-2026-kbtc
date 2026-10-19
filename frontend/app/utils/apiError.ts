// ดึงข้อความ error จาก response ของ backend ({ status:false, message })
export const apiError = (e: any) =>
  e?.data?.message || (e?.response ? `เกิดข้อผิดพลาด (${e.response.status})` : 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้')
