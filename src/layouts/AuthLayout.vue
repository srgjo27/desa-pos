<script setup>
// AuthLayout: Layout untuk halaman autentikasi — Light Theme
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">

    <!-- Background decorative shapes -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Top-left blob -->
      <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-100 rounded-full opacity-60 blur-3xl" />
      <!-- Bottom-right blob -->
      <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-100 rounded-full opacity-60 blur-3xl" />
      <!-- Center soft circle -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-50 rounded-full opacity-50 blur-3xl" />
      <!-- Top wave pattern -->
      <svg class="absolute top-0 left-0 w-full opacity-[0.04]" viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 80 C360 160, 720 0, 1080 80 S1440 160, 1440 80 V0H0V80Z" fill="#3B82F6"/>
      </svg>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md">
      <slot />
    </div>
  </div>
</template>
