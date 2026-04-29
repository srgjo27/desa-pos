import { ref } from 'vue'
import { supabase } from '@/services/supabase'

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

      if (err) return { success: false, error: err.message }

      profitData.value = data || []
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
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

      if (err) return { success: false, error: err.message }

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

  return {
    profitData,
    monthlyData,
    loading,
    error,
    fetchProfitMetrics,
    fetchMonthlyMetrics
  }
}
