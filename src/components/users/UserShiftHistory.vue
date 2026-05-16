<script setup>
import { Card, Table } from "@/components/ui";
import { formatDate, formatTime } from "@/utils/format";
import { getDurationInfo } from "@/utils/shiftHelpers";

const props = defineProps({
  shifts: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  weekLabel: {
    type: String,
    required: true,
  },
  isCurrentWeek: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["prev-week", "next-week", "reset-week"]);

const shiftColumns = [
  { key: "schedule", label: "Jadwal Tugas" },
  { key: "duration", label: "Durasi Total" },
  { key: "evaluation", label: "Evaluasi 8 Jam" },
  { key: "status", label: "Status", width: "w-32" },
];
</script>

<template>
  <Card class="col-span-1 md:col-span-3">
    <div
      class="py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
    >
      <h3 class="font-bold">Histori Absensi Sesi (Shift)</h3>
      <div class="flex items-center gap-2">
        <button
          @click="$emit('prev-week')"
          class="px-2 py-1 rounded-lg border border-neutral-100 bg-white hover:bg-neutral-50 transition-colors focus:outline-none"
        >
          <i class="pi pi-angle-left" style="font-size: 14px"></i>
        </button>
        <button
          @click="$emit('reset-week')"
          class="p-2 rounded-lg text-xs font-bold border transition-colors focus:outline-none"
          :class="
            isCurrentWeek
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          "
        >
          {{ weekLabel }}
        </button>
        <button
          @click="$emit('next-week')"
          :disabled="isCurrentWeek"
          class="px-2 py-1 rounded-lg border border-neutral-100 bg-white transition-colors focus:outline-none"
          :class="
            isCurrentWeek
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-neutral-50'
          "
        >
          <i class="pi pi-angle-right" style="font-size: 14px"></i>
        </button>
      </div>
    </div>

    <Table
      :columns="shiftColumns"
      :rows="shifts"
      :loading="loading"
      loadingMessage="Memuat histori shift..."
      emptyMessage="Tidak ada riwayat shift pada periode ini."
      :striped="false"
      :bordered="true"
      size="sm"
    >
      <!-- Headers -->
      <template #header-schedule="{ column }">
        <div class="text-center">{{ column.label }}</div>
      </template>
      <template #header-duration="{ column }">
        <div class="text-center">{{ column.label }}</div>
      </template>
      <template #header-evaluation="{ column }">
        <div class="text-center">{{ column.label }}</div>
      </template>
      <template #header-status="{ column }">
        <div class="text-center">{{ column.label }}</div>
      </template>

      <!-- Cells -->
      <template #cell-schedule="{ row }">
        <div class="text-center">
          <div class="font-medium mb-1">
            {{ formatDate(row.opened_at) }}
          </div>
          <div
            class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block"
          >
            {{ formatTime(row.opened_at) }} -
            {{ formatTime(row.closed_at) }}
          </div>
        </div>
      </template>

      <template #cell-duration="{ row }">
        <div class="text-center font-black text-gray-700 text-base">
          {{ getDurationInfo(row.opened_at, row.closed_at).text }}
        </div>
      </template>

      <template #cell-evaluation="{ row }">
        <div class="text-center">
          <span
            class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap"
            :class="
              getDurationInfo(row.opened_at, row.closed_at).isOver
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            "
          >
            {{ getDurationInfo(row.opened_at, row.closed_at).label }}
          </span>
        </div>
      </template>

      <template #cell-status="{ row }">
        <div class="text-center">
          <span
            class="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black border"
            :class="
              row.status === 'OPEN'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            "
          >
            <span
              v-if="row.status === 'OPEN'"
              class="w-1.5 h-1.5 rounded-full mr-1.5 bg-orange-500 animate-pulse"
            ></span>
            {{ row.status === "OPEN" ? "AKTIF BEKERJA" : "TUTUP / SELESAI" }}
          </span>
        </div>
      </template>
    </Table>
  </Card>
</template>
