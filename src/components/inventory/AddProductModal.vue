<script setup>
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useInventory } from '@/composables/useInventory'
import { useValidation } from '@/composables/useValidation'
import { uploadProductImage, validateImageFile } from '@/services/imageService'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const invStore = useInventory()
const { validateProductForm } = useValidation()

const newProduct = ref({
  sku: '',
  name: '',
  cost_price: 0,
  price: 0,
  stock: 0
})

const imageFile = ref(null)
const imagePreview = ref(null)
const formErrors = ref({})
const isUploading = ref(false)

watch(() => props.isOpen, (val) => {
  if (val) {
    newProduct.value = { sku: '', name: '', cost_price: 0, price: 0, stock: 0 }
    imageFile.value = null
    imagePreview.value = null
    formErrors.value = {}
    isUploading.value = false
  }
})

function validateForm() {
  const validation = validateProductForm(newProduct.value)
  formErrors.value = validation.errors
  return validation.isValid
}

function onImageSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const validation = validateImageFile(file)
  if (!validation.isValid) {
    formErrors.value.image = validation.error
    imageFile.value = null
    imagePreview.value = null
    return
  }

  imageFile.value = file
  formErrors.value.image = null

  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  imageFile.value = null
  imagePreview.value = null
  formErrors.value.image = null
}

async function submitAddProduct() {
  if (!validateForm()) return

  isUploading.value = true

  try {
    let imageUrl = null

    if (imageFile.value) {
      const uploadResult = await uploadProductImage(imageFile.value, newProduct.value.name)
      if (!uploadResult.success) {
        formErrors.value.image = uploadResult.error
        return
      }
      imageUrl = uploadResult.publicUrl
    }

    const res = await invStore.addProduct({
      ...newProduct.value,
      image_url: imageUrl
    })

    if (res.success) emit('close')
  } catch (err) {
    formErrors.value.submit = 'Terjadi kesalahan saat menambahkan produk.'
  } finally {
    isUploading.value = false
  }
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
              class="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle transition-all border border-gray-200">

              <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <DialogTitle as="h3" class="text-base font-bold text-gray-900">
                  Tambah Barang Baru
                </DialogTitle>
              </div>

              <form @submit.prevent="submitAddProduct" class="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                <!-- ERROR NOTIFICATION -->
                <div v-if="formErrors.submit"
                  class="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {{ formErrors.submit }}
                </div>

                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Gambar
                    Produk</label>

                  <!-- Preview Gambar -->
                  <div v-if="imagePreview" class="mb-3 relative">
                    <img :src="imagePreview" alt="Preview"
                      class="w-full h-48 object-cover rounded-lg border border-gray-300" />
                    <button type="button" @click="clearImage"
                      class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                      title="Hapus gambar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                      </svg>
                    </button>
                  </div>

                  <!-- Upload Input -->
                  <div v-if="!imagePreview"
                    class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-600 transition-colors cursor-pointer group">
                    <input type="file" accept="image/jpeg,image/png,image/webp" @change="onImageSelected" class="hidden"
                      id="imageInput" />
                    <label for="imageInput" class="cursor-pointer block">
                      <svg class="mx-auto h-8 w-8 text-gray-400 group-hover:text-green-600" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      <p class="mt-2 text-sm text-gray-600 group-hover:text-green-600">
                        Klik untuk upload gambar (JPEG, PNG, WebP)
                      </p>
                      <p class="text-xs text-gray-500">Maksimal 5MB</p>
                    </label>
                  </div>

                  <!-- Error Message -->
                  <p v-if="formErrors.image" class="mt-2 text-xs text-red-600">
                    {{ formErrors.image }}
                  </p>
                </div>

                <!-- SKU -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Kode SKU <span
                      class="text-red-500">*</span></label>
                  <input v-model="newProduct.sku" type="text"
                    class="w-full border rounded-md px-3 py-2 text-sm outline-none transition-colors" :class="[
                      formErrors.sku
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600'
                    ]" placeholder="Contoh: SKU-010" />

                  <p v-if="formErrors.sku" class="mt-1 text-xs text-red-600">
                    {{ formErrors.sku }}
                  </p>
                </div>

                <!-- NAMA -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Barang <span
                      class="text-red-500">*</span></label>
                  <input v-model="newProduct.name" type="text"
                    class="w-full border rounded-md px-3 py-2 text-sm outline-none transition-colors" :class="[
                      formErrors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600'
                    ]" placeholder="Contoh: Sabun Cuci" />

                  <p v-if="formErrors.name" class="mt-1 text-xs text-red-600">
                    {{ formErrors.name }}
                  </p>
                </div>

                <!-- HARGA -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide"
                      title="Harga kulakan">Harga Modal <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
                      <input v-model.number="newProduct.cost_price" type="number" min="0" step="100"
                        class="w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors" :class="[
                          formErrors.cost_price
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600'
                        ]" placeholder="0" />
                    </div>

                    <p v-if="formErrors.cost_price" class="mt-1 text-xs text-red-600">
                      {{ formErrors.cost_price }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide"
                      title="Harga yang dijual di Kasir">Harga Jual <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
                      <input v-model.number="newProduct.price" type="number" min="0" step="100"
                        class="w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors" :class="[
                          formErrors.price
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600'
                        ]" placeholder="0" />
                    </div>

                    <p v-if="formErrors.price" class="mt-1 text-xs text-red-600">
                      {{ formErrors.price }}
                    </p>
                  </div>
                </div>

                <!-- STOK AWAL -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Stok Awal
                    Fisik</label>
                  <input v-model.number="newProduct.stock" type="number" min="0"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-gray-50 outline-none transition-colors"
                    placeholder="0" />

                  <p v-if="formErrors.stock" class="mt-1 text-xs text-red-600">
                    {{ formErrors.stock }}
                  </p>
                </div>

                <div class="pt-2 flex justify-end gap-3 text-sm">
                  <button type="button" @click="$emit('close')" :disabled="isUploading || invStore.loading.value"
                    class="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-md transition-colors focus:outline-none border border-transparent disabled:opacity-50">
                    Batal
                  </button>
                  <button type="submit" :disabled="isUploading || invStore.loading.value"
                    class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md disabled:opacity-50 transition-colors focus:outline-none border border-transparent flex items-center gap-2">
                    <span v-if="isUploading || invStore.loading.value">
                      <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                    </span>
                    {{ isUploading ? 'Mengupload...' : 'Simpan Barang' }}
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
