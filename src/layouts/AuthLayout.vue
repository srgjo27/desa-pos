<script setup>
// AuthLayout: Layout untuk halaman autentikasi (Login, Reset Password, dll)
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Gradient orbs -->
      <div
        class="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"
      />
      <div
        class="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl"
      />
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl"
      />
      <!-- Grid pattern -->
      <div
        class="absolute inset-0 opacity-[0.03]"
        style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 50px 50px"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md">
      <slot />
    </div>
  </div>
</template>
