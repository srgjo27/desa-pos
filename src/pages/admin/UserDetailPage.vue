<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import ToggleUserModal from "@/components/users/ToggleUserModal.vue";
import { useShifts } from "@/composables/shifts/useShifts";
import { useUserDetail } from "@/composables/user/useUserDetail";
import { useWeeklyStats } from "@/composables/useWeeklyStats";
import { ErrorState, LoadingState } from "@/components/ui";

import UserProfileCard from "@/components/users/UserProfileCard.vue";
import UserEmployeeInfo from "@/components/users/UserEmployeeInfo.vue";
import UserWeeklyStats from "@/components/users/UserWeeklyStats.vue";
import UserShiftHistory from "@/components/users/UserShiftHistory.vue";

const route = useRoute();
const router = useRouter();
const userId = route.params.id;

const { shifts, loading: shiftsLoading, fetchShiftsByUserId } = useShifts();
const userDetail = useUserDetail(userId);
const weeklyStats = useWeeklyStats(shifts);

onMounted(async () => {
  const result = await userDetail.initializeUserData();

  if (result.success) {
    if (userDetail.isKasir()) {
      await fetchShiftsByUserId(userId);
    }
  }
});
</script>

<template>
  <AdminLayout
    title="Profil Pengguna"
    subtitle="Informasi rincian akun pegawai"
    activeTab="users"
  >
    <div class="mb-6">
      <button
        @click="router.push('/users')"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
      >
        <i class="pi pi-arrow-left" style="font-size: 14px"></i>
        Kembali ke Daftar
      </button>
    </div>

    <!-- Error State -->
    <ErrorState
      v-if="userDetail.error.value"
      title="Gagal Memuat Profil"
      :message="userDetail.error.value"
      actionLabel="Lihat Daftar Semua Pengguna"
      @action="router.push('/users')"
    />

    <!-- Loading State -->
    <LoadingState
      v-else-if="userDetail.loading.value"
      message="Sedang menyinkronkan data profil..."
    />

    <!-- Content State -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UserProfileCard
        :user="userDetail.user.value"
        :isKasir="userDetail.isKasir()"
        @toggle-status="userDetail.isToggleModalOpen.value = true"
      />

      <UserEmployeeInfo :user="userDetail.user.value" />

      <UserWeeklyStats
        v-if="userDetail.isKasir()"
        :weekLabel="weeklyStats.weekLabel.value"
        :stats="weeklyStats.weeklyStats.value"
        :progressPercentage="weeklyStats.getProgressPercentage()"
      />

      <UserShiftHistory
        v-if="userDetail.isKasir()"
        :shifts="weeklyStats.filteredShifts.value"
        :loading="shiftsLoading"
        :weekLabel="weeklyStats.weekLabel.value"
        :isCurrentWeek="weeklyStats.isCurrentWeek.value"
        @prev-week="weeklyStats.prevWeek()"
        @next-week="weeklyStats.nextWeek()"
        @reset-week="weeklyStats.resetWeek()"
      />
    </div>

    <!-- Modals -->
    <ToggleUserModal
      :isOpen="userDetail.isToggleModalOpen.value"
      :user="userDetail.user.value"
      :isLoading="userDetail.isToggling.value"
      @close="userDetail.isToggleModalOpen.value = false"
      @confirm="userDetail.handleConfirmToggle"
    />
  </AdminLayout>
</template>
