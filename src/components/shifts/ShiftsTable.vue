<script setup>
import { Table } from "@/components/ui";
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
});

const shiftColumns = [
  { key: "user", label: "Kasir/Pegawai" },
  { key: "schedule", label: "Jadwal Tugas", width: "text-center" },
  { key: "duration", label: "Durasi Total", width: "text-center" },
  { key: "evaluation", label: "Evaluasi 8 Jam", width: "text-center" },
  { key: "status", label: "Status", width: "text-center w-32" },
];
</script>

<template>
  <Table
    class="overflow-x-auto"
    :columns="shiftColumns"
    :rows="shifts"
    :loading="loading"
    loading-message="Memuat riwayat arsip..."
    empty-message="Belum ada kasir yang pernah membuka shift absensi."
    :hoverable="true"
    :striped="false"
  >
    <template #cell-user="{ row: shift }">
      <div class="font-bold">{{ shift.users?.name || "GUEST" }}</div>
      <div class="text-xs text-gray-500 font-mono mt-0.5">
        {{ shift.users?.employee_number || "N/A" }}
      </div>
    </template>

    <template #cell-schedule="{ row: shift }">
      <div class="font-medium mb-1">
        {{ formatDate(shift.opened_at) }}
      </div>
      <div
        class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block"
      >
        {{ formatTime(shift.opened_at) }}
        -
        {{ shift.closed_at ? formatTime(shift.closed_at) : "Sekarang" }}
      </div>
    </template>

    <template #cell-duration="{ row: shift }">
      <span class="font-black text-gray-700 text-base">
        {{ getDurationInfo(shift.opened_at, shift.closed_at).text }}
      </span>
    </template>

    <template #cell-evaluation="{ row: shift }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap"
        :class="
          getDurationInfo(shift.opened_at, shift.closed_at).isOver
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        "
      >
        {{ getDurationInfo(shift.opened_at, shift.closed_at).label }}
      </span>
    </template>

    <template #cell-status="{ row: shift }">
      <span
        class="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black border"
        :class="
          shift.status === 'OPEN'
            ? 'bg-orange-50 text-orange-700 border-orange-200'
            : 'bg-gray-100 text-gray-600 border-gray-200'
        "
      >
        <span
          v-if="shift.status === 'OPEN'"
          class="w-1.5 h-1.5 rounded-full mr-1.5 bg-orange-500 animate-pulse"
        ></span>
        {{ shift.status === "OPEN" ? "AKTIF BEKERJA" : "TUTUP / SELESAI" }}
      </span>
    </template>
  </Table>
</template>
