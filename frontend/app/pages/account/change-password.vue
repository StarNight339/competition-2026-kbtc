<script setup lang="ts">
definePageMeta({ layout: 'account' })

const api = useApi()
const form = reactive({ old_password: '', new_password: '', confirm: '' })
const error = ref('')
const success = ref('')
const saving = ref(false)

const save = async () => {
  error.value = ''
  success.value = ''

  if (form.new_password.length < 8) return (error.value = 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร')
  if (form.new_password !== form.confirm) return (error.value = 'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน')

  saving.value = true
  try {
    const res = await api.put('/user/me/password', {
      old_password: form.old_password,
      new_password: form.new_password
    })
    success.value = res.message
    form.old_password = form.new_password = form.confirm = ''
  } catch (e) {
    error.value = apiError(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="card narrow">
    <h1>เปลี่ยนรหัสผ่าน</h1>
    <p v-if="error" class="alert alert-error">{{ error }}</p>
    <p v-if="success" class="alert alert-success">{{ success }}</p>

    <form @submit.prevent="save">
      <div class="field">
        <label for="old">รหัสผ่านเดิม</label>
        <input id="old" v-model="form.old_password" type="password" autocomplete="current-password" required>
      </div>
      <div class="field">
        <label for="new">รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</label>
        <input id="new" v-model="form.new_password" type="password" autocomplete="new-password" required>
      </div>
      <div class="field">
        <label for="confirm">ยืนยันรหัสผ่านใหม่</label>
        <input id="confirm" v-model="form.confirm" type="password" autocomplete="new-password" required>
      </div>
      <button class="btn btn-primary" :disabled="saving">{{ saving ? 'กำลังบันทึก…' : 'เปลี่ยนรหัสผ่าน' }}</button>
    </form>
  </div>
</template>

<style scoped>
.narrow { max-width: 480px; }
</style>
