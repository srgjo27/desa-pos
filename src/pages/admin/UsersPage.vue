<script setup>
import AdminLayout from "@/layouts/AdminLayout.vue";
import ToggleUserModal from "@/components/users/ToggleUserModal.vue";
import UsersHeader from "@/components/users/UsersHeader.vue";
import UsersTable from "@/components/users/UsersTable.vue";
import UsersPagination from "@/components/users/UsersPagination.vue";
import { useUserPage } from "@/composables/user/useUserPage";

const {
  searchQuery,
  filteredUsers,
  paginatedUsers,
  totalPages,
  currentPage,
  itemsPerPage,
  itemsPerPageOptions,
  isToggleModalOpen,
  userToToggle,
  isToggling,
  loading,
  error,
  openToggleModal,
  closeToggleModal,
  handleConfirmToggle,
  handleDelete,
  handleItemsPerPageChange,
  prevPage,
  nextPage,
  goToUserDetail,
} = useUserPage();
</script>

<template>
  <AdminLayout
    title="Manajemen Pengguna"
    subtitle="Daftar Kasir & Admin BUMDes"
    activeTab="users"
  >
    <UsersHeader v-model="searchQuery" />

    <!-- Error Alert -->
    <div
      v-if="error"
      class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3"
    >
      <i class="pi pi-info-circle"></i>
      <span class="text-sm font-medium">{{ error }}</span>
    </div>

    <UsersTable
      :users="paginatedUsers"
      :loading="loading"
      :searchQuery="searchQuery"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :isToggling="isToggling"
      @view="goToUserDetail"
      @toggle="openToggleModal"
      @delete="handleDelete"
    />

    <UsersPagination
      v-if="filteredUsers.length > 0"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :totalItems="filteredUsers.length"
      :itemsPerPage="itemsPerPage"
      :itemsPerPageOptions="itemsPerPageOptions"
      @prev="prevPage"
      @next="nextPage"
      @update:itemsPerPage="handleItemsPerPageChange"
    />

    <!-- Modals -->
    <ToggleUserModal
      :isOpen="isToggleModalOpen"
      :user="userToToggle"
      :isLoading="isToggling"
      @close="closeToggleModal"
      @confirm="handleConfirmToggle"
    />
  </AdminLayout>
</template>
