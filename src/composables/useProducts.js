import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { logError } from '@/services/errorHandler'

export function useProducts() {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')

  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('products')
        .select('id, sku, name, price, stock, image_url, discount_price, is_on_discount')
        .eq('is_active', true)
        .order('name')

      if (dbError) {
        logError(dbError, { context: 'fetchProducts' })
        error.value = 'Gagal memuat barang'
        return false
      }

      products.value = data || []
      return true
    } catch (err) {
      logError(err, { context: 'fetchProducts' })
      error.value = 'Terjadi kesalahan saat memuat barang'
      return false
    } finally {
      loading.value = false
    }
  }

  const filteredProducts = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return products.value

    return products.value.filter(
      product =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    )
  })

  function clearSearch() {
    searchQuery.value = ''
  }

  return {
    products,
    loading,
    error,
    searchQuery,
    fetchProducts,
    filteredProducts,
    clearSearch,
  }
}
