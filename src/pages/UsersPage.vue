<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useUsers } from '@/composables/useUsers'
import { formatDate } from '@/utils/formatCurrency'
import ToggleUserModal from '@/components/users/ToggleUserModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const { users, loading, error, fetchUsers, toggleUserStatus } = useUsers()

const isToggleModalOpen = ref(false)
const userToToggle = ref(null)
const isToggling = ref(false)

function openToggleModal(user) {
  userToToggle.value = user
  isToggleModalOpen.value = true
}

async function handleConfirmToggle(user) {
  isToggling.value = true
  const success = await toggleUserStatus(user.id, user.is_active)
  isToggling.value = false
  if (success) {
    isToggleModalOpen.value = false
    userToToggle.value = null
  }
}

const currentPage = ref(1)
const itemsPerPage = ref(20)
const itemsPerPageOptions = [10, 20, 30, 50]

const totalPages = computed(() => {
  if (!users.value) return 1
  return Math.max(1, Math.ceil(users.value.length / itemsPerPage.value))
})

const paginatedUsers = computed(() => {
  if (!users.value) return []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return users.value.slice(start, end)
})

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function handleItemsPerPageChange() {
  currentPage.value = 1
}

onMounted(async () => {
  if (authStore.role !== 'ADMIN') {
    alert('Akses Ditolak. Halaman ini hanya untuk ADMIN.')
    router.push({ name: 'POS' })
    return
  }
  await fetchUsers()
  currentPage.value = 1
})
</script>

<template>
  <AdminLayout title="Manajemen Pengguna" subtitle="Daftar Kasir & Admin BUMDes" activeTab="users">
    
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-gray-900">Pengguna Sistem</h2>
        <p class="text-sm text-gray-500">Daftar akun pengawas (Admin) dan pelayan masyarakat (Kasir).</p>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
       <svg class="w-5 h-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
       <span class="text-sm font-medium">{{ error }}</span>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-700">
          <thead class="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider font-bold">
            <tr>
              <th class="px-6 py-4 w-12 border-r border-gray-100 text-center">No</th>
              <th class="px-6 py-4">Nama Pengguna</th>
              <th class="px-6 py-4 border-l border-gray-100">No. Pegawai</th>
              <th class="px-6 py-4 border-l border-gray-100">Peran Pribadi</th>
              <th class="px-6 py-4 border-l border-gray-100">Tgl Terdaftar</th>
              <th class="px-6 py-4 text-center border-l border-gray-100 w-36">Status Akun</th>
              <th class="px-6 py-4 text-center border-l border-gray-100 w-32">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400 font-medium">
                Mengunduh data karyawan...
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400 font-medium">
                Belum ada pengguna yang terdaftar.
              </td>
            </tr>
            <tr 
              v-else
              v-for="(user, idx) in paginatedUsers" 
              :key="user.id"
              class="hover:bg-gray-50/80 transition-colors"
            >
              <td class="px-6 py-4 text-center text-gray-400 font-bold border-r border-gray-100">
                {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
              </td>
              <td class="px-6 py-4 font-bold text-gray-900 border-r border-gray-100">
                <div class="flex items-center gap-3">
                  <div v-if="user.img_url" class="w-8 h-8 rounded-full border border-gray-200 overflow-hidden shrink-0">
                    <img :src="user.img_url" alt="Avatar" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm border border-blue-200 shrink-0">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  {{ user.name }}
                </div>
              </td>
              <td class="px-6 py-4 font-mono text-sm text-gray-600 border-l border-gray-100">
                {{ user.employee_number || '-' }}
              </td>
              <td class="px-6 py-4 border-l border-gray-100">
                <span 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border"
                  :class="user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-orange-50 text-orange-700 border-orange-200'"
                >
                  <svg v-if="user.role === 'ADMIN'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-500 font-medium text-sm border-l border-gray-100">{{ formatDate(user.created_at) }}</td>
              <td class="px-6 py-4 text-center border-l border-gray-100">
                <span 
                  class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black border"
                  :class="user.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-2" :class="user.is_active ? 'bg-green-500' : 'bg-red-500'"></span>
                  {{ user.is_active ? 'AKTIF' : 'NON-AKTIF' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center border-l border-gray-100">
                <button 
                  v-if="user.role === 'KASIR'"
                  @click="openToggleModal(user)"
                  :disabled="isToggling"
                  class="px-3 py-1.5 rounded-md text-xs font-bold border transition-colors focus:outline-none w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
                  :class="user.is_active ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'"
                >
                  <svg v-if="user.is_active" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                  <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  {{ user.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="users.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <!-- Pilihan Data per Halaman -->
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span class="font-medium">Tampilkan:</span>
          <select 
            v-model="itemsPerPage" 
            @change="handleItemsPerPageChange"
            class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-1.5 outline-none font-bold"
          >
            <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <span class="font-medium text-gray-500">data</span>
        </div>

        <!-- Kontrol Pindah Halaman -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 font-medium">
            Halaman <span class="font-bold text-gray-900">{{ currentPage }}</span> dari <span class="font-bold text-gray-900">{{ totalPages }}</span>
            <span class="text-gray-400 ml-1">({{ users.length }} total pengguna)</span>
          </span>
          <div class="inline-flex rounded-md shadow-sm">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-3 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors"
            >
              Sebelumnya
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 border-l-0 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- Modals -->
    <ToggleUserModal 
      :isOpen="isToggleModalOpen" 
      :user="userToToggle"
      :isLoading="isToggling"
      @close="isToggleModalOpen = false" 
      @confirm="handleConfirmToggle"
    />

  </AdminLayout>
</template>
