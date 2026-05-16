<script setup>
import { computed } from "vue";
import { Card } from "@/components/ui";
import { formatRupiah } from "@/utils/format";

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({ totalOmzet: 0, totalModal: 0, totalLaba: 0 }),
  },
});

const cards = computed(() => [
  {
    key: "omzet",
    label: "Total Pendapatan (Kotor)",
    value: formatRupiah(props.summary.totalOmzet || 0),
    icon: "pi pi-chart-line",
    iconClasses: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    key: "modal",
    label: "Total Harga Modal (HPP)",
    value: formatRupiah(props.summary.totalModal || 0),
    icon: "pi pi-box",
    iconClasses: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    key: "laba",
    label: "Total Laba Keuntungan",
    value: formatRupiah(props.summary.totalLaba || 0),
    icon: "pi pi-arrow-up-right",
    iconClasses: "bg-green-100 text-green-700 border-green-200",
    valueClass: "text-green-700",
  },
]);
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <Card v-for="card in cards" :key="card.key" padding="md" rounded="lg">
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center border"
          :class="card.iconClasses"
        >
          <i :class="card.icon" style="font-size: 20px"></i>
        </div>
        <div>
          <p
            class="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1"
          >
            {{ card.label }}
          </p>
          <p class="text-xl font-black leading-none" :class="card.valueClass">
            {{ card.value }}
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>
