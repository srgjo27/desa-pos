<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AddProductModal from '@/components/inventory/AddProductModal.vue'
import AddStockModal from '@/components/inventory/AddStockModal.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useInventory } from '@/composables/useInventory'
import { formatRupiah } from '@/utils/formatCurrency'

const router = useRouter()
const authStore = useAuthStore()
const invStore = useInventory()

const searchQuery = ref('')
const isModalProductOpen = ref(false)
const isModalStockOpen = ref(false)
const selectedProduct = ref(null)

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

function openStockModal(product) {
  selectedProduct.value = product
  isModalStockOpen.value = true
}

async function handleDelete(product) {
  if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}" secara permanen? Data histori transaksi tidak akan hilang.`)) {
    const res = await invStore.deleteProduct(product.id)
    if (!res.success) {
      alert(invStore.error.value)
    }
  }
}
</script>

<template>
  <AdminLayout title="Katalog Inventaris" subtitle="BUMDes DesaPOS - Mode Admin" activeTab="inventory">
      
      <!-- Top Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div class="bg-white p-5 border border-gray-200 rounded-lg flex items-center gap-4">
           <div class="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center border border-gray-200">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
           </div>
           <div>
             <p class="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Total Macam Barang</p>
             <p class="text-2xl font-black text-gray-900 leading-none">{{ invStore.products.value.length }} <span class="text-sm text-gray-400 font-medium">SKU</span></p>
           </div>
        </div>

        <div class="bg-white p-5 border border-gray-200 rounded-xl flex items-center gap-4">
           <div class="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center border border-green-200">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
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
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            v-model="searchQuery"
            type="text" placeholder="Cari nama barang atau SKU..."
            class="w-full bg-white border border-gray-300 focus:border-green-600 rounded-md pl-9 pr-3 py-2 text-sm font-medium focus:outline-none transition-colors placeholder-gray-400"
          >
        </div>
        <button 
          @click="openProductModal"
          class="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-bold text-sm transition-colors focus:outline-none flex items-center justify-center gap-2 border border-transparent"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          Tambah Barang Baru
        </button>
      </div>

      <!-- Tabel Produk -->
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
         <div class="overflow-x-auto">
           <table class="w-full text-left text-sm text-gray-700">
             <thead class="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider font-bold">
               <tr>
                 <th class="px-6 py-4 w-32 border-r border-gray-100">SKU</th>
                 <th class="px-6 py-4">Nama Barang</th>
                 <th class="px-6 py-4 text-right border-l border-gray-100" title="Harga Beli / HPP">Harga Modal</th>
                 <th class="px-6 py-4 text-right border-l border-gray-100" title="Harga Jual ke Pelanggan">Harga Jual</th>
                 <th class="px-6 py-4 text-center w-24 border-l border-gray-100">Sisa Stok</th>
                 <th class="px-6 py-4 text-center w-36 border-l border-gray-100">Aksi</th>
               </tr>
             </thead>
             <tbody class="divide-y divide-gray-100">
               <tr v-if="invStore.loading.value">
                  <td colspan="6" class="px-6 py-12 text-center text-gray-400 font-medium">Memuat data inventaris...</td>
               </tr>
               <tr v-else-if="filteredProducts.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-gray-400 font-medium">Tidak ada barang yang ditemukan.</td>
               </tr>
               <tr 
                 v-else
                 v-for="product in filteredProducts" 
                 :key="product.id"
                 class="hover:bg-gray-50/80 transition-colors group"
               >
                 <td class="px-6 py-4 font-mono text-xs text-gray-400 border-r border-gray-100">{{ product.sku }}</td>
                 <td class="px-6 py-4 font-bold text-gray-900">{{ product.name }}</td>
                 <td class="px-6 py-4 text-right font-mono text-xs text-gray-500 border-l border-gray-100">{{ product.cost_price.toLocaleString('id-ID') }}</td>
                 <td class="px-6 py-4 text-right font-mono text-sm font-bold text-gray-800 border-l border-gray-100">{{ product.price.toLocaleString('id-ID') }}</td>
                 <td class="px-6 py-4 text-center border-l border-gray-100">
                    <span 
                      class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-bold text-xs border"
                      :class="product.stock <= 5 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'"
                    >
                      {{ product.stock }}
                    </span>
                 </td>
                 <td class="px-6 py-4 text-center border-l border-gray-100 flex items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <!-- Tombol Tambah Stok -->
                    <button 
                      @click="openStockModal(product)"
                      title="Restock"
                      class="px-2.5 py-1.5 bg-white border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 rounded font-bold text-xs flex items-center gap-1.5 focus:outline-none transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      Stok
                    </button>
                    <!-- Tombol Hapus -->
                    <button 
                      @click="handleDelete(product)"
                      title="Hapus Barang"
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded focus:outline-none transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                 </td>
               </tr>
             </tbody>
           </table>
         </div>
      </div>

    <!-- Modals -->
    <AddProductModal 
      :isOpen="isModalProductOpen" 
      @close="isModalProductOpen = false" 
    />

    <AddStockModal 
      :isOpen="isModalStockOpen" 
      :product="selectedProduct" 
      @close="isModalStockOpen = false" 
    />

  </AdminLayout>
</template>
