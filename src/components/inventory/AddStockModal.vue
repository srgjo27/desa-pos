<script setup>
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useValidation } from '@/composables/useValidation'

const props = defineProps({
  isOpen: Boolean,
  product: {
    type: Object,
    default: null
  },
  isLoading: Boolean
})

const emit = defineEmits(['close', 'confirm'])

const { validateQuantity } = useValidation()
const stockToAdd = ref(1)
const error = ref(null)

watch(() => props.isOpen, (val) => {
  if (val) {
    stockToAdd.value = 1
    error.value = null
  }
})

function validateInput() {
  const validationError = validateQuantity(stockToAdd.value, 1, 100000)
  if (validationError) {
    error.value = validationError
    return false
  }
  error.value = null
  return true
}

function submitAddStock() {
  if (!props.product || !validateInput()) return
  emit('confirm', { productId: props.product.id, qty: stockToAdd.value })
}
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

                <!-- ERROR NOTIFICATION -->
                <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {{ error }}
                </div>

                <!-- INPUT QTY TAMBAH -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Jumlah Barang
                    Masuk <span class="text-red-500">*</span></label>
                  <div class="flex items-center gap-2">
                    <button type="button" @click="stockToAdd = Math.max(1, stockToAdd - 1)"
                      class="w-10 h-10 border border-gray-300 rounded-md font-bold text-lg focus:outline-none hover:bg-gray-50 text-gray-600 transition-colors">
                      -
                    </button>
                    <input v-model.number="stockToAdd" @blur="validateInput" type="number" min="1"
                      class="w-full text-center border rounded-md px-3 py-2 text-sm font-bold outline-none transition-colors"
                      :class="[
                        error
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-gray-300 focus:border-green-600'
                      ]" />
                    <button type="button" @click="stockToAdd++"
                      class="w-10 h-10 border border-gray-300 rounded-md font-bold text-lg focus:outline-none hover:bg-gray-50 text-gray-600 transition-colors">
                      +
                    </button>
                  </div>
                </div>

                <div class="pt-2 flex justify-end gap-3 text-sm">
                  <button type="button" @click="$emit('close')" :disabled="isLoading"
                    class="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-md transition-colors focus:outline-none border border-transparent disabled:opacity-50">
                    Batal
                  </button>
                  <button type="button" @click="submitAddStock" :disabled="isLoading || stockToAdd < 1"
                    class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md disabled:opacity-50 transition-colors focus:outline-none border border-transparent">
                    Konfirmasi
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
