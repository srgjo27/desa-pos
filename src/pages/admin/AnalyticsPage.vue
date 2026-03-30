<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { useChartAnalytics } from '@/composables/useChartAnalytics'
import { formatRupiah } from '@/utils/formatCurrency'
import { formatDate, formatTime } from '../../utils/formatCurrency'
import { generateDailySalesReport } from '@/services/pdfExportService'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const router = useRouter()
const authStore = useAuthStore()
const analytics = useAnalytics()
const chartAnalytics = useChartAnalytics(analytics.monthlyData)

const startDate = ref('')
const endDate = ref('')
const isExporting = ref(false)

onMounted(async () => {
  if (authStore.role !== 'ADMIN') {
    alert('Akses Ditolak. Halaman ini hanya untuk ADMIN.')
    router.push({ name: 'POS' })
    return
  }

  const { startDate: initialStart, endDate: initialEnd } = analytics.initializeDateRange()
  startDate.value = initialStart
  endDate.value = initialEnd

  await fetchAnalytics()
  await analytics.fetchMonthlyMetrics()
})

async function fetchAnalytics() {
  const result = await analytics.fetchProfitMetrics(startDate.value, endDate.value)

  if (!result.success && result.error) {
    alert(`Error: ${result.error}`)
  }
}

async function handleResetFilter() {
  const { startDate: initialStart, endDate: initialEnd } = analytics.initializeDateRange()
  startDate.value = initialStart
  endDate.value = initialEnd

  await fetchAnalytics()
}

async function handleExportPDF() {
  const prepareResult = analytics.preparePdfExportData(
    startDate.value,
    endDate.value,
    analytics.summaryMetrics.value
  )

  if (!prepareResult.success) {
    alert(prepareResult.error)
    return
  }

  isExporting.value = true
  try {
    await generateDailySalesReport(prepareResult.data)
  } catch (err) {
    alert(`Gagal membuat laporan PDF: ${err.message}`)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <AdminLayout title="Analisis Keuangan" subtitle="Laporan Laba/Rugi BUMDes" activeTab="analytics">

    <!-- Filter Bar -->
    <div class="bg-white p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-end gap-4 mb-6">
      <div class="w-full sm:w-auto flex-1 max-w-xs">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mulai Tanggal</label>
        <input v-model="startDate" type="date"
          class="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-600 outline-none font-medium transition-colors">
      </div>
      <div class="w-full sm:w-auto flex-1 max-w-xs">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Sampai Tanggal</label>
        <input v-model="endDate" type="date"
          class="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-600 outline-none font-medium transition-colors">
      </div>

      <button @click="fetchAnalytics" :disabled="analytics.loading.value"
        class="w-full sm:w-auto px-5 py-2 bg-green-900 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors focus:outline-none flex items-center justify-center gap-2 border border-transparent disabled:opacity-50">
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

      <button @click="handleResetFilter" :disabled="analytics.loading.value"
        class="w-full sm:w-auto px-5 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold text-sm transition-colors focus:outline-none flex items-center justify-center gap-2 border border-transparent disabled:opacity-50">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset Filter
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
          <p class="text-xl font-black text-gray-900 leading-none">{{
            formatRupiah(analytics.summaryMetrics.value.totalOmzet) }}</p>
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
          <p class="text-xl font-black text-gray-900 leading-none">{{
            formatRupiah(analytics.summaryMetrics.value.totalModal) }}</p>
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
          <p class="text-xl font-black text-green-700 leading-none">{{
            formatRupiah(analytics.summaryMetrics.value.totalLaba) }}</p>
        </div>
      </div>
    </div>

    <!-- Monthly Analytics Charts -->
    <div v-if="analytics.monthlyData.value.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Revenue Chart -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Penjualan Tahun {{
          chartAnalytics.generateMonthlyChartData.value.year }}</h3>
        <Bar :data="chartAnalytics.revenueChartData.value" :options="chartAnalytics.chartOptions.value" />
      </div>

      <!-- Profit Chart -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Profit Tahun {{
          chartAnalytics.generateMonthlyChartData.value.year }}</h3>
        <Bar :data="chartAnalytics.profitChartData.value" :options="chartAnalytics.chartOptions.value" />
      </div>
    </div>

    <!-- Tabel Profit Margin -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">

      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h2 class="font-bold">Rincian Laba per Transaksi</h2>
        <div class="flex items-center gap-3">

          <button @click="handleExportPDF" :disabled="isExporting"
            class="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50">
            <svg v-if="!isExporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6" />
            </svg>
            <svg v-else class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            Export PDF
          </button>

          <span class="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">{{
            analytics.profitData.value.length }} Transaksi</span>
        </div>
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
              <td class="px-6 py-3 text-right font-mono text-sm font-bold border-l border-gray-100">{{
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
