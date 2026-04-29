<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import AnalyticsFilterBar from '@/components/analytics/AnalyticsFilterBar.vue'
import AnalyticsSummaryCards from '@/components/analytics/AnalyticsSummaryCards.vue'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts.vue'
import AnalyticsProfitTable from '@/components/analytics/AnalyticsProfitTable.vue'
import { useAnalyticsPage } from '@/composables/analytics/useAnalyticsPage'

const {
  analytics,
  chartAnalytics,
  startDate,
  endDate,
  isExporting,
  summaryMetrics,
  hasMonthlyData,
  fetchAnalytics,
  handleResetFilter,
  handleExportPDF,
} = useAnalyticsPage()
</script>

<template>
  <AdminLayout title="Analisis Keuangan" subtitle="Laporan Laba/Rugi BUMDes" activeTab="analytics">
    <AnalyticsFilterBar v-model:startDate="startDate" v-model:endDate="endDate" :loading="analytics.loading.value"
      @apply="fetchAnalytics" @reset="handleResetFilter" />

    <AnalyticsSummaryCards :summary="summaryMetrics.value" />

    <AnalyticsCharts :chartAnalytics="chartAnalytics" :hasData="hasMonthlyData" />

    <AnalyticsProfitTable :rows="analytics.profitData.value" :loading="analytics.loading.value"
      :isExporting="isExporting" @export="handleExportPDF" />
  </AdminLayout>
</template>
