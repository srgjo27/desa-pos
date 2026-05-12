<script setup>
import { formatRupiah } from "@/utils/format";
import { Card } from "@/components/ui";

defineProps({
  totalProducts: {
    type: Number,
    default: 0,
  },
  totalAssetValue: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
    <Card padding="md" rounded="lg">
      <div class="flex items-center gap-4">
        <i class="pi pi-box" style="font-size: 32px"></i>
        <div>
          <p
            class="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1"
          >
            Total Macam Barang
          </p>
          <p class="text-2xl font-black leading-none">
            {{ totalProducts }}
            <span class="text-sm text-gray-400 font-medium">SKU</span>
          </p>
        </div>
      </div>
    </Card>

    <Card padding="md" rounded="xl">
      <div class="flex items-center gap-4">
        <i class="pi pi-wallet" style="font-size: 32px"></i>
        <div>
          <p
            class="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1"
          >
            Total Nilai Aset
          </p>
          <p class="text-2xl font-black leading-none">
            {{ formatRupiah(totalAssetValue) }}
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>
