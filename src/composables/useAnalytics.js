import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { formatDateToInputFormat } from '@/utils/formatCurrency'
import { formatDate } from '../utils/formatCurrency'

export function useAnalytics() {
  const profitData = ref([])
  const monthlyData = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchProfitMetrics = async (startDate = null, endDate = null) => {
    loading.value = true
    error.value = null

    try {
      if (startDate && endDate && startDate > endDate) error.value = 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir'

      let query = supabase
        .from('v_sales_profit')
        .select('*')
        .order('created_at', { ascending: false })

      if (startDate) query = query.gte('created_at', `${startDate}T00:00:00.000Z`)
      if (endDate) query = query.lte('created_at', `${endDate}T23:59:59.999Z`)

      const { data, error: err } = await query

      if (err) return

      profitData.value = data || []
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const calculateSummaryMetrics = () => {
    const data = profitData.value

    if (!data || data.length === 0) return { totalOmzet: 0, totalModal: 0, totalLaba: 0 }

    const totalOmzet = data.reduce((sum, item) => sum + (Number(item.grand_total) || 0), 0)
    const totalModal = data.reduce((sum, item) => sum + (Number(item.total_modal) || 0), 0)
    const totalLaba = data.reduce((sum, item) => sum + (Number(item.laba_kotor) || 0), 0)

    return { totalOmzet, totalModal, totalLaba }
  }

  const summaryMetrics = computed(() => calculateSummaryMetrics())

  const initializeDateRange = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return {
      startDate: formatDateToInputFormat(firstDay),
      endDate: formatDateToInputFormat(lastDay)
    }
  }

  const preparePdfExportData = (startDate, endDate, summaryData = null) => {
    if (!profitData.value || profitData.value.length === 0) {
      return {
        success: false,
        error: 'Tidak ada data untuk diexport. Silakan gunakan filter tanggal lain.'
      }
    }

    if (!startDate || !endDate) {
      return {
        success: false,
        error: 'Rentang tanggal harus diisi dengan benar'
      }
    }

    try {
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)

      const periodText = `${formatDate(startDateObj)} s.d ${formatDate(endDateObj)}`
      const metrics = summaryData

      return {
        success: true,
        data: {
          title: 'Laporan Penjualan Harian',
          bulan: periodText,
          transactions: profitData.value,
          totalRevenue: metrics.totalOmzet,
          totalCost: metrics.totalModal,
          gross_profit: metrics.totalLaba,
          transaction_count: profitData.value.length,
          export_date: new Date().toLocaleString('id-ID')
        }
      }
    } catch (err) {
      return {
        success: false,
        error: `Gagal mempersiapkan data export: ${err}`
      }
    }
  }

  const fetchMonthlyMetrics = async () => {
    loading.value = true
    error.value = null

    try {
      const today = new Date()
      const startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1)
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      let query = supabase
        .from('v_sales_profit')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      const { data, error: err } = await query

      if (err) throw new Error(err.message)

      const aggregatedData = {}

        ; (data || []).forEach((item) => {
          const date = new Date(item.created_at)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

          if (!aggregatedData[monthKey]) {
            aggregatedData[monthKey] = {
              month: monthKey,
              totalRevenue: 0,
              totalCost: 0,
              totalProfit: 0,
              transactions: 0
            }
          }

          aggregatedData[monthKey].totalRevenue += Number(item.grand_total) || 0
          aggregatedData[monthKey].totalCost += Number(item.total_modal) || 0
          aggregatedData[monthKey].totalProfit += Number(item.laba_kotor) || 0
          aggregatedData[monthKey].transactions += 1
        })

      monthlyData.value = Object.values(aggregatedData).sort((a, b) => a.month.localeCompare(b.month))

      return { success: true, data: monthlyData.value }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-')
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${months[parseInt(month) - 1]} ${year}`
  }

  return {
    profitData,
    monthlyData,
    loading,
    error,
    summaryMetrics,
    fetchProfitMetrics,
    fetchMonthlyMetrics,
    calculateSummaryMetrics,
    initializeDateRange,
    preparePdfExportData,
    formatMonthLabel
  }
}
