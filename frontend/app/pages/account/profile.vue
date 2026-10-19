<script setup lang="ts">
definePageMeta({ layout: 'account' })

const api = useApi()
const profile = ref<any>(null)
const error = ref('')

onMounted(async () => {
  try {
    profile.value = (await api.get('/user/me')).data
  } catch (e) {
    error.value = apiError(e)
  }
})
</script>

<template>
  <div class="card">
    <h1>ข้อมูลส่วนตัว</h1>
    <p v-if="error" class="alert alert-error">{{ error }}</p>

    <div v-if="profile" class="profile">
      <UserAvatar :photo="profile.u_photo" :name="profile.u_firstname || profile.u_username" />
      <dl>
        <dt>ชื่อผู้ใช้</dt><dd>{{ profile.u_username }}</dd>
        <dt>ชื่อ - นามสกุล</dt><dd>{{ profile.u_firstname || '-' }} {{ profile.u_lastname || '' }}</dd>
        <dt>ที่อยู่</dt><dd>{{ profile.u_address || '-' }}</dd>
        <dt>ตำแหน่ง</dt><dd>{{ profile.u_position || '-' }}</dd>
        <dt>ระดับผู้ใช้</dt><dd><span class="badge">{{ profile.level_name }}</span></dd>
      </dl>
    </div>
  </div>
</template>

<style scoped>
.profile { display: flex; gap: 28px; align-items: flex-start; flex-wrap: wrap; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 10px 20px; margin: 0; }
dt { color: var(--muted); font-size: 0.9rem; }
dd { margin: 0; }
</style>
