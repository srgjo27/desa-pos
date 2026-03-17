import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export function useAnalytics() {
  const profitData = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchProfitMetrics = async (startDate = null, endDate = null) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('v_sales_profit')
        .select('*')
        .order('created_at', { ascending: false })

      if (startDate) {
        query = query.gte('created_at', `${startDate}T00:00:00.000Z`)
      }
      if (endDate) {
        query = query.lte('created_at', `${endDate}T23:59:59.999Z`)
      }

      const { data, error: err } = await query

      if (err) throw err

      profitData.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching profit metrics:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    profitData,
    loading,
    error,
    fetchProfitMetrics
  }
}
