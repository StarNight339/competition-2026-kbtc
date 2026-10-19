<script setup lang="ts">
definePageMeta({ layout: 'account' })

const api = useApi()
const form = reactive({ u_firstname: '', u_lastname: '', u_address: '' })
const error = ref('')
const success = ref('')
const saving = ref(false)

onMounted(async () => {
  try {
    const me = (await api.get('/user/me')).data
    form.u_firstname = me.u_firstname || ''
    form.u_lastname = me.u_lastname || ''
    form.u_address = me.u_address || ''
  } catch (e) {
    error.value = apiError(e)
  }
})

// ส่งไปที่ /user/me — backend รับแค่ 3 ช่องนี้ แก้ระดับผู้ใช้ไม่ได้
const save = async () => {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    const res = await api.put('/user/me', form)
    success.value = res.message
  } catch (e) {
    error.value = apiError(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="card">
    <h1>แก้ไขข้อมูลส่วนตัว</h1>
    <p v-if="error" class="alert alert-error">{{ error }}</p>
    <p v-if="success" class="alert alert-success">{{ success }}</p>

    <form @submit.prevent="save">
      <div class="grid-2">
        <div class="field">
          <label for="first">ชื่อ</label>
          <input id="first" v-model.trim="form.u_firstname">
        </div>
        <div class="field">
          <label for="last">นามสกุล</label>
          <input id="last" v-model.trim="form.u_lastname">
        </div>
      </div>
      <div class="field">
        <label for="address">ที่อยู่</label>
        <textarea id="address" v-model.trim="form.u_address" rows="3" />
      </div>
      <button class="btn btn-primary" :disabled="saving">{{ saving ? 'กำลังบันทึก…' : 'บันทึก' }}</button>
    </form>
  </div>
</template>
