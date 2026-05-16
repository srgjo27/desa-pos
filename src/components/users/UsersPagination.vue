<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  itemsPerPage: {
    type: Number,
    default: 20,
  },
  itemsPerPageOptions: {
    type: Array,
    default: () => [10, 20, 30, 50],
  },
});

const emit = defineEmits(["prev", "next", "update:itemsPerPage"]);

function handleItemsPerPageChange(event) {
  emit("update:itemsPerPage", Number(event.target.value));
}
</script>

<template>
  <div
    class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4"
  >
    <div class="flex items-center gap-2 text-sm text-gray-600">
      <span class="font-medium">Tampilkan:</span>
      <select
        :value="itemsPerPage"
        @change="handleItemsPerPageChange"
        class="bg-white border border-gray-300 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-1.5 outline-none font-bold"
      >
        <option
          v-for="option in itemsPerPageOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
      <span class="font-medium text-gray-500">data</span>
    </div>

    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-600 font-medium">
        Halaman <span class="font-bold">{{ currentPage }}</span> dari
        <span class="font-bold">{{ totalPages }}</span>
        <span class="text-gray-400 ml-1">({{ totalItems }} pengguna)</span>
      </span>
      <div class="inline-flex rounded-md">
        <button
          @click="emit('prev')"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors"
        >
          Sebelumnya
        </button>
        <button
          @click="emit('next')"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 border-l-0 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  </div>
</template>
