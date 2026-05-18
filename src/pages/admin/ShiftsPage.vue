<script setup>
import { onMounted } from "vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { ErrorState } from "@/components/ui";
import ShiftsTable from "@/components/shifts/ShiftsTable.vue";
import ShiftsPagination from "@/components/shifts/ShiftsPagination.vue";
import { useShiftsPage } from "@/composables/shifts/useShiftsPage";

const {
  shifts,
  loading,
  error,
  currentPage,
  itemsPerPage,
  itemsPerPageOptions,
  totalPages,
  paginatedShifts,
  prevPage,
  nextPage,
  handleItemsPerPageChange,
  initPage,
  fetchShifts,
} = useShiftsPage();

onMounted(async () => {
  await initPage();
});
</script>

<template>
  <AdminLayout
    title="Rekap Shift Kasir"
    subtitle="Analisis absensi dan durasi kerja harian"
    activeTab="shifts"
  >
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold">Riwayat Absensi</h2>
        <p class="text-sm text-gray-500">
          Memonitor kedisiplinan shift kerja karyawan berdasarkan waktu standar
          8 Jam.
        </p>
      </div>
    </div>

    <!-- Error Alert -->
    <ErrorState
      v-if="error"
      title="Gagal Memuat Shift"
      :message="error"
      actionLabel="Muat Ulang Data"
      @action="fetchShifts()"
    />

    <ShiftsTable :shifts="paginatedShifts" :loading="loading" />

    <ShiftsPagination
      v-if="shifts.length > 0"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :itemsPerPage="itemsPerPage"
      :itemsPerPageOptions="itemsPerPageOptions"
      @prev="prevPage"
      @next="nextPage"
      @update:itemsPerPage="handleItemsPerPageChange"
    />
  </AdminLayout>
</template>
