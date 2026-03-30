<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import AddProductModal from '@/components/inventory/AddProductModal.vue'
import EditProductModal from '@/components/inventory/EditProductModal.vue'
import AddStockModal from '@/components/inventory/AddStockModal.vue'
import EditDiscountModal from '@/components/inventory/EditDiscountModal.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useInventory } from '@/composables/useInventory'
import { formatRupiah } from '@/utils/formatCurrency'
import { generateInventoryReport } from '@/services/pdfExportService'

const router = useRouter()
const authStore = useAuthStore()
const invStore = useInventory()

const searchQuery = ref('')
const isModalProductOpen = ref(false)
const isModalEditOpen = ref(false)
const isModalStockOpen = ref(false)
const isModalDiscountOpen = ref(false)
const selectedProduct = ref(null)
const isExporting = ref(false)

onMounted(async () => {
  if (authStore.role !== 'ADMIN') {
    alert('Akses Ditolak. Halaman ini hanya untuk ADMIN.')
    router.push({ name: 'POS' })
    return
  }

  await invStore.fetchProducts()
})

const filteredProducts = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return invStore.products.value.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.sku.toLowerCase().includes(query)
  )
})

const totalAssetValue = computed(() => {
  return invStore.products.value.reduce((acc, curr) => acc + (curr.cost_price * curr.stock), 0)
})

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
  if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}" secara permanen? Data histori transaksi tidak akan hilang.`)) {
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
    discount_price
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
      totalAssetValue: totalAssetValue.value
    })
  } catch (err) {
    alert('Gagal membuat laporan PDF. Pastikan jsPDF sudah terinstall.')
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <AdminLayout title="Katalog Inventaris" subtitle="BUMDes DesaPOS - Mode Admin" activeTab="inventory">

    <!-- Top Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <div class="bg-white p-5 border border-gray-200 rounded-lg flex items-center gap-4">
        <div
          class="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center border border-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Total Macam Barang</p>
          <p class="text-2xl font-black text-gray-900 leading-none">{{ invStore.products.value.length }} <span
              class="text-sm text-gray-400 font-medium">SKU</span></p>
        </div>
      </div>

      <div class="bg-white p-5 border border-gray-200 rounded-xl flex items-center gap-4">
        <div
          class="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center border border-green-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Total Nilai Aset</p>
          <p class="text-2xl font-black text-gray-900 leading-none">{{ formatRupiah(totalAssetValue) }}</p>
        </div>
      </div>
    </div>

    <!-- Action & Search Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div class="relative w-full sm:max-w-xs">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Cari nama barang atau SKU..."
          class="w-full bg-white border border-gray-300 focus:border-green-600 rounded-md pl-9 pr-3 py-2 text-sm font-medium focus:outline-none transition-colors placeholder-gray-400">
      </div>
      <div class="w-full sm:w-auto flex gap-2">
        <button @click="handleExportInventoryPDF" :disabled="isExporting"
          class="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold text-sm transition-colors focus:outline-none flex items-center justify-center gap-2 border border-transparent disabled:opacity-50">
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
        <button @click="openProductModal"
          class="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-bold text-sm transition-colors focus:outline-none flex items-center justify-center gap-2 border border-transparent">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Barang Baru
        </button>
      </div>
    </div>

    <!-- Tabel Produk -->
    <div class="bg-white border border-gray-200 rounded-lg relative overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-700 min-w-max">
          <thead class="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider font-bold">
            <tr>
              <th class="px-6 py-4 w-32 border-r border-gray-100">SKU</th>
              <th class="px-6 py-4">Nama Barang</th>
              <th class="px-6 py-4 text-right border-l border-gray-100" title="Harga Beli / HPP">Harga Modal</th>
              <th class="px-6 py-4 text-right border-l border-gray-100" title="Harga Jual ke Pelanggan">Harga Jual</th>
              <th class="px-6 py-4 text-center border-l border-gray-100">Margin</th>
              <th class="px-6 py-4 text-center border-l border-gray-100">Diskon</th>
              <th class="px-6 py-4 text-center w-24 border-l border-gray-100">Sisa Stok</th>
              <th class="px-6 py-4 text-center w-12 border-l border-gray-100">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="invStore.loading.value">
              <td colspan="8" class="px-6 py-12 text-center text-gray-400 font-medium">Memuat data inventaris...</td>
            </tr>
            <tr v-else-if="filteredProducts.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-400 font-medium">Tidak ada barang yang ditemukan.
              </td>
            </tr>
            <tr v-else v-for="product in filteredProducts" :key="product.id"
              class="hover:bg-gray-50/80 transition-colors group">
              <td class="px-6 py-4 font-mono text-xs text-gray-400 border-r border-gray-100">{{ product.sku }}</td>
              <td class="px-6 py-4 font-semibold text-gray-900">{{ product.name }}</td>
              <td class="px-6 py-4 text-right font-mono text-xs text-gray-500 border-l border-gray-100">{{
                formatRupiah(product.cost_price) }}</td>
              <td class="px-6 py-4 text-right font-mono text-sm font-semibold text-gray-800 border-l border-gray-100">{{
                formatRupiah(product.price) }}</td>
              <td class="px-6 py-4 text-right font-mono text-sm font-semibold text-gray-800 border-l border-gray-100">{{
                formatRupiah(product.margin) }}
              </td>
              <td class="px-6 py-4 text-center border-l border-gray-100">
                <span v-if="product.is_on_discount && product.discount_price"
                  class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-bold text-xs bg-orange-50 text-orange-700 border border-orange-200">
                  {{ formatRupiah(product.price - product.discount_price) }}
                </span>
                <span v-else class="text-xs text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 text-center border-l border-gray-100">
                <span
                  class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-bold text-xs border"
                  :class="product.stock <= 5 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'">
                  {{ product.stock }}
                </span>
              </td>
              <td class="px-6 py-4 text-center border-l border-gray-100">
                <!-- Actions Menu (Headless UI) -->
                <Menu as="div" class="relative inline-block text-left">
                  <MenuButton
                    class="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 focus:outline-none transition-colors"
                    title="Lebih banyak aksi">
                    <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M12 8c1.1 0 2-0.9 2-2s-0.9-2-2-2-2 0.9-2 2 0.9 2 2 2zm0 2c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2zm0 6c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2z" />
                    </svg>
                  </MenuButton>

                  <MenuItems
                    class="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg z-10 focus:outline-none">
                    <!-- Edit Option -->
                    <MenuItem @click="openEditModal(product)">
                    <button
                      class="w-full text-left px-4 py-2.5 flex items-center gap-3 text-gray-700 hover:bg-blue-50 border-b border-gray-100 transition-colors first:rounded-t-lg">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span class="text-sm font-medium">Edit Data</span>
                    </button>
                    </MenuItem>

                    <!-- Stock Option -->
                    <MenuItem @click="openStockModal(product)">
                    <button
                      class="w-full text-left px-4 py-2.5 flex items-center gap-3 text-gray-700 hover:bg-amber-50 border-b border-gray-100 transition-colors">
                      <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span class="text-sm font-medium">Tambah Stok</span>
                    </button>
                    </MenuItem>

                    <MenuItem @click="openDiscountModal(product)">
                    <button
                      class="w-full text-left px-4 py-2.5 flex items-center gap-3 text-gray-700 hover:bg-orange-50 border-b border-gray-100 transition-colors">
                      <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span class="text-sm font-medium">Atur Diskon</span>
                    </button>
                    </MenuItem>

                    <!-- Delete Option -->
                    <MenuItem @click="handleDelete(product)">
                    <button
                      class="w-full text-left px-4 py-2.5 flex items-center gap-3 text-red-700 hover:bg-red-50 transition-colors last:rounded-b-lg">
                      <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span class="text-sm font-medium">Hapus</span>
                    </button>
                    </MenuItem>
                  </MenuItems>

                </Menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <AddProductModal :isOpen="isModalProductOpen" @close="isModalProductOpen = false" />

    <EditProductModal :isOpen="isModalEditOpen" :product="selectedProduct" @close="isModalEditOpen = false"
      @updated="handleEditProduct" />

    <AddStockModal :isOpen="isModalStockOpen" :product="selectedProduct" :isLoading="invStore.loading.value"
      @close="isModalStockOpen = false" @confirm="handleAddStock" />

    <EditDiscountModal :isOpen="isModalDiscountOpen" :product="selectedProduct" @close="isModalDiscountOpen = false"
      @save="handleSaveDiscount" />

  </AdminLayout>
</template>
