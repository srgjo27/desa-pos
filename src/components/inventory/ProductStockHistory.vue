<script setup>
import { formatDate, formatTime } from "@/utils/format";
import { Table } from "@/components/ui";

defineProps({
  stockLogs: {
    type: Array,
    required: true,
  },
});

const stockLogColumns = [
  { key: "time", label: "Waktu" },
  { key: "type", label: "Tipe" },
  { key: "change", label: "Perubahan" },
  { key: "notes", label: "Catatan" },
  { key: "user", label: "Oleh" },
];

function getStockChangeClass(qtyChange, type) {
  if (type === "SALE") return "text-red-600 bg-red-50 border-red-200";
  if (type === "RESTOCK") return "text-green-600 bg-green-50 border-green-200";
  if (qtyChange > 0) return "text-green-600 bg-green-50 border-green-200";
  if (qtyChange < 0) return "text-red-600 bg-red-50 border-red-200";
  return "text-gray-600 bg-gray-50 border-gray-200";
}
</script>

<template>
  <div
    class="bg-white border border-neutral-100 rounded-lg overflow-hidden mt-6"
  >
    <div class="bg-neutral-50 p-4 flex items-center justify-between">
      <h3 class="font-bold">Histori Perubahan Stok</h3>
      <span
        class="text-xs font-medium text-gray-500 bg-white border border-neutral-200 px-2.5 py-1 rounded-lg"
      >
        Total {{ stockLogs.length }} catatan
      </span>
    </div>

    <div class="overflow-x-auto">
      <Table
        :columns="stockLogColumns"
        :rows="stockLogs"
        :loading="false"
        size="sm"
        :striped="true"
        :hoverable="true"
        emptyMessage="Belum ada riwayat perubahan stok."
      >
        <template #cell-time="{ row }">
          <div class="font-medium mb-1">
            {{ formatDate(row.created_at) }}
          </div>
          <div class="text-xs font-bold text-gray-500">
            {{ formatTime(row.created_at) }}
          </div>
        </template>

        <template #cell-type="{ row }">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border bg-gray-50 border-gray-200 text-gray-600"
          >
            {{ row.type }}
          </span>
        </template>

        <template #cell-change="{ row }">
          <div class="flex flex-col items-center gap-1">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400">{{
                row.stock_before
              }}</span>
              <i
                class="pi pi-arrow-right text-gray-300"
                style="font-size: 10px"
              ></i>
              <span
                class="text-xs font-bold"
                :class="
                  row.stock_after > row.stock_before
                    ? 'text-green-600'
                    : 'text-red-600'
                "
                >{{ row.stock_after }}</span
              >
            </div>
            <div
              class="text-xs font-bold px-1.5 rounded border"
              :class="getStockChangeClass(row.qty_change, row.type)"
            >
              {{ row.qty_change > 0 ? "+" : "" }}{{ row.qty_change }}
            </div>
          </div>
        </template>

        <template #cell-notes="{ row }">
          <p class="text-xs truncate max-w-[200px]" :title="row.notes">
            {{ row.notes || "-" }}
          </p>
        </template>

        <template #cell-user="{ row }">
          <div class="text-xs font-bold text-gray-700">
            {{ row.users?.name || "Sistem" }}
          </div>
          <div class="text-[10px] text-gray-500">
            {{ row.users?.employee_number || "-" }}
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>
