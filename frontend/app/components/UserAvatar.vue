<script setup lang="ts">
const props = defineProps<{ photo?: string | null; name?: string | null; size?: number }>()
const { public: { fileBase } } = useRuntimeConfig()

// ถ้าโหลดรูปไม่ได้ (ไฟล์ถูกลบ / server ปิด) ให้แสดงตัวอักษรแทน
const broken = ref(false)
watch(() => props.photo, () => { broken.value = false })

const src = computed(() => {
  if (!props.photo || broken.value) return null
  // รูปที่เลือกแต่ยังไม่อัปโหลด (blob:) ใช้ตรงๆ ส่วนรูปจาก backend ต่อหน้าด้วย fileBase
  return props.photo.startsWith('blob:') ? props.photo : `${fileBase}${props.photo}`
})
const initial = computed(() => (props.name || '?').trim().charAt(0).toUpperCase())
const px = computed(() => `${props.size || 96}px`)
</script>

<template>
  <img v-if="src" :src="src" alt="รูปโปรไฟล์" class="avatar" @error="broken = true">
  <div v-else class="avatar placeholder">{{ initial }}</div>
</template>

<style scoped>
.avatar {
  width: v-bind(px);
  height: v-bind(px);
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border);
  flex-shrink: 0;
}
.placeholder {
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
  font-size: calc(v-bind(px) * 0.4);
}
</style>
