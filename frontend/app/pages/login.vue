<template>
  <div class="login">
    <form @submit.prevent="login">
      <h2>เข้าสู่ระบบ</h2>
        <p v-if="error" style="color:red; font-size:14px;">
            {{ error }}
        </p>
      <div>
        <label>ชื่อผู้ใช้งาน</label>
        <input type="text" v-model="u_username" />
      </div>
      <div>
        <label>รหัสผ่าน</label>
        <input type="password" v-model="u_password" />
      </div>
      <button type="submit">เข้าสู่ระบบ</button>
    </form>
  </div>
</template>

<script setup>
    definePageMeta({ layout: 'empty' })
    const error = ref('')
    const u_username = ref('')
    const u_password = ref('')

    const login = () => {
    error.value = ''

    if (!u_username.value || !u_password.value) {
        error.value = 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน'
        return
    }
    // ติดต่อ API ในอนาคต
    console.log(u_username.value, u_password.value)
    }
</script>
