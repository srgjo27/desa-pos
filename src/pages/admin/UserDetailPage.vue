<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ToggleUserModal from '@/components/users/ToggleUserModal.vue'
import { useUsers } from '@/composables/useUsers'
import { useShifts } from '@/composables/useShifts'
import { formatDate, formatTime } from '@/utils/formatCurrency'
import { WORK_MINUTES_PER_WEEK, getDiffMinutes, formatDuration, getMonday, getSunday, getDurationInfo } from '@/utils/shiftHelpers'

const route = useRoute()
const router = useRouter()
const { getUserById, toggleUserStatus } = useUsers()
const { shifts, loading: shiftsLoading, fetchShiftsByUserId } = useShifts()

const userId = route.params.id
const user = ref(null)
const loading = ref(true)
const error = ref(null)

const isToggleModalOpen = ref(false)
const isToggling = ref(false)
const selectedWeekOffset = ref(0)

const isCurrentWeek = computed(() => selectedWeekOffset.value === 0)
const selectedMonday = computed(() => getMonday(new Date(), selectedWeekOffset.value))
const selectedSunday = computed(() => getSunday(selectedMonday.value))

const weekLabel = computed(() => {
  return `${formatDate(selectedMonday.value)} — ${formatDate(selectedSunday.value)}`
})

const filteredShifts = computed(() => {
  if (!shifts.value?.length) return []
  return shifts.value.filter(s => {
    const d = new Date(s.opened_at)
    return d >= selectedMonday.value && d <= selectedSunday.value
  })
})

const weeklyStats = computed(() => {
  const defaultStats = { totalMinutes: 0, text: '0j 0m', diffText: 'Kurang 40j 0m', isMet: false, targetMinutes: WORK_MINUTES_PER_WEEK }
  if (!filteredShifts.value.length) return defaultStats

  let totalMinutes = 0
  filteredShifts.value.forEach(s => {
    totalMinutes += getDiffMinutes(s.opened_at, s.closed_at)
  })

  const isMet = totalMinutes >= WORK_MINUTES_PER_WEEK
  let diffText = ''

  if (isMet) {
    const extra = totalMinutes - WORK_MINUTES_PER_WEEK
    diffText = extra > 0
      ? `Memenuhi Target (Lembur +${formatDuration(extra)})`
      : 'Memenuhi Target Pas (40 Jam)'
  } else {
    const lack = WORK_MINUTES_PER_WEEK - totalMinutes
    diffText = `Kurang ${formatDuration(lack)} dari Target Mingguan`
  }

  return {
    totalMinutes,
    text: formatDuration(totalMinutes),
    diffText,
    isMet,
    targetMinutes: WORK_MINUTES_PER_WEEK
  }
})

function prevWeek() { selectedWeekOffset.value-- }
function nextWeek() { if (selectedWeekOffset.value < 0) selectedWeekOffset.value++ }
function resetWeek() { selectedWeekOffset.value = 0 }

async function handleConfirmToggle(userData) {
  isToggling.value = true
  const success = await toggleUserStatus(userData.id, userData.is_active)
  isToggling.value = false
  if (success) {
    user.value.is_active = !userData.is_active
    isToggleModalOpen.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await getUserById(userId)
    if (data) {
      user.value = data
      if (data.role === 'KASIR') {
        await fetchShiftsByUserId(userId)
      }
    } else {
      error.value = 'Profil pengguna tidak ditemukan atau tidak valid.'
    }
  } catch (err) {
    error.value = 'Terjadi kesalahan sistem saat memuat profil.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AdminLayout title="Profil Pengguna" subtitle="Informasi rincian akun pegawai" activeTab="users">
    
    <div class="mb-6">
      <button 
        @click="router.push('/users')" 
        class="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Kembali ke Daftar
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-12 rounded-xl text-center">
       <svg class="w-12 h-12 mx-auto text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
       <h3 class="font-bold text-lg text-red-900">Gagal Memuat Profil</h3>
       <p class="text-red-700">{{ error }}</p>
       <button @click="router.push('/users')" class="mt-4 px-4 py-2 bg-red-100 font-bold hover:bg-red-200 text-red-800 rounded-lg text-sm transition-colors">Lihat Daftar Semua Pengguna</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <svg class="animate-spin w-8 h-8 text-green-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p class="text-gray-500 font-medium">Sedang menyinkronkan data profil...</p>
    </div>

    <!-- Content State -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Kartu Profil Pribadi -->
      <div class="col-span-1 border border-gray-200 bg-white rounded-xl overflow-hidden flex flex-col items-center p-8">
        
        <div class="relative w-32 h-32 mb-5">
          <div v-if="user.img_url" class="rounded-full border-4 border-gray-50 w-full h-full overflow-hidden bg-white">
            <img :src="user.img_url" alt="Avatar" class="w-full h-full object-cover" />
          </div>
          <div v-else class="rounded-full border-4 border-gray-50 bg-blue-100 text-blue-700 w-full h-full flex items-center justify-center font-black text-4xl">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          
          <div 
            class="absolute bottom-4 right-1 w-6 h-6 border-1 border-white rounded-full"
            :class="user.is_active ? 'bg-green-500' : 'bg-red-500'"
            :title="user.is_active ? 'Aktif' : 'Non-Aktif'"
          ></div>
        </div>

        <h2 class="text-2xl font-black text-gray-900 text-center leading-tight">{{ user.name }}</h2>
        <p class="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest text-center">{{ user.role }}</p>

        <div class="w-full mt-8 border-t border-gray-100 pt-6">
          <button 
            v-if="user.role === 'KASIR'"
            @click="isToggleModalOpen = true"
            class="w-full py-2.5 rounded-lg text-sm font-bold border transition-colors focus:outline-none flex items-center justify-center gap-2"
            :class="user.is_active ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'"
          >
            <svg v-if="user.is_active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{ user.is_active ? 'Blokir Akses' : 'Pulihkan Akses' }}
          </button>
          
          <div v-else class="bg-purple-50 text-purple-700 border border-purple-100 rounded-lg p-3 text-center text-xs font-bold flex items-center justify-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Pengguna Ini Tidak Dapat Diblokir
          </div>
        </div>

      </div>

      <!-- Detail Informasi -->
      <div class="col-span-1 md:col-span-2 space-y-6">
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          
          <div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h3 class="font-bold text-gray-900">Informasi Kepegawaian</h3>
          </div>
          
          <div class="p-6">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500 mb-1">ID Sistem Pendaftaran</dt>
                <dd class="text-sm font-bold text-gray-900 break-all bg-gray-50 p-2 rounded border border-gray-100 font-mono">{{ user.id }}</dd>
              </div>
              
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500 mb-1">Nomor Induk Pegawai</dt>
                <dd class="text-base font-bold text-gray-900 border-l-2 border-green-500 pl-3">
                  {{ user.employee_number || 'Tidak Dilengkapi (GUEST)' }}
                </dd>
              </div>
              
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500 mb-1">Status Keanggotaan</dt>
                <dd class="mt-1">
                  <span 
                    class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black border"
                    :class="user.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full mr-2" :class="user.is_active ? 'bg-green-500' : 'bg-red-500'"></span>
                    {{ user.is_active ? 'AKTIF BEKERJA' : 'AKUN DITANGGUHKAN' }}
                  </span>
                </dd>
              </div>

              <div class="sm:col-span-1 border-t border-gray-100 pt-4 mt-2 sm:mt-0 sm:border-t-0 sm:pt-0">
                <dt class="text-sm font-medium text-gray-500 mb-1">Nomor Telepon</dt>
                <dd class="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  {{ user.phone || 'Tidak Ada Data' }}
                </dd>
              </div>

              <div class="sm:col-span-1 border-t border-gray-100 pt-4 mt-2 sm:mt-0 sm:border-t-0 sm:pt-0">
                <dt class="text-sm font-medium text-gray-500 mb-1">Tanggal Mulai Dinas</dt>
                <dd class="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {{ formatDate(user.created_at) }}
                </dd>
              </div>

              <div class="sm:col-span-2 border-t border-gray-100 pt-4">
                <dt class="text-sm font-medium text-gray-500 mb-2">Alamat Tempat Tinggal</dt>
                <dd class="text-sm font-medium text-gray-800 bg-gray-50 p-3.5 rounded-lg border border-gray-100 leading-relaxed">
                  {{ user.address || 'Alamat belum dilengkapi oleh pengguna.' }}
                </dd>
              </div>

            </dl>
          </div>
        </div>
      </div>

      <!-- Statistik Kinerja Mingguan -->
      <div v-if="user.role === 'KASIR'" class="col-span-1 md:col-span-3 mt-2 flex flex-col gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4 w-full lg:w-auto">
            <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center shrink-0 text-blue-600 border border-blue-100">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-lg">Pencapaian Jam Kerja</h3>
              <p class="text-sm text-gray-500">{{ weekLabel }}</p>
            </div>
          </div>
          
          <div class="w-full lg:w-1/2 flex flex-col gap-3">
            <div class="flex flex-wrap justify-between items-end gap-2">
              <div>
                <span class="text-3xl font-black" :class="weeklyStats.isMet ? 'text-green-600' : 'text-blue-700'">{{ weeklyStats.text }}</span>
                <span class="text-gray-500 font-medium ml-2">/ 40j 0m</span>
              </div>
              <span class="px-3 py-1.5 bg-white rounded-lg font-bold text-xs border border-gray-100" :class="weeklyStats.isMet ? 'text-green-600' : 'text-orange-600'">
                {{ weeklyStats.diffText }}
              </span>
            </div>
            
            <div class="h-3 w-full bg-blue-100/50 rounded-full overflow-hidden border border-blue-200/50">
              <div class="h-full rounded-full transition-all duration-1000 ease-out" 
                   :class="weeklyStats.isMet ? 'bg-green-500' : 'bg-blue-500'"
                   :style="{ width: Math.min(100, (weeklyStats.totalMinutes / weeklyStats.targetMinutes) * 100) + '%' }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Histori Absensi Shift -->
      <div v-if="user.role === 'KASIR'" class="col-span-1 md:col-span-3">
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          
          <div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h3 class="font-bold text-gray-900">Histori Absensi Sesi (Shift)</h3>
            
            <div class="flex items-center gap-2">
              <button @click="prevWeek" class="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors focus:outline-none">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button 
                @click="resetWeek" 
                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors focus:outline-none"
                :class="isCurrentWeek ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
              >
                {{ weekLabel }}
              </button>
              <button 
                @click="nextWeek" 
                :disabled="isCurrentWeek" 
                class="p-1.5 rounded-lg border border-gray-200 bg-white transition-colors focus:outline-none"
                :class="isCurrentWeek ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'"
              >
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-700 whitespace-nowrap">
              <thead class="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th class="px-6 py-4 border-r border-gray-100 text-center">Jadwal Tugas</th>
                  <th class="px-6 py-4 border-r border-gray-100 text-center">Durasi Total</th>
                  <th class="px-6 py-4 border-r border-gray-100 text-center">Evaluasi 8 Jam</th>
                  <th class="px-6 py-4 text-center w-32 border-l border-gray-100">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="shiftsLoading">
                  <td colspan="4" class="px-6 py-12 text-center text-gray-400 font-medium">
                    <svg class="animate-spin w-6 h-6 text-green-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memuat histori histori shift...
                  </td>
                </tr>
                <tr v-else-if="filteredShifts.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50">
                    Tidak ada riwayat shift pada periode ini.
                  </td>
                </tr>
                <tr 
                  v-else
                  v-for="shift in filteredShifts" 
                  :key="shift.id"
                  class="hover:bg-blue-50/30 transition-colors"
                >
                  <td class="px-6 py-4 text-center border-r border-gray-100">
                    <div class="text-gray-900 font-medium mb-1">{{ formatDate(shift.opened_at) }}</div>
                    <div class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                      {{ formatTime(shift.opened_at) }} - {{ formatTime(shift.closed_at) }}
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
                    <span 
                      class="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black border"
                      :class="shift.status === 'OPEN' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-100 text-gray-600 border-gray-200'"
                    >
                      <span v-if="shift.status === 'OPEN'" class="w-1.5 h-1.5 rounded-full mr-1.5 bg-orange-500 animate-pulse"></span>
                      {{ shift.status === 'OPEN' ? 'AKTIF BEKERJA' : 'TUTUP / SELESAI' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <!-- Modals -->
    <ToggleUserModal 
      :isOpen="isToggleModalOpen" 
      :user="user"
      :isLoading="isToggling"
      @close="isToggleModalOpen = false" 
      @confirm="handleConfirmToggle"
    />

  </AdminLayout>
</template>
