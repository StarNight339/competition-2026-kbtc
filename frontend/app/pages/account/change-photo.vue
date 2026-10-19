<script setup lang="ts">
definePageMeta({ layout: 'account' })

const api = useApi()
const current = ref<string | null>(null)
const name = ref('')
const file = ref<File | null>(null)
const preview = ref<string | null>(null)
const error = ref('')
const success = ref('')
const saving = ref(false)

onMounted(async () => {
  try {
    const me = (await api.get('/user/me')).data
    current.value = me.u_photo
    name.value = me.u_firstname || me.u_username
  } catch (e) {
    error.value = apiError(e)
  }
})

const pick = (ev: Event) => {
  error.value = ''
  success.value = ''
  const f = (ev.target as HTMLInputElement).files?.[0] || null
  if (f && f.size > 2 * 1024 * 1024) {
    error.value = 'ไฟล์ต้องมีขนาดไม่เกิน 2MB'
    return
  }
  if (preview.value) URL.revokeObjectURL(preview.value)
  file.value = f
  preview.value = f ? URL.createObjectURL(f) : null
}

const upload = async () => {
  if (!file.value) return
  saving.value = true
  error.value = ''
  try {
    const form = new FormData()
    form.append('photo', file.value)
    const res = await api.upload('/user/me/photo', form)
    current.value = res.data.u_photo
    success.value = res.message
    file.value = null
    preview.value = null
  } catch (e) {
    error.value = apiError(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="card">
    <h1>เปลี่ยนรูปโปรไฟล์</h1>
    <p v-if="error" class="alert alert-error">{{ error }}</p>
    <p v-if="success" class="alert alert-success">{{ success }}</p>

    <div class="row photo">
      <UserAvatar :photo="preview || current" :name="name" :size="120" />
      <div>
        <div class="field">
          <label for="photo">เลือกรูป (JPG, PNG, WEBP ไม่เกิน 2MB)</label>
          <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" @change="pick">
        </div>
        <button class="btn btn-primary" :disabled="!file || saving" @click="upload">
          {{ saving ? 'กำลังอัปโหลด…' : 'อัปโหลด' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.photo { gap: 28px; align-items: flex-start; }
</style>
