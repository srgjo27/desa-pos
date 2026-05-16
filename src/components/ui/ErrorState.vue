<script setup>
defineProps({
  title: {
    type: String,
    default: "Terjadi Kesalahan",
  },
  message: {
    type: String,
    required: true,
  },
  actionLabel: {
    type: String,
    default: "",
  },
});

defineEmits(["action"]);
</script>

<template>
  <div
    class="bg-red-50 border border-red-200 text-red-700 px-6 py-12 rounded-lg text-center"
  >
    <i
      class="pi pi-exclamation-triangle text-red-600 mb-3"
      style="font-size: 48px"
    ></i>
    <h3 class="font-bold text-lg text-red-800">{{ title }}</h3>
    <p class="text-red-700">{{ message }}</p>
    <button
      v-if="actionLabel"
      @click="$emit('action')"
      class="mt-4 px-4 py-2 bg-red-100 font-bold hover:bg-red-200 text-red-800 rounded-lg text-sm transition-colors"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
