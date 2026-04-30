<script setup>
import { toRef } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { Alert, Button, Input } from '@/components/ui'
import { useAddStockModal } from '@/composables/inventory/useAddStockModal'

const props = defineProps({
  isOpen: Boolean,
  product: {
    type: Object,
    default: null
  },
  isLoading: Boolean
})

const emit = defineEmits(['close', 'confirm'])

const {
  stockToAdd,
  error,
  validateInput,
  handleStockInput,
  submitAddStock,
} = useAddStockModal(
  toRef(props, 'isOpen'),
  toRef(props, 'product'),
  (payload) => emit('confirm', payload)
)
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto w-screen">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <DialogPanel
              class="w-full max-w-sm transform overflow-hidden rounded-lg bg-white text-left align-middle transition-all border border-gray-200">

              <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <DialogTitle as="h3" class="text-base font-bold text-gray-900">
                  Tambah Stok (Restock)
                </DialogTitle>
              </div>

              <div class="px-6 py-5 space-y-5">

                <div class="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p class="text-xs text-gray-500 font-bold uppercase tracking-wide">{{ product?.sku }}</p>
                  <p class="text-sm font-bold text-gray-900 mt-0.5">{{ product?.name }}</p>
                  <p class="text-xs mt-2 text-gray-600">Stok Saat Ini: <span
                      class="font-mono bg-white px-1.5 py-0.5 border border-gray-200 rounded">{{ product?.stock
                      }}</span> pc(s)</p>
                </div>

                <!-- Alert -->
                <Alert v-if="error" type="error" :message="error" />

                <div>
                  <div class="flex items-end gap-2">
                    <button type="button" @click="stockToAdd = Math.max(1, stockToAdd - 1)"
                      class="w-10 h-10 border border-gray-300 rounded-md font-bold text-lg focus:outline-none hover:bg-gray-50 text-gray-600 transition-colors">
                      -
                    </button>
                    <Input id="add-stock-qty" :modelValue="stockToAdd" type="number" min="1" size="sm" rounded="md"
                      label="Jumlah Barang Masuk" required autocomplete="off" class="text-center" :error="error"
                      @blur="validateInput" @update:modelValue="handleStockInput" />
                    <button type="button" @click="stockToAdd++"
                      class="w-10 h-10 border border-gray-300 rounded-md font-bold text-lg focus:outline-none hover:bg-gray-50 text-gray-600 transition-colors">
                      +
                    </button>
                  </div>
                </div>

                <div class="pt-2 flex justify-end gap-3 text-sm">
                  <Button type="button" variant="secondary" size="sm" rounded="md" :disabled="isLoading"
                    class="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" @click="$emit('close')">
                    Batal
                  </Button>
                  <Button type="button" size="sm" rounded="md" :disabled="isLoading || stockToAdd < 1"
                    @click="submitAddStock">
                    Konfirmasi
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
