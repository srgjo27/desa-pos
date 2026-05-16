<script setup>
import { Card } from "@/components/ui";
import { formatDate } from "@/utils/format";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <Card
    padding="md"
    title="Informasi Kepegawaian"
    class="col-span-1 md:col-span-2"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
      <div class="sm:col-span-1">
        <label class="text-sm font-medium text-gray-500 mb-1">
          ID Sistem Pendaftaran
        </label>
        <p
          class="text-sm font-bold break-all bg-gray-50 p-2 rounded border border-gray-100 font-mono"
        >
          {{ user.id }}
        </p>
      </div>

      <div class="sm:col-span-1">
        <label class="text-sm font-medium text-gray-500 mb-1">
          Nomor Induk Pegawai
        </label>
        <p class="text-base font-bold border-l-2 border-green-500 pl-3">
          {{ user.employee_number || "Tidak Dilengkapi (GUEST)" }}
        </p>
      </div>

      <div class="sm:col-span-1">
        <label class="text-sm font-medium text-gray-500 mb-1">
          Status Keanggotaan
        </label>
        <p class="mt-1">
          <span
            class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black border"
            :class="
              user.is_active
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            "
          >
            <span
              class="w-1.5 h-1.5 rounded-full mr-2"
              :class="user.is_active ? 'bg-green-500' : 'bg-red-500'"
            ></span>
            {{ user.is_active ? "AKTIF BEKERJA" : "AKUN DITANGGUHKAN" }}
          </span>
        </p>
      </div>

      <div
        class="sm:col-span-1 border-t border-gray-100 pt-4 mt-2 sm:mt-0 sm:border-t-0 sm:pt-0"
      >
        <label class="text-sm font-medium text-gray-500 mb-1">
          Nomor Telepon
        </label>
        <p class="text-sm font-bold flex items-center gap-2">
          <i class="pi pi-phone" style="font-size: 14px"></i>
          {{ user.phone || "Tidak Ada Data" }}
        </p>
      </div>

      <div
        class="sm:col-span-1 border-t border-gray-100 pt-4 mt-2 sm:mt-0 sm:border-t-0 sm:pt-0"
      >
        <label class="text-sm font-medium text-gray-500 mb-1">
          Tanggal Mulai Dinas
        </label>
        <p class="text-sm font-bold flex items-center gap-2">
          <i class="pi pi-calendar" style="font-size: 14px"></i>
          {{ formatDate(user.created_at) }}
        </p>
      </div>

      <div class="sm:col-span-2 border-t border-gray-100 pt-4">
        <label class="text-sm font-medium text-gray-500 mb-2">
          Alamat Tempat Tinggal
        </label>
        <p
          class="text-sm font-medium bg-gray-50 p-3.5 rounded-lg border border-gray-100 leading-relaxed"
        >
          {{ user.address || "Alamat belum dilengkapi oleh pengguna." }}
        </p>
      </div>
    </div>
  </Card>
</template>
