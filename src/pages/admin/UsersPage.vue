<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import ToggleUserModal from '@/components/users/ToggleUserModal.vue'
import UsersHeader from '@/components/users/UsersHeader.vue'
import UsersTable from '@/components/users/UsersTable.vue'
import UsersPagination from '@/components/users/UsersPagination.vue'
import { useUserPage } from '@/composables/user/useUserPage'

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
} = useUserPage()
</script>

<template>
  <AdminLayout title="Manajemen Pengguna" subtitle="Daftar Kasir & Admin BUMDes" activeTab="users">

    <UsersHeader v-model="searchQuery" />

    <!-- Error Alert -->
    <div v-if="error"
      class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
      <svg class="w-5 h-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd" />
      </svg>
      <span class="text-sm font-medium">{{ error }}</span>
    </div>

    <UsersTable :users="paginatedUsers" :loading="loading" :searchQuery="searchQuery" :currentPage="currentPage"
      :itemsPerPage="itemsPerPage" :isToggling="isToggling" @view="goToUserDetail" @toggle="openToggleModal"
      @delete="handleDelete" />

    <UsersPagination v-if="filteredUsers.length > 0" :currentPage="currentPage" :totalPages="totalPages"
      :totalItems="filteredUsers.length" :itemsPerPage="itemsPerPage" :itemsPerPageOptions="itemsPerPageOptions"
      @prev="prevPage" @next="nextPage" @update:itemsPerPage="handleItemsPerPageChange" />

    <!-- Modals -->
    <ToggleUserModal :isOpen="isToggleModalOpen" :user="userToToggle" :isLoading="isToggling" @close="closeToggleModal"
      @confirm="handleConfirmToggle" />

  </AdminLayout>
</template>
