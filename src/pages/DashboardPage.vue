<script setup>
import { useAuth } from '@/composables/useAuth'

const { logout, loading } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center">
    <div class="text-center space-y-4">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg mb-2">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-white">Dashboard Admin</h1>
      <p class="text-gray-400 text-sm">Laporan & Analitik — Segera Hadir</p>
      <button
        id="dashboard-logout-btn"
        class="mt-4 text-sm text-gray-500 hover:text-red-400 transition-colors"
        :disabled="loading"
        @click="logout"
      >
        Keluar
      </button>
    </div>
  </div>
</template>
