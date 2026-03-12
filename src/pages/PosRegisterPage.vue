<script setup>
import { useAuth } from '@/composables/useAuth'

const { logout, loading } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center">
    <div class="text-center space-y-4">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg mb-2">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 18a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11z"
          />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-white">POS Register</h1>
      <p class="text-gray-400 text-sm">Halaman Kasir — Segera Hadir</p>
      <button
        id="pos-logout-btn"
        class="mt-4 text-sm text-gray-500 hover:text-red-400 transition-colors"
        :disabled="loading"
        @click="logout"
      >
        Keluar
      </button>
    </div>
  </div>
</template>
