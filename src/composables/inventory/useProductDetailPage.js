import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductDetail } from '@/composables/inventory/useProductDetail'

export function useProductDetailPage() {
  const route = useRoute()
  const router = useRouter()
  const productId = route.params.id

  const {
    product,
    stockLogs,
    loading,
    error,
    initializeProductData
  } = useProductDetail(productId)

  onMounted(async () => {
    await initializeProductData()
  })

  function goBack() {
    router.push('/inventory')
  }

  return {
    product,
    stockLogs,
    loading,
    error,
    goBack
  }
}
