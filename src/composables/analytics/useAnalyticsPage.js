import { ref, onMounted, computed } from 'vue'
import { useAnalytics } from '@/composables/analytics/useAnalytics'
import { useChartAnalytics } from '@/composables/analytics/useChartAnalytics'
import { useRoleProtection } from '@/composables/useRoleProtection'
import { generateDailySalesReport } from '@/services/pdfExportService'
import { formatDateToInputFormat, formatDate } from '@/utils/formatCurrency'

export function useAnalyticsPage() {
  const analytics = useAnalytics()
  const chartAnalytics = useChartAnalytics(analytics.monthlyData)

  const startDate = ref('')
  const endDate = ref('')
  const isExporting = ref(false)

  const summaryMetrics = computed(() => {
    const data = analytics.profitData.value

    if (!data || data.length === 0) return { totalOmzet: 0, totalModal: 0, totalLaba: 0 }

    const totalOmzet = data.reduce((sum, item) => sum + (Number(item.grand_total) || 0), 0)
    const totalModal = data.reduce((sum, item) => sum + (Number(item.total_modal) || 0), 0)
    const totalLaba = data.reduce((sum, item) => sum + (Number(item.laba_kotor) || 0), 0)

    return { totalOmzet, totalModal, totalLaba }
  })

  const initializeDateRange = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return {
      startDate: formatDateToInputFormat(firstDay),
      endDate: formatDateToInputFormat(lastDay),
    }
  }

  const preparePdfExportData = (rangeStart, rangeEnd, summaryData = summaryMetrics.value) => {
    if (!analytics.profitData.value || analytics.profitData.value.length === 0) {
      return {
        success: false,
        error: 'Tidak ada data untuk diexport. Silakan gunakan filter tanggal lain.',
      }
    }

    if (!rangeStart || !rangeEnd) {
      return {
        success: false,
        error: 'Rentang tanggal harus diisi dengan benar',
      }
    }

    try {
      const startDateObj = new Date(rangeStart)
      const endDateObj = new Date(rangeEnd)

      const periodText = `${formatDate(startDateObj)} s.d ${formatDate(endDateObj)}`

      return {
        success: true,
        data: {
          title: 'Laporan Penjualan Harian',
          bulan: periodText,
          transactions: analytics.profitData.value,
          totalRevenue: summaryData.totalOmzet,
          totalCost: summaryData.totalModal,
          gross_profit: summaryData.totalLaba,
          transaction_count: analytics.profitData.value.length,
          export_date: new Date().toLocaleString('id-ID'),
        },
      }
    } catch (err) {
      return {
        success: false,
        error: `Gagal mempersiapkan data export: ${err}`,
      }
    }
  }

  async function fetchAnalytics() {
    const result = await analytics.fetchProfitMetrics(startDate.value, endDate.value)

    if (result && !result.success && result.error) {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleResetFilter() {
    const { startDate: initialStart, endDate: initialEnd } = initializeDateRange()
    startDate.value = initialStart
    endDate.value = initialEnd

    await fetchAnalytics()
  }

  async function handleExportPDF() {
    const prepareResult = preparePdfExportData(startDate.value, endDate.value, summaryMetrics.value)

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

  onMounted(async () => {
    const isAllowed = useRoleProtection('ADMIN', 'Analytics')
    if (!isAllowed) return

    const { startDate: initialStart, endDate: initialEnd } = initializeDateRange()
    startDate.value = initialStart
    endDate.value = initialEnd

    await fetchAnalytics()
    await analytics.fetchMonthlyMetrics()
  })

  return {
    analytics,
    chartAnalytics,
    startDate,
    endDate,
    isExporting,
    summaryMetrics,
    hasMonthlyData: computed(() => analytics.monthlyData.value.length > 0),
    fetchAnalytics,
    handleResetFilter,
    handleExportPDF,
  }
}
