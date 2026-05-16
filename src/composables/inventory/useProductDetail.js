import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export function useProductDetail(productId) {
  const product = ref(null)
  const stockLogs = ref([])
  const loading = ref(true)
  const error = ref(null)

  const initializeProductData = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: productData, error: productErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productErr) {
        if (productErr.code === 'PGRST116') {
          error.value = 'Produk tidak ditemukan.'
        } else {
          error.value = 'Gagal memuat detail produk.'
        }
        return { success: false, error: error.value }
      }

      product.value = productData

      const { data: logsData, error: logsErr } = await supabase
        .from('stock_logs')
        .select(`
          *,
          users (
            name,
            employee_number
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (!logsErr) {
        stockLogs.value = logsData || []
      }

      return { success: true }
    } catch (err) {
      error.value = 'Terjadi kesalahan sistem saat memuat profil produk.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    product,
    stockLogs,
    loading,
    error,
    initializeProductData
  }
}
