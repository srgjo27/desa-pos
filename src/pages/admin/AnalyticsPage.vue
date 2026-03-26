<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { formatRupiah } from '@/utils/formatCurrency'
import { formatDate, formatTime } from '../../utils/formatCurrency'

const router = useRouter()
const authStore = useAuthStore()
const analytics = useAnalytics()

const startDate = ref('')
const endDate = ref('')

onMounted(async () => {
  if (authStore.role !== 'ADMIN') {
    alert('Akses Ditolak. Halaman ini hanya untuk ADMIN.')
    router.push({ name: 'POS' })
    return
  }

  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

  startDate.value = firstDay.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]

  await fetchAnalytics()
})

async function fetchAnalytics() {
  await analytics.fetchProfitMetrics(startDate.value, endDate.value)
}

const summaryMetrics = computed(() => {
  const data = analytics.profitData.value

  const totalOmzet = data.reduce((sum, item) => sum + (Number(item.grand_total) || 0), 0)
  const totalModal = data.reduce((sum, item) => sum + (Number(item.total_modal) || 0), 0)
  const totalLaba = data.reduce((sum, item) => sum + (Number(item.laba_kotor) || 0), 0)

  return { totalOmzet, totalModal, totalLaba }
})
</script>

<template>
  <AdminLayout title="Analisis Keuangan" subtitle="Laporan Laba/Rugi BUMDes" activeTab="analytics">

    <!-- Filter Bar -->
    <div class="bg-white p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-end gap-4 mb-6">
      <div class="w-full sm:w-auto flex-1 max-w-xs">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mulai Tanggal</label>
        <input v-model="startDate" type="date"
          class="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-green-600 outline-none font-medium transition-colors">
      </div>
      <div class="w-full sm:w-auto flex-1 max-w-xs">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Sampai Tanggal</label>
        <input v-model="endDate" type="date"
          class="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-green-600 outline-none font-medium transition-colors">
      </div>

      <button @click="fetchAnalytics" :disabled="analytics.loading.value"
        class="w-full sm:w-auto px-5 py-2 bg-green-900 hover:bg-green-700 text-white rounded-md font-bold text-sm transition-colors focus:outline-none flex items-center justify-center gap-2 border border-transparent disabled:opacity-50">
        <svg v-if="analytics.loading.value" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Terapkan
      </button>
    </div>

    <!-- Top Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <!-- Omzet -->
      <div class="bg-white p-5 border border-gray-200 rounded-lg flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Total Pendapatan (Kotor)</p>
          <p class="text-xl font-black text-gray-900 leading-none">{{ formatRupiah(summaryMetrics.totalOmzet) }}</p>
        </div>
      </div>

      <!-- HPP / Modal -->
      <div class="bg-white p-5 border border-gray-200 rounded-lg flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Total Harga Modal (HPP)</p>
          <p class="text-xl font-black text-gray-900 leading-none">{{ formatRupiah(summaryMetrics.totalModal) }}</p>
        </div>
      </div>

      <!-- Laba Bersih -->
      <div class="bg-white p-5 border border-gray-200 rounded-lg flex items-center gap-4 relative overflow-hidden">
        <!-- Decorative Accents -->
        <div class="absolute -right-4 -top-4 w-16 h-16 bg-green-50 rounded-full opacity-50"></div>
        <div class="absolute -right-2 -bottom-2 w-10 h-10 bg-green-100 rounded-full opacity-50"></div>

        <div
          class="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center border border-green-200 z-10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div class="z-10">
          <p class="text-xs text-green-800 font-bold uppercase tracking-wide mb-1">Total Laba Keuntungan</p>
          <p class="text-xl font-black text-green-700 leading-none">{{ formatRupiah(summaryMetrics.totalLaba) }}</p>
        </div>
      </div>
    </div>

    <!-- Tabel Profit Margin -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h2 class="font-bold text-gray-800">Rincian Laba per Transaksi</h2>
        <span class="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">{{
          analytics.profitData.value.length }} Transaksi</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-700">
          <thead class="bg-white text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider font-bold">
            <tr>
              <th class="px-6 py-4 border-r border-gray-100 w-44">Tgl Transaksi</th>
              <th class="px-6 py-4 border-r border-gray-100">Kasir</th>
              <th class="px-6 py-4 text-right border-l border-gray-100" title="Total Nilai Barang (HPP)">Total Modal
              </th>
              <th class="px-6 py-4 text-right border-l border-gray-100" title="Omzet Pembeli">Pendapatan</th>
              <th class="px-6 py-4 text-right w-36 bg-green-50/50 text-green-800">Laba Bersih</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="analytics.loading.value">
              <td colspan="5" class="px-6 py-12 text-center text-gray-400 font-medium">Memuat data analitik...</td>
            </tr>
            <tr v-else-if="analytics.profitData.value.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-400 font-medium">Tidak ada transaksi ditemukan
                pada rentang tanggal ini.</td>
            </tr>
            <tr v-else v-for="item in analytics.profitData.value" :key="item.sale_id"
              class="hover:bg-gray-50/80 transition-colors group">
              <td class="px-6 py-3 border-r border-gray-100">
                <p class="font-bold text-gray-900">{{ formatDate(item.created_at) }}</p>
                <p class="text-xs text-gray-400 font-mono">{{ formatTime(item.created_at) }}</p>
              </td>
              <td class="px-6 py-3 border-r border-gray-100 font-medium text-gray-700">
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                    {{ item.kasir.charAt(0).toUpperCase() }}
                  </div>
                  {{ item.kasir }}
                </div>
              </td>
              <td class="px-6 py-3 text-right font-mono text-sm text-gray-500 border-l border-gray-100">{{
                formatRupiah(item.total_modal || 0) }}</td>
              <td class="px-6 py-3 text-right font-mono text-sm font-bold text-gray-800 border-l border-gray-100">{{
                formatRupiah(item.grand_total || 0) }}</td>
              <td class="px-6 py-3 text-right bg-green-50/30 group-hover:bg-green-50/70 border-l border-gray-100">
                <span class="inline-flex items-center justify-center font-mono font-bold text-sm text-green-700">
                  {{ formatRupiah(item.laba_kotor || 0) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </AdminLayout>
</template>
