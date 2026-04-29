import { ref, computed, onMounted } from 'vue'
import { useInventory } from '@/composables/inventory/useInventory'
import { generateInventoryReport } from '@/services/pdfExportService'

export function useInventoryPage() {
  const invStore = useInventory()

  const searchQuery = ref('')
  const isModalProductOpen = ref(false)
  const isModalEditOpen = ref(false)
  const isModalStockOpen = ref(false)
  const isModalDiscountOpen = ref(false)
  const selectedProduct = ref(null)
  const isExporting = ref(false)

  onMounted(async () => {
    await invStore.fetchProducts()
  })

  const filteredProducts = computed(() => {
    const query = searchQuery.value.toLowerCase()
    return invStore.products.value.filter((product) =>
      product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)
    )
  })

  const totalAssetValue = computed(() => {
    return invStore.products.value.reduce(
      (acc, curr) => acc + curr.cost_price * curr.stock,
      0
    )
  })

  const totalProducts = computed(() => invStore.products.value.length)
  const isInventoryLoading = computed(() => invStore.loading.value)

  function openProductModal() {
    isModalProductOpen.value = true
  }

  function openEditModal(product) {
    selectedProduct.value = product
    isModalEditOpen.value = true
  }

  function openStockModal(product) {
    selectedProduct.value = product
    isModalStockOpen.value = true
  }

  function openDiscountModal(product) {
    selectedProduct.value = product
    isModalDiscountOpen.value = true
  }

  async function handleDelete(product) {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus produk "${product.name}" secara permanen? Data histori transaksi tidak akan hilang.`
      )
    ) {
      const res = await invStore.deleteProduct(product.id)
      if (!res.success) alert(invStore.error.value)
    }
  }

  async function handleAddStock({ productId, qty }) {
    const res = await invStore.addStock(productId, qty, 'Restock manual via Dashboard')
    if (res.success) {
      isModalStockOpen.value = false
    } else {
      alert(invStore.error.value)
    }
  }

  async function handleEditProduct() {
    isModalEditOpen.value = false
  }

  async function handleSaveDiscount({ is_on_discount, discount_price }) {
    const res = await invStore.updateDiscount(selectedProduct.value.id, {
      is_on_discount,
      discount_price,
    })

    if (res.success) {
      isModalDiscountOpen.value = false
    } else {
      alert(invStore.error.value)
    }
  }

  async function handleExportInventoryPDF() {
    if (filteredProducts.value.length === 0) {
      alert('Tidak ada produk untuk diexport')
      return
    }

    isExporting.value = true
    try {
      await generateInventoryReport({
        title: 'Laporan Inventaris',
        date: new Date().toLocaleDateString('id-ID'),
        products: filteredProducts.value,
        totalAssetValue: totalAssetValue.value,
      })
    } catch (err) {
      alert('Gagal membuat laporan PDF. Pastikan jsPDF sudah terinstall.')
    } finally {
      isExporting.value = false
    }
  }

  return {
    searchQuery,
    filteredProducts,
    totalAssetValue,
    totalProducts,
    isInventoryLoading,
    isModalProductOpen,
    isModalEditOpen,
    isModalStockOpen,
    isModalDiscountOpen,
    selectedProduct,
    isExporting,
    openProductModal,
    openEditModal,
    openStockModal,
    openDiscountModal,
    handleDelete,
    handleAddStock,
    handleEditProduct,
    handleSaveDiscount,
    handleExportInventoryPDF,
  }
}
