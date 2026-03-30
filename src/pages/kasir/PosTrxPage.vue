<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useShiftStore } from '@/stores/shiftStore'
import { useCartStore } from '@/stores/cartStore'
import { useProducts } from '@/composables/useProducts'
import { usePosTrxState } from '@/composables/usePosTrxState'
import { formatRupiah } from '@/utils/formatCurrency'
import CheckoutModal from '@/components/pos/CheckoutModal.vue'
import ReceiptModal from '@/components/pos/ReceiptModal.vue'
import CloseShiftModal from '@/components/pos/CloseShiftModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const shiftStore = useShiftStore()
const cartStore = useCartStore()

const { loading: loadingProducts, searchQuery, filteredProducts, fetchProducts } = useProducts()
const {
  showCheckoutModal,
  showReceiptModal,
  showCloseShiftModal,
  showMobileCart,
  latestReceiptData,
  logoutLoading,
  handleLogout,
  handleCheckoutSuccess,
  toggleMobileCart,
} = usePosTrxState()

onMounted(async () => {
  if (authStore.isKasir && !shiftStore.hasActiveShift) {
    await router.push({ name: 'OpenShift' })
    return
  }

  await fetchProducts()
})

function openCheckout() {
  if (cartStore.items.length === 0) return
  showCheckoutModal.value = true
}

function updateSearchQuery(query) {
  searchQuery.value = query
}
</script>

<template>
  <div class="h-screen flex overflow-hidden bg-gray-50 font-sans">

    <!-- Kolom Kiri: Katalog Produk (Full width di mobile kalau cart tertutup) -->
    <div class="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden" :class="{ 'hidden lg:flex': showMobileCart }">

      <!-- Navbar Kasir -->
      <header class="bg-white p-4 border-b border-gray-200 flex items-center justify-between z-10">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div class="flex flex-col">
            <h1 class="font-bold text-gray-800 text-lg leading-tight">DesaPOS</h1>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-sm text-gray-500 font-medium">Hai, {{ authStore.user?.name }}</span>
              <span v-if="shiftStore.hasActiveShift"
                class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                Shift Aktif
              </span>
              <span v-else class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                Tutup Shift
              </span>
            </div>
          </div>
        </div>

        <button @click="handleLogout" :disabled="logoutLoading"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-red-200 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg text-sm font-bold transition-colors focus:outline-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Keluar</span>
        </button>
      </header>

      <!-- Area Pencarian -->
      <div class="p-4 bg-white border-b border-gray-200 flex items-center">
        <div class="relative w-full">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input :value="searchQuery" @input="updateSearchQuery($event.target.value)" type="text"
            placeholder="Cari nama barang atau SKU..."
            class="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-green-500 rounded-lg pl-12 pr-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-500 focus:outline-none transition-colors" />
        </div>
      </div>

      <!-- Katalog Produk -->
      <div class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-grid-pattern">
        <div v-if="loadingProducts" class="flex flex-col items-center justify-center p-8">
          <p class="text-gray-500 font-bold text-sm">Memuat barang...</p>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center p-8">
          <div class="w-16 h-16 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="font-bold text-gray-800">Barang tidak ditemukan</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div v-for="product in filteredProducts" :key="product.id" @click="cartStore.addItem(product)"
            class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-green-500 cursor-pointer flex flex-col h-full transition-colors active:bg-green-50">
            <div class="h-32 bg-gray-100 flex items-center justify-center border-b border-gray-200">
              <div v-if="product.image_url" class="w-full h-full">
                <img :src="product.image_url" alt="Product Image" class="w-full h-full object-cover">
              </div>
              <div v-else>
                <span class="text-4xl filter">🛍️</span>
              </div>
            </div>
            <div class="p-4 flex flex-col flex-1">
              <p class="text-xs text-gray-500 font-mono mb-1">{{ product.sku }}</p>
              <h3 class="font-bold text-gray-800 text-sm leading-tight flex-1">{{ product.name }}</h3>
              <div class="flex items-end justify-between mt-4">
                <p class="font-bold text-green-600 text-sm">{{ formatRupiah(product.price) }}</p>
                <p class="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">Stok: {{ product.stock }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol Toggle Mobile Keranjang (Bottom Bar) -->
      <div class="lg:hidden bg-white border-t border-gray-200 p-4 shrink-0" v-if="cartStore.totalItems > 0">
        <button @click="toggleMobileCart(true)"
          class="w-full bg-green-600 text-white p-4 rounded-lg font-bold flex items-center justify-between focus:outline-none">
          <span class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {{ cartStore.totalItems }} Barang terpilih
          </span>
          <span>{{ formatRupiah(cartStore.totalAmount) }}</span>
        </button>
      </div>

    </div>

    <!-- Kolom Kanan: Keranjang Belanja -->
    <div class="w-full lg:w-96 bg-white border-l border-gray-200 h-full z-20"
      :class="showMobileCart ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'">
      <!-- Header Keranjang -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
        <div class="flex items-center gap-4">
          <!-- Tombol Back hanya di Mobile -->
          <button @click="toggleMobileCart(false)"
            class="lg:hidden p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 focus:outline-none">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 class="font-bold text-gray-800 text-lg">Keranjang</h2>
            <p class="text-xs text-green-600 font-bold" v-if="cartStore.totalItems > 0">{{ cartStore.totalItems }} Item
            </p>
          </div>
        </div>
        <button v-if="cartStore.items.length > 0" @click="cartStore.clearCart()"
          class="text-sm font-bold text-gray-500 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors focus:outline-none">
          Kosongkan
        </button>
      </div>

      <!-- Daftar Item Keranjang -->
      <div class="flex-1 p-4 bg-gray-50 overflow-y-auto custom-scrollbar flex flex-col gap-4">

        <div v-if="cartStore.items.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400">
          <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p class="font-bold text-gray-500">Keranjang masih kosong</p>
          <p class="text-sm text-center mt-2 px-4">Pilih barang dari katalog untuk menambahkannya.</p>
        </div>

        <template v-else>
          <div v-for="item in cartStore.items" :key="item.product_id"
            class="bg-white p-4 rounded-lg border border-gray-200 flex flex-col gap-4 relative">
            <!-- Hapus Item Badge -->
            <button @click="cartStore.deleteItem(item.product_id)"
              class="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <div class="pr-8">
              <h4 class="font-bold text-gray-800 text-sm leading-snug">{{ item.name }}</h4>
              <p class="text-green-600 font-bold text-sm mt-1">{{ formatRupiah(item.price) }}</p>
            </div>

            <!-- Qty Controller -->
            <div class="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
              <p class="text-xs font-bold text-gray-500">Sub: <span class="text-gray-800">{{ formatRupiah(item.price *
                item.qty) }}</span></p>
              <div class="flex items-center gap-4 bg-gray-100 p-1 rounded-lg">
                <button @click="cartStore.removeItem(item.product_id)"
                  class="w-8 h-8 flex items-center justify-center bg-white text-gray-600 hover:text-green-600 rounded font-bold focus:outline-none">-</button>
                <span class="w-4 text-center text-sm font-bold text-gray-800">{{ item.qty }}</span>
                <button @click="cartStore.addItem({ id: item.product_id, name: item.name, price: item.price })"
                  class="w-8 h-8 flex items-center justify-center bg-white text-gray-600 hover:text-green-600 rounded font-bold focus:outline-none">+</button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Bayar / Checkout Area -->
      <div class="p-4 bg-white border-t border-gray-200 shrink-0">
        <div class="flex flex-col gap-2 mb-4">
          <div class="flex items-center justify-between text-sm text-gray-600 font-medium">
            <span>Subtotal</span>
            <span>{{ formatRupiah(cartStore.totalAmount) }}</span>
          </div>
          <div
            class="flex items-center justify-between text-sm text-gray-600 font-medium pb-4 border-b border-gray-200">
            <span>Diskon</span>
            <span class="text-green-600">{{ formatRupiah(cartStore.totalItemDiscounts) }}</span>
          </div>
          <div class="flex items-center justify-between text-lg font-bold text-gray-800 pt-2">
            <span>Total</span>
            <span class="text-green-600">{{ formatRupiah(cartStore.totalAmount) }}</span>
          </div>
        </div>

        <button @click="openCheckout" :disabled="cartStore.items.length === 0"
          class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-4 rounded-lg font-bold text-sm transition-colors focus:outline-none flex justify-center items-center gap-2">
          Checkout
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <CheckoutModal :isOpen="showCheckoutModal" @close="showCheckoutModal = false"
      @checkout-success="handleCheckoutSuccess" />

    <ReceiptModal :isOpen="showReceiptModal" :receiptData="latestReceiptData" @close="showReceiptModal = false" />

    <CloseShiftModal :isOpen="showCloseShiftModal" @close="showCloseShiftModal = false" />

  </div>
</template>

<style scoped>
.bg-grid-pattern {
  background-color: #f9fafb;
  background-image:
    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
  background-size: 32px 32px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 4px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
}
</style>
