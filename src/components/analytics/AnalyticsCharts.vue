<script setup>
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const props = defineProps({
  chartAnalytics: {
    type: Object,
    required: true,
  },
  hasData: {
    type: Boolean,
    default: false,
  },
});

const year = computed(
  () => props.chartAnalytics.generateMonthlyChartData.value.year,
);
const revenueData = computed(() => props.chartAnalytics.revenueChartData.value);
const profitData = computed(() => props.chartAnalytics.profitChartData.value);
const chartOptions = computed(() => props.chartAnalytics.chartOptions.value);
</script>

<template>
  <div v-if="hasData" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-bold mb-4">Penjualan Tahun {{ year }}</h3>
      <Bar :data="revenueData" :options="chartOptions" />
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-bold mb-4">Profit Tahun {{ year }}</h3>
      <Bar :data="profitData" :options="chartOptions" />
    </div>
  </div>
</template>
