<script setup>
import { computed } from "vue";
import { formatDate } from "@/utils/format";
import { Table } from "@/components/ui";

const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: "",
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  itemsPerPage: {
    type: Number,
    default: 20,
  },
  isToggling: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["view", "toggle", "delete"]);

const emptyMessage = computed(() => {
  return props.searchQuery
    ? "Tidak ditemukan pengguna yang cocok."
    : "Belum ada pengguna yang terdaftar.";
});

const columns = [
  { key: "no", label: "No", width: "w-12 text-center" },
  { key: "name", label: "Nama Pengguna" },
  { key: "employee_number", label: "No. Pegawai" },
  { key: "role", label: "Peran Pribadi" },
  { key: "created_at", label: "Tgl Terdaftar" },
  { key: "status", label: "Status Akun", width: "w-36 text-center" },
  { key: "actions", label: "Aksi", width: "w-44 text-center" },
];
</script>

<template>
  <Table
    class="overflow-x-auto"
    :columns="columns"
    :rows="users"
    :loading="loading"
    size="sm"
    :striped="false"
    :bordered="true"
    :hoverable="true"
    :emptyMessage="emptyMessage"
    loadingMessage="Mengunduh data karyawan..."
  >
    <template #header-no="{ column }">
      <div class="text-center">{{ column.label }}</div>
    </template>
    <template #header-status="{ column }">
      <div class="text-center">{{ column.label }}</div>
    </template>
    <template #header-actions="{ column }">
      <div class="text-center">{{ column.label }}</div>
    </template>

    <template #cell-no="{ rowIndex }">
      <div class="text-center text-gray-400 font-bold">
        {{ (currentPage - 1) * itemsPerPage + rowIndex + 1 }}
      </div>
    </template>

    <template #cell-name="{ row }">
      <button
        @click="emit('view', row)"
        class="flex items-center gap-3 text-left w-full hover:bg-gray-50 focus:outline-none p-1.5 -ml-1.5 rounded-lg transition-colors group"
      >
        <div
          v-if="row.img_url"
          class="w-8 h-8 rounded-full border border-gray-200 overflow-hidden shrink-0 group-hover:border-green-300 transition-colors"
        >
          <img
            :src="row.img_url"
            alt="Avatar"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          v-else
          class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm border border-blue-200 shrink-0 group-hover:bg-blue-200 transition-colors"
        >
          {{ row.name.charAt(0).toUpperCase() }}
        </div>
        <span
          class="group-hover:text-green-700 font-semibold transition-colors"
          >{{ row.name }}</span
        >
      </button>
    </template>

    <template #cell-employee_number="{ row }">
      <span class="font-mono text-sm text-gray-600">{{
        row.employee_number || "-"
      }}</span>
    </template>

    <template #cell-role="{ row }">
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border"
        :class="
          row.role === 'ADMIN'
            ? 'bg-purple-50 text-purple-700 border-purple-200'
            : 'bg-orange-50 text-orange-700 border-orange-200'
        "
      >
        <svg
          v-if="row.role === 'ADMIN'"
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <svg
          v-else
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        {{ row.role }}
      </span>
    </template>

    <template #cell-created_at="{ row }">
      <span class="text-gray-500 font-medium text-sm">{{
        formatDate(row.created_at)
      }}</span>
    </template>

    <template #cell-status="{ row }">
      <div class="text-center">
        <span
          class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black border"
          :class="
            row.is_active
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full mr-2"
            :class="row.is_active ? 'bg-green-500' : 'bg-red-500'"
          ></span>
          {{ row.is_active ? "AKTIF" : "NON-AKTIF" }}
        </span>
      </div>
    </template>

    <template #cell-actions="{ row }">
      <div
        v-if="row.role === 'KASIR'"
        class="flex items-center justify-center gap-2"
      >
        <button
          @click="emit('toggle', row)"
          :disabled="isToggling"
          class="px-2.5 py-1.5 rounded-md text-xs font-bold border transition-colors focus:outline-none flex items-center gap-1.5 disabled:opacity-50"
          :class="
            row.is_active
              ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
              : 'bg-white text-green-600 border-green-200 hover:bg-green-50'
          "
        >
          <svg
            v-if="row.is_active"
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <svg
            v-else
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          {{ row.is_active ? "Blokir" : "Aktifkan" }}
        </button>
        <button
          @click="emit('delete', row)"
          title="Hapus Pengguna"
          class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 focus:outline-none transition-colors"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </template>
  </Table>
</template>
