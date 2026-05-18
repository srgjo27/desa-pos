<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
import { Button } from "@/components/ui";

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["close", "confirm"]);
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
              class="w-full max-w-sm transform overflow-hidden rounded-lg bg-white text-left align-middle transition-all border border-neutral-200 shadow-xl"
            >
              <div class="p-4 border-b border-neutral-100 flex items-center justify-between">
                <DialogTitle as="h3" class="text-base font-bold">
                  Konfirmasi Keluar
                </DialogTitle>
                <button @click="$emit('close')" class="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <i class="pi pi-times" style="font-size: 14px"></i>
                </button>
              </div>

              <div class="p-4 space-y-4">
                <p class="text-sm leading-relaxed font-medium text-neutral-600">
                  Apakah Anda yakin ingin keluar dari sistem? Anda harus masuk kembali untuk mengakses panel admin.
                </p>
                
                <div class="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    @click="$emit('close')"
                    variant="outline"
                  >
                    Batal
                  </Button>
                  <Button
                    @click="$emit('confirm')"
                    variant="danger"
                  >
                    Keluar
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
