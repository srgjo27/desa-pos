<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useShifts } from '@/composables/useShifts'
import { formatDate } from '@/utils/formatCurrency'
import { getDurationInfo } from '@/utils/shiftHelpers'
import { formatTime } from '../../utils/formatCurrency'

const router = useRouter()
const authStore = useAuthStore()
const { shifts, loading, error, fetchShifts } = useShifts()

const currentPage = ref(1)
const itemsPerPage = ref(20)
const itemsPerPageOptions = [10, 20, 30, 50]

const totalPages = computed(() => {
  if (!shifts.value) return 1
  return Math.max(1, Math.ceil(shifts.value.length / itemsPerPage.value))
})

const paginatedShifts = computed(() => {
  if (!shifts.value) return []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return shifts.value.slice(start, end)
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

  await fetchShifts()
  currentPage.value = 1
})
</script>

<template>
  <AdminLayout title="Rekap Shift Kasir" subtitle="Analisis absensi dan durasi kerja harian" activeTab="shifts">

    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold">Riwayat Absensi</h2>
        <p class="text-sm text-gray-500">Memonitor kedisiplinan shift kerja karyawan berdasarkan waktu standar 8 Jam.
        </p>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error"
      class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
      <svg class="w-5 h-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd" />
      </svg>
      <span class="text-sm font-medium">{{ error }}</span>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-700 whitespace-nowrap">
          <thead class="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider font-bold">
            <tr>
              <th class="px-6 py-4 border-r border-gray-100">Kasir/Pegawai</th>
              <th class="px-6 py-4 border-r border-gray-100 text-center">Jadwal Tugas</th>
              <th class="px-6 py-4 border-r border-gray-100 text-center">Durasi Total</th>
              <th class="px-6 py-4 border-r border-gray-100 text-center">Evaluasi 8 Jam</th>
              <th class="px-6 py-4 text-center w-32 border-l border-gray-100">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center text-gray-400 font-medium">
                <svg class="animate-spin w-6 h-6 text-green-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                Memuat riwayat arsip...
              </td>
            </tr>
            <tr v-else-if="shifts.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50">
                Belum ada kasir yang pernah membuka shift absensi.
              </td>
            </tr>
            <tr v-else v-for="shift in paginatedShifts" :key="shift.id" class="hover:bg-blue-50/30 transition-colors">
              <td class="px-6 py-4 border-r border-gray-100">
                <div class="font-bold">{{ shift.users?.name || 'GUEST' }}</div>
                <div class="text-xs text-gray-500 font-mono mt-0.5">{{ shift.users?.employee_number || 'N/A' }}</div>
              </td>

              <td class="px-6 py-4 text-center border-r border-gray-100">
                <div class="font-medium mb-1">{{ formatDate(shift.opened_at) }}</div>
                <div class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                  {{ formatTime(shift.opened_at) }}
                  -
                  {{ shift.closed_at ? formatTime(shift.closed_at) : 'Sekarang' }}
                </div>
              </td>

              <td class="px-6 py-4 text-center border-r border-gray-100 font-black text-gray-700 text-base">
                {{ getDurationInfo(shift.opened_at, shift.closed_at).text }}
              </td>

              <td class="px-6 py-4 text-center border-r border-gray-100">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap"
                  :class="getDurationInfo(shift.opened_at, shift.closed_at).isOver ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'">
                  {{ getDurationInfo(shift.opened_at, shift.closed_at).label }}
                </span>
              </td>

              <td class="px-6 py-4 text-center border-l border-gray-100">
                <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black border"
                  :class="shift.status === 'OPEN' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-100 text-gray-600 border-gray-200'">
                  <span v-if="shift.status === 'OPEN'"
                    class="w-1.5 h-1.5 rounded-full mr-1.5 bg-orange-500 animate-pulse"></span>
                  {{ shift.status === 'OPEN' ? 'AKTIF BEKERJA' : 'TUTUP / SELESAI' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="shifts.length > 0"
        class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">

        <!-- Pilihan Data per Halaman -->
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span class="font-medium">Tampilkan:</span>
          <select v-model="itemsPerPage" @change="handleItemsPerPageChange"
            class="bg-white border border-gray-300 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-1.5 outline-none font-bold">
            <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <span class="font-medium text-gray-500">absensi</span>
        </div>

        <!-- Kontrol Pindah Halaman -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 font-medium">
            Halaman <span class="font-bold">{{ currentPage }}</span> dari <span class="font-bold">{{ totalPages
              }}</span>
            <span class="text-gray-400 ml-1">({{ shifts.length }} rekaman)</span>
          </span>
          <div class="inline-flex rounded-md">
            <button @click="prevPage" :disabled="currentPage === 1"
              class="px-3 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors">
              Mundur
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages"
              class="px-3 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 border-l-0 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors">
              Maju
            </button>
          </div>
        </div>

      </div>

    </div>

  </AdminLayout>
</template>
