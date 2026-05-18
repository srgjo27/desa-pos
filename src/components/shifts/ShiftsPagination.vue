<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
  itemsPerPageOptions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["prev", "next", "update:itemsPerPage"]);

function handleItemsPerPageChange(event) {
  emit("update:itemsPerPage", parseInt(event.target.value));
}
</script>

<template>
  <div
    class="p-4 border border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-4"
  >
    <!-- Pilihan Data per Halaman -->
    <div class="flex items-center gap-2 text-sm">
      <span class="font-medium">Tampilkan:</span>
      <select
        :value="itemsPerPage"
        @change="handleItemsPerPageChange"
        class="bg-white border border-neutral-200 text-sm rounded-lg block p-1.5 outline-none font-bold"
      >
        <option
          v-for="option in itemsPerPageOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
      <span class="font-medium">absensi</span>
    </div>

    <!-- Kontrol Pindah Halaman -->
    <div class="flex items-center gap-4">
      <span class="text-sm font-medium">
        Halaman <span class="font-bold">{{ currentPage }}</span> dari
        <span class="font-bold">{{ totalPages }}</span>
      </span>
      <div class="inline-flex rounded-md">
        <button
          @click="emit('prev')"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 text-sm font-bold bg-white border border-neutral-200 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors"
        >
          Mundur
        </button>
        <button
          @click="emit('next')"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 text-sm font-bold bg-white border border-neutral-200 border-l-0 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors"
        >
          Maju
        </button>
      </div>
    </div>
  </div>
</template>
