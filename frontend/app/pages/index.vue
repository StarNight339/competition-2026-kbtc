<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const api = useApi()
const { user, hasRole } = useAuth()

const stats = ref<{ level_name: string; total: number }[]>([])
const error = ref('')

onMounted(async () => {
  if (!hasRole('Admin', 'Staff')) return
  try {
    const res = await api.get('/user/stats')
    stats.value = res.data
  } catch (e) {
    error.value = apiError(e)
  }
})

const total = computed(() => stats.value.reduce((sum, s) => sum + Number(s.total), 0))

const chartData = computed(() => ({
  labels: stats.value.map(s => s.level_name),
  datasets: [{ label: 'จำนวนผู้ใช้', data: stats.value.map(s => Number(s.total)), backgroundColor: '#2f6fed', borderRadius: 6 }]
}))
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
}
</script>

<template>
  <div>
    <h1>ยินดีต้อนรับเข้าสู่ระบบ</h1>
    <p class="muted">เข้าสู่ระบบในชื่อ <b>{{ user?.username }}</b> สิทธิ์ <span class="badge">{{ user?.role }}</span></p>

    <div v-if="hasRole('Admin', 'Staff')" class="card stats">
      <div class="spread">
        <h2>ผู้ใช้งานแยกตามระดับ</h2>
        <span class="muted">ทั้งหมด {{ total }} คน</span>
      </div>
      <p v-if="error" class="alert alert-error">{{ error }}</p>
      <div class="chart">
        <ClientOnly>
          <Bar v-if="stats.length" :data="chartData" :options="chartOptions" />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats { margin-top: 24px; }
.chart { height: 280px; }
</style>
