<script setup lang="ts">
definePageMeta({ layout: 'empty' })

const api = useApi()
const { token } = useAuth()

const u_username = ref('')
const u_password = ref('')
const error = ref('')
const loading = ref(false)

const login = async () => {
  error.value = ''
  if (!u_username.value || !u_password.value) {
    error.value = 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน'
    return
  }

  loading.value = true
  try {
    const res = await api.post<{ token: string }>('/user/login', {
      u_username: u_username.value,
      u_password: u_password.value
    })
    token.value = res.token
    await navigateTo('/')
  } catch (e) {
    error.value = apiError(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card login">
    <form @submit.prevent="login">
      <h2>เข้าสู่ระบบ</h2>
      <p v-if="error" class="alert alert-error">{{ error }}</p>

      <div class="field">
        <label for="username">ชื่อผู้ใช้งาน</label>
        <input id="username" v-model.trim="u_username" type="text" autocomplete="username">
      </div>
      <div class="field">
        <label for="password">รหัสผ่าน</label>
        <input id="password" v-model="u_password" type="password" autocomplete="current-password">
      </div>
      <button type="submit" class="btn btn-primary full" :disabled="loading">
        {{ loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login { width: 100%; max-width: 380px; }
.full { width: 100%; justify-content: center; margin-top: 4px; }
</style>
