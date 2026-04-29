<script setup>
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">

    <!-- Background decorative shapes -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-32 -left-32 w-96 h-96 bg-green-100 rounded-full opacity-60 blur-3xl" />
      <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-100 rounded-full opacity-60 blur-3xl" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-green-50 rounded-full opacity-50 blur-3xl" />
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md">
      <slot />
    </div>
  </div>
</template>
