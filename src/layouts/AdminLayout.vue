<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  activeTab: {
    type: String,
    required: true
  }
})

const router = useRouter()
const { logout } = useAuth()
const currentYear = new Date().getFullYear()

function handleLogout() {
  logout()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans bg-grid-pattern">

    <!-- Header ADMIN -->
    <header
      class="bg-white border-b border-gray-100 px-6 sm:px-8 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-green-50 rounded-sm flex items-center justify-center border border-green-100/50">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h1 class="font-bold text-lg text-gray-900 leading-tight tracking-tight">{{ title }}</h1>
          <p class="text-gray-500 text-xs font-medium mt-0.5">{{ subtitle }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button @click="handleLogout"
          class="px-4 py-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-sm text-sm font-medium transition-all focus:outline-none border border-gray-200 hover:border-red-200">
          Keluar
        </button>
      </div>
    </header>

    <!-- Sub Navbar (Tabs) -->
    <div
      class="bg-white border-b border-gray-200 px-6 sm:px-8 flex items-center gap-8 overflow-x-auto custom-scrollbar shrink-0 sticky top-18.25 z-10">
      <button @click="router.push('/inventory')"
        class="py-3.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 relative -mb-px"
        :class="activeTab === 'inventory' ? 'text-green-600 border-green-600' : 'text-gray-500 hover:text-gray-900 border-transparent'">
        Katalog Inventaris
      </button>
      <button @click="router.push('/analytics')"
        class="py-3.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 relative -mb-px"
        :class="activeTab === 'analytics' ? 'text-green-600 border-green-600' : 'text-gray-500 hover:text-gray-900 border-transparent'">
        Laporan Laba/Rugi
      </button>
      <button @click="router.push('/users')"
        class="py-3.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 relative -mb-px"
        :class="activeTab === 'users' ? 'text-green-600 border-green-600' : 'text-gray-500 hover:text-gray-900 border-transparent'">
        Pengguna Sistem
      </button>
      <button @click="router.push('/shifts')"
        class="py-3.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 relative -mb-px"
        :class="activeTab === 'shifts' ? 'text-green-600 border-green-600' : 'text-gray-500 hover:text-gray-900 border-transparent'">
        Rekap Shift
      </button>
    </div>

    <!-- Content Utama -->
    <main class="flex-1 p-6 md:px-8 max-w-7xl mx-auto w-full">
      <slot></slot>
    </main>

    <footer class="border-t border-gray-200 bg-white px-6 sm:px-8 py-4 text-center text-xs text-gray-500">
      &copy; 2026 DesaPOS. All rights reserved.
    </footer>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
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

.bg-grid-pattern {
  background-image:
    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
