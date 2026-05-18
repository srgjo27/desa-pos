<script setup>
import { Card } from "@/components/ui";

const props = defineProps({
  weekLabel: {
    type: String,
    required: true,
  },
  stats: {
    type: Object,
    required: true,
  },
  progressPercentage: {
    type: Number,
    required: true,
  },
});
</script>

<template>
  <Card
    padding="md"
    title="Statistik Kinerja Mingguan"
    class="col-span-1 md:col-span-3 mt-2"
  >
    <div
      class="bg-linear-to-br bg-white border border-neutral-100 rounded-lg p-4 flex flex-col lg:flex-row items-center justify-between gap-6"
    >
      <div class="flex items-center gap-4 w-full lg:w-auto">
        <div
          class="w-14 h-14 bg-neutral-50 rounded-full flex items-center justify-center shrink-0 text-green-600"
        >
          <i class="pi pi-clock" style="font-size: 28px"></i>
        </div>

        <div>
          <h3 class="font-bold text-lg">Pencapaian Jam Kerja</h3>
          <p class="text-sm text-gray-500">
            {{ weekLabel }}
          </p>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex flex-col gap-3">
        <div class="flex flex-wrap justify-between items-end gap-2">
          <div>
            <span
              class="text-2xl font-bold"
              :class="stats.isMet ? 'text-green-600' : ''"
            >
              {{ stats.text }}
            </span>
            <span class="text-gray-500 font-medium ml-2">/ 40j 0m</span>
          </div>
          <span
            class="px-2.5 py-1 bg-white rounded-full font-bold text-xs border border-neutral-100"
            :class="stats.isMet ? 'text-green-600' : 'text-orange-600'"
          >
            {{ stats.diffText }}
          </span>
        </div>

        <div
          class="h-3 w-full bg-white overflow-hidden border border-neutral-100"
        >
          <div
            class="h-full transition-all duration-1000 ease-out"
            :class="stats.isMet ? 'bg-green-500' : 'bg-blue-500'"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </Card>
</template>
