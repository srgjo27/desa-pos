<script setup>
import { computed } from 'vue'
import { Input, Button } from '@/components/ui'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  isExporting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'export', 'add'])

const searchQuery = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 w-full">
    <Input
      id="search-products"
      v-model="searchQuery"
      type="text"
      placeholder="Cari nama barang atau SKU..."
      rounded="lg"
      size="md"
      class="w-full sm:max-w-xs"
    >
      <template #prefix>
        <i class="pi pi-search text-gray-400" style="font-size: 12px"></i>
      </template>
    </Input>
    <div class="w-full sm:w-auto flex gap-2">
      <Button
        @click="emit('export')"
        :loading="isExporting"
        :disabled="isExporting"
        variant="secondary"
        :fullWidth="true"
        class="sm:w-auto"
        rounded="md"
      >
        <i v-if="!isExporting" class="pi pi-file-pdf" style="font-size: 12px"></i>
        Export PDF
      </Button>
      <Button
        @click="emit('add')"
        variant="primary"
        :fullWidth="true"
        class="sm:w-auto"
        rounded="md"
      >
        <i class="pi pi-plus" style="font-size: 12px"></i>
        Tambah Barang Baru
      </Button>
    </div>
  </div>
</template>
