<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

const props = defineProps({
  isOpen: Boolean,
  user: {
    type: Object,
    default: null
  },
  isLoading: Boolean
})

const emit = defineEmits(['close', 'confirm'])

function handleConfirm() {
  if (!props.user) return
  emit('confirm', props.user)
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto w-screen z-50">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <DialogPanel
              class="w-full max-w-sm transform overflow-hidden rounded-lg bg-white text-left align-middle transition-all border border-gray-200">

              <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <DialogTitle as="h3" class="text-base font-bold text-gray-900">
                  Konfirmasi Status Akun
                </DialogTitle>
                <button @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="px-6 py-5 space-y-4">

                <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <div class="flex items-center gap-3">
                    <div v-if="user?.img_url"
                      class="w-10 h-10 rounded-full border border-gray-200 overflow-hidden shrink-0">
                      <img :src="user.img_url" alt="Avatar" class="w-full h-full object-cover" />
                    </div>
                    <div v-else
                      class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm border border-blue-200 shrink-0">
                      {{ user?.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 font-bold uppercase tracking-wide">{{ user?.employee_number ||
                        'Tanpa NIP' }}</p>
                      <p class="text-sm font-bold text-gray-900 mt-0.5">{{ user?.name }}</p>
                    </div>
                  </div>
                </div>

                <p class="text-sm text-gray-600 leading-relaxed font-medium">
                  Apakah Anda yakin ingin <strong :class="user?.is_active ? 'text-red-600' : 'text-green-600'">{{
                    user?.is_active ? 'menonaktifkan' : 'mengaktifkan' }}</strong> akses untuk kasir ini?
                </p>
                <p v-if="user?.is_active"
                  class="text-xs text-red-500 font-bold bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2">
                  <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd" />
                  </svg>
                  Akun yang nonaktif tidak dapat masuk ke sistem POS Desa!
                </p>

                <div class="pt-3 flex justify-end gap-3 text-sm">
                  <button type="button" @click="$emit('close')" :disabled="isLoading"
                    class="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-md transition-colors focus:outline-none border border-transparent disabled:opacity-50">Batal</button>
                  <button @click="handleConfirm" :disabled="isLoading"
                    class="px-5 py-2 text-white font-bold rounded-md disabled:opacity-50 transition-colors focus:outline-none border border-transparent min-w-30 flex justify-center items-center"
                    :class="user?.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'">
                    <svg v-if="isLoading" class="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg"
                      fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    {{ user?.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                  </button>
                </div>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
