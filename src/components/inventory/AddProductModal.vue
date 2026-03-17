<script setup>
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useInventory } from '@/composables/useInventory'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const invStore = useInventory()

const newProduct = ref({
  sku: '', name: '', cost_price: 0, price: 0, stock: 0
})

watch(() => props.isOpen, (val) => {
  if (val) {
    newProduct.value = { sku: '', name: '', cost_price: 0, price: 0, stock: 0 }
  }
})

async function submitAddProduct() {
  const res = await invStore.addProduct({ ...newProduct.value })
  if (res.success) {
    emit('close')
  } else {
    alert(invStore.error.value)
  }
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto w-screen">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle transition-all border border-gray-200">
              
              <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <DialogTitle as="h3" class="text-base font-bold text-gray-900">
                  Tambah Barang Baru
                </DialogTitle>
              </div>

              <form @submit.prevent="submitAddProduct" class="px-6 py-5 space-y-5">
                <!-- SKU -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Kode SKU <span class="text-red-500">*</span></label>
                  <input v-model="newProduct.sku" type="text" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-colors" placeholder="Contoh: SKU-010" />
                </div>
                
                <!-- NAMA -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Barang <span class="text-red-500">*</span></label>
                  <input v-model="newProduct.name" type="text" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-colors" placeholder="Contoh: Sabun Cuci" />
                </div>
                
                <!-- HARGA -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide" title="Harga kulakan">Harga Modal</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
                      <input v-model.number="newProduct.cost_price" type="number" min="0" step="100" class="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-colors" placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide" title="Harga yang dijual di Kasir">Harga Jual <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
                      <input v-model.number="newProduct.price" type="number" required min="0" step="100" class="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-colors" placeholder="0" />
                    </div>
                  </div>
                </div>
                
                <!-- STOK AWAL -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Stok Awal Fisik</label>
                  <input v-model.number="newProduct.stock" type="number" min="0" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-gray-50 outline-none transition-colors" placeholder="0" />
                </div>
                
                <div class="pt-2 flex justify-end gap-3 text-sm">
                  <button type="button" @click="$emit('close')" class="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-md transition-colors focus:outline-none border border-transparent">Batal</button>
                  <button type="submit" :disabled="invStore.loading.value" class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md disabled:opacity-50 transition-colors focus:outline-none border border-transparent">
                    Simpan Barang
                  </button>
                </div>
              </form>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
