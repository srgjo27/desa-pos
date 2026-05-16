<script setup>
defineProps({
  message: {
    type: String,
    default: "Sedang memuat data...",
  },
});
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg p-12 text-center">
    <i
      class="pi pi-spinner pi-spin text-green-600 mx-auto mb-3"
      style="font-size: 32px"
    ></i>
    <p class="text-gray-500 font-medium">{{ message }}</p>
  </div>
</template>
