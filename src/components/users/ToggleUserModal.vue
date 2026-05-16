<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
import { Button } from "@/components/ui";

const props = defineProps({
  isOpen: Boolean,
  user: {
    type: Object,
    default: null,
  },
  isLoading: Boolean,
});

const emit = defineEmits(["close", "confirm"]);

function handleConfirm() {
  if (!props.user) return;
  emit("confirm", props.user);
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto w-screen z-50">
        <div class="flex min-h-full items-center justify-center text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-sm transform overflow-hidden rounded-lg bg-white text-left align-middle transition-all border border-neutral-200"
            >
              <div
                class="p-4 border-b border-neutral-100 flex items-center justify-between"
              >
                <DialogTitle as="h3" class="text-base font-bold">
                  Konfirmasi Status Akun
                </DialogTitle>
                <button @click="$emit('close')">
                  <i class="pi pi-times" style="font-size: 14px"></i>
                </button>
              </div>

              <div class="p-4 space-y-4">
                <div
                  class="bg-neutral-100 border border-neutral-100 rounded-md p-4"
                >
                  <div class="flex items-center gap-3">
                    <div
                      v-if="user?.img_url"
                      class="w-10 h-10 rounded-full border border-neutral-100 overflow-hidden shrink-0"
                    >
                      <img
                        :src="user.img_url"
                        alt="Avatar"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      v-else
                      class="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center font-black text-sm border border-neutral-100 shrink-0"
                    >
                      {{ user?.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p
                        class="text-xs text-gray-500 font-bold uppercase tracking-wide"
                      >
                        {{ user?.employee_number || "Tanpa NIP" }}
                      </p>
                      <p class="text-sm font-bold mt-0.5">
                        {{ user?.name }}
                      </p>
                    </div>
                  </div>
                </div>

                <p class="text-sm leading-relaxed font-medium">
                  Apakah Anda yakin ingin
                  <strong
                    :class="user?.is_active ? 'text-red-600' : 'text-green-600'"
                    >{{
                      user?.is_active ? "nonaktifkan" : "mengaktifkan"
                    }}</strong
                  >
                  akses untuk kasir ini?
                </p>
                <p
                  v-if="user?.is_active"
                  class="text-xs text-red-500 font-bold bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2"
                >
                  <i class="pi pi-exclamation-triangle"></i>
                  Akun yang nonaktif tidak dapat masuk ke sistem POS Desa!
                </p>

                <div class="pt-3 flex justify-end gap-3 text-sm">
                  <Button
                    type="button"
                    @click="$emit('close')"
                    :disabled="isLoading"
                    variant="outline"
                  >
                    Batal
                  </Button>
                  <Button
                    @click="handleConfirm"
                    :loading="isLoading"
                    :variant="user?.is_active ? 'danger' : 'primary'"
                  >
                    {{ user?.is_active ? "Nonaktifkan" : "Aktifkan" }}
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
