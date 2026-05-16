<script setup>
import { Button, Card } from "@/components/ui";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  isKasir: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-status"]);
</script>

<template>
  <Card class="col-span-1 h-fit" padding="md">
    <div class="flex flex-col items-center">
      <div class="relative w-32 h-32 mb-5">
        <div
          v-if="user.img_url"
          class="rounded-full border-4 border-gray-50 w-full h-full overflow-hidden bg-white"
        >
          <img
            :src="user.img_url"
            alt="Avatar"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          v-else
          class="rounded-full border-4 border-gray-50 bg-green-100 text-green-700 w-full h-full flex items-center justify-center font-black text-4xl"
        >
          {{ user.name.charAt(0).toUpperCase() }}
        </div>

        <div
          class="absolute bottom-4 right-1 w-6 h-6 border border-white rounded-full"
          :class="user.is_active ? 'bg-green-500' : 'bg-red-500'"
          :title="user.is_active ? 'Aktif' : 'Non-Aktif'"
        ></div>
      </div>

      <h2 class="text-2xl font-black text-center leading-tight">
        {{ user.name }}
      </h2>
      <p
        class="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest text-center"
      >
        {{ user.role }}
      </p>

      <div class="w-full mt-8 border-t border-gray-100 pt-6">
        <Button
          v-if="isKasir"
          @click="$emit('toggle-status')"
          :variant="user.is_active ? 'danger' : 'primary'"
          :fullWidth="true"
        >
          <i
            v-if="user.is_active"
            class="pi pi-ban"
            style="font-size: 14px"
          ></i>
          <i v-else class="pi pi-unlock" style="font-size: 14px"></i>
          {{ user.is_active ? "Blokir Akses" : "Pulihkan Akses" }}
        </Button>

        <div
          v-else
          class="bg-purple-50 text-purple-700 border border-purple-100 rounded-lg p-3 text-center text-xs font-bold flex items-center justify-center gap-2"
        >
          <i class="pi pi-shield" style="font-size: 14px"></i>
          Pengguna Ini Tidak Dapat Diblokir
        </div>
      </div>
    </div>
  </Card>
</template>
