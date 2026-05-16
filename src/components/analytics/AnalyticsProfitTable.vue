<script setup>
import { computed } from "vue";
import { Table, Button } from "@/components/ui";
import { formatRupiah, formatDate, formatTime } from "@/utils/format";

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isExporting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["export"]);

const columns = computed(() => [
  { key: "created_at", label: "Tgl Transaksi", width: "w-44" },
  { key: "kasir", label: "Kasir" },
  { key: "total_modal", label: "Total Modal" },
  { key: "grand_total", label: "Pendapatan" },
  { key: "laba_kotor", label: "Laba Bersih", width: "w-36" },
]);

const headerAlignRight = new Set(["total_modal", "grand_total", "laba_kotor"]);
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div
      class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between"
    >
      <h2 class="font-bold">Rincian Laba per Transaksi</h2>
      <div class="flex items-center gap-3">
        <Button
          @click="emit('export')"
          :loading="isExporting"
          :disabled="isExporting"
          size="sm"
          rounded="md"
        >
          Export PDF
        </Button>
        <span
          class="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded text-gray-500"
        >
          {{ rows.length }} Transaksi
        </span>
      </div>
    </div>

    <Table
      class="overflow-x-auto"
      :columns="columns"
      :rows="rows"
      :loading="loading"
      size="sm"
      :striped="true"
      :bordered="true"
      :hoverable="true"
      emptyMessage="Tidak ada transaksi ditemukan pada rentang tanggal ini."
      loadingMessage="Memuat data analitik..."
    >
      <template
        v-for="col in columns"
        :key="`header-${col.key}`"
        #[`header-${col.key}`]
      >
        <div :class="headerAlignRight.has(col.key) ? 'text-right' : ''">
          {{ col.label }}
        </div>
      </template>

      <template
        v-for="col in columns"
        :key="col.key"
        #[`cell-${col.key}`]="{ row }"
      >
        <div v-if="col.key === 'created_at'" class="border-r border-gray-100">
          <p class="font-bold">{{ formatDate(row.created_at) }}</p>
          <p class="text-xs text-gray-400 font-mono">
            {{ formatTime(row.created_at) }}
          </p>
        </div>
        <div v-else-if="col.key === 'kasir'" class="border-r border-gray-100">
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400"
            >
              {{ row.kasir.charAt(0).toUpperCase() }}
            </div>
            <span>{{ row.kasir }}</span>
          </div>
        </div>
        <div
          v-else-if="col.key === 'total_modal'"
          class="text-right font-mono text-sm text-gray-500 border-l border-gray-100"
        >
          {{ formatRupiah(row.total_modal || 0) }}
        </div>
        <div
          v-else-if="col.key === 'grand_total'"
          class="text-right font-mono text-sm font-bold border-l border-gray-100"
        >
          {{ formatRupiah(row.grand_total || 0) }}
        </div>
        <div
          v-else-if="col.key === 'laba_kotor'"
          class="text-right bg-green-50/30 border-l border-gray-100"
        >
          <span
            class="inline-flex items-center justify-center font-mono font-bold text-sm text-green-700"
          >
            {{ formatRupiah(row.laba_kotor || 0) }}
          </span>
        </div>
        <div v-else>{{ row[col.key] }}</div>
      </template>
    </Table>
  </div>
</template>
