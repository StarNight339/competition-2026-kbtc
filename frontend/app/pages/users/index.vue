<script setup lang="ts">
// Admin: เพิ่ม / แก้ไข / ลบ ได้ทุกอย่าง
// Staff: ดูรายชื่อ และเพิ่มได้เฉพาะผู้ใช้ระดับ User
definePageMeta({ roles: ['Admin', 'Staff'] })

const api = useApi()
const { user, hasRole } = useAuth()
const isAdmin = computed(() => hasRole('Admin'))

const users = ref<any[]>([])
const levels = ref<{ level_id: number; level_name: string }[]>([])
const error = ref('')
const success = ref('')

const empty = () => ({
  u_username: '', u_password: '', u_firstname: '', u_lastname: '',
  u_address: '', u_position: '', u_level_id: 3
})
const form = reactive(empty())
const editingId = ref<number | null>(null)
const showForm = ref(false)
const saving = ref(false)

const load = async () => {
  try {
    const [u, l] = await Promise.all([api.get('/user/getall'), api.get('/user/getlevels')])
    users.value = u.data
    levels.value = l.data
  } catch (e) {
    error.value = apiError(e)
  }
}
onMounted(load)

const openCreate = () => {
  Object.assign(form, empty())
  editingId.value = null
  showForm.value = true
  error.value = success.value = ''
}

const openEdit = (u: any) => {
  Object.assign(form, { ...empty(), ...u, u_password: '' })
  editingId.value = u.u_id
  showForm.value = true
  error.value = success.value = ''
}

const save = async () => {
  error.value = success.value = ''
  saving.value = true
  try {
    if (editingId.value) {
      const { u_firstname, u_lastname, u_address, u_position, u_level_id } = form
      const res = await api.put(`/user/update/${editingId.value}`, { u_firstname, u_lastname, u_address, u_position, u_level_id })
      success.value = res.message
    } else {
      const res = await api.post('/user/create', form)
      success.value = res.message
    }
    showForm.value = false
    await load()
  } catch (e) {
    error.value = apiError(e)
  } finally {
    saving.value = false
  }
}

const remove = async (u: any) => {
  if (!confirm(`ลบผู้ใช้ ${u.u_username} ?`)) return
  error.value = success.value = ''
  try {
    const res = await api.del(`/user/delete/${u.u_id}`)
    success.value = res.message
    await load()
  } catch (e) {
    error.value = apiError(e)
  }
}
</script>

<template>
  <div>
    <div class="spread head">
      <h1>จัดการผู้ใช้งาน</h1>
      <button class="btn btn-primary" @click="openCreate">+ เพิ่มผู้ใช้</button>
    </div>

    <p v-if="error" class="alert alert-error">{{ error }}</p>
    <p v-if="success" class="alert alert-success">{{ success }}</p>

    <!-- ฟอร์มเพิ่ม / แก้ไข -->
    <div v-if="showForm" class="card form-card">
      <h2>{{ editingId ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่' }}</h2>
      <form @submit.prevent="save">
        <div class="grid-2">
          <div class="field">
            <label for="f-user">Username</label>
            <input id="f-user" v-model.trim="form.u_username" :disabled="!!editingId" required>
          </div>
          <div v-if="!editingId" class="field">
            <label for="f-pass">Password (อย่างน้อย 8 ตัว)</label>
            <input id="f-pass" v-model="form.u_password" type="password" autocomplete="new-password" required minlength="8">
          </div>
          <div class="field">
            <label for="f-first">ชื่อ</label>
            <input id="f-first" v-model.trim="form.u_firstname">
          </div>
          <div class="field">
            <label for="f-last">นามสกุล</label>
            <input id="f-last" v-model.trim="form.u_lastname">
          </div>
          <div class="field">
            <label for="f-pos">ตำแหน่ง</label>
            <input id="f-pos" v-model.trim="form.u_position">
          </div>
          <div class="field">
            <label for="f-level">ระดับผู้ใช้</label>
            <!-- Staff เลือกระดับไม่ได้ (backend บังคับเป็น User อยู่แล้ว) -->
            <select id="f-level" v-model.number="form.u_level_id" :disabled="!isAdmin">
              <option v-for="l in levels" :key="l.level_id" :value="l.level_id">{{ l.level_name }}</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="f-addr">ที่อยู่</label>
          <textarea id="f-addr" v-model.trim="form.u_address" rows="2" />
        </div>
        <div class="row">
          <button class="btn btn-primary" :disabled="saving">{{ saving ? 'กำลังบันทึก…' : 'บันทึก' }}</button>
          <button type="button" class="btn" @click="showForm = false">ยกเลิก</button>
        </div>
      </form>
    </div>

    <!-- ตารางผู้ใช้ -->
    <div class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Username</th><th>ชื่อ - นามสกุล</th><th>ตำแหน่ง</th><th>ระดับ</th>
            <th v-if="isAdmin" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.u_id">
            <td>{{ u.u_id }}</td>
            <td>{{ u.u_username }}</td>
            <td>{{ u.u_firstname }} {{ u.u_lastname }}</td>
            <td>{{ u.u_position || '-' }}</td>
            <td><span class="badge">{{ u.level_name }}</span></td>
            <td v-if="isAdmin">
              <div class="actions">
                <button class="btn btn-sm" @click="openEdit(u)">แก้ไข</button>
                <button v-if="u.u_id !== user?.id" class="btn btn-sm btn-danger" @click="remove(u)">ลบ</button>
              </div>
            </td>
          </tr>
          <tr v-if="!users.length">
            <td :colspan="isAdmin ? 6 : 5" class="muted">ไม่มีข้อมูล</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.head { margin-bottom: 16px; }
.head h1 { margin: 0; }
.form-card { margin-bottom: 20px; }
.actions { display: flex; gap: 6px; justify-content: flex-end; }
</style>
