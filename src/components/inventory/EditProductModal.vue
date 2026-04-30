<script setup>
import { toRef } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { Alert, Button, Input } from '@/components/ui'
import { useEditProductModal } from '@/composables/inventory/useEditProductModal'

const props = defineProps({
    isOpen: Boolean,
    product: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close', 'updated'])

const {
    editProduct,
    imagePreview,
    formErrors,
    isUploading,
    isSaving,
    onImageSelected,
    clearImage,
    submitEditProduct,
} = useEditProductModal(
    toRef(props, 'isOpen'),
    toRef(props, 'product'),
    {
        onClose: () => emit('close'),
        onUpdated: () => emit('updated'),
    }
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
                            class="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle transition-all border border-gray-200">

                            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                <DialogTitle as="h3" class="text-base font-bold text-gray-900">
                                    Edit Data Barang
                                </DialogTitle>
                            </div>

                            <form @submit.prevent="submitEditProduct"
                                class="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                                <!-- Alert -->
                                <Alert v-if="formErrors.submit" type="error" :message="formErrors.submit" />

                                <div>
                                    <label
                                        class="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Gambar
                                        Produk</label>

                                    <!-- Preview Gambar -->
                                    <div v-if="imagePreview" class="mb-3 relative">
                                        <img :src="imagePreview" alt="Preview"
                                            class="w-full h-48 object-cover rounded-lg border border-gray-300" />
                                        <button type="button" @click="clearImage"
                                            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                            title="Hapus gambar">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    <!-- Upload Input -->
                                    <div v-if="!imagePreview"
                                        class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-600 transition-colors cursor-pointer group">
                                        <input type="file" accept="image/jpeg,image/png,image/webp"
                                            @change="onImageSelected" class="hidden" id="editImageInput" />
                                        <label for="editImageInput" class="cursor-pointer block">
                                            <svg class="mx-auto h-8 w-8 text-gray-400 group-hover:text-green-600"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 4v16m8-8H4"></path>
                                            </svg>
                                            <p class="mt-2 text-sm text-gray-600 group-hover:text-green-600">
                                                Klik untuk ganti gambar (JPEG, PNG, WebP)
                                            </p>
                                            <p class="text-xs text-gray-500">Maksimal 5MB</p>
                                        </label>
                                    </div>

                                    <!-- Error Message -->
                                    <p v-if="formErrors.image" class="mt-2 text-xs text-red-600">
                                        {{ formErrors.image }}
                                    </p>
                                </div>

                                <div>
                                    <Input id="edit-product-sku" :modelValue="editProduct.sku" type="text" size="sm"
                                        rounded="md" label="Kode SKU" required autocomplete="off" disabled
                                        class="bg-gray-50 text-gray-500" placeholder="SKU tidak bisa diubah" />
                                    <p class="mt-1 text-xs text-gray-500">Kode SKU tidak dapat diubah (audit trail)</p>
                                </div>

                                <div>
                                    <Input id="edit-product-name" v-model="editProduct.name" type="text" size="sm"
                                        rounded="md" label="Nama Barang" required autocomplete="off"
                                        placeholder="Contoh: Sabun Cuci" :error="formErrors.name" />
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <Input id="edit-product-cost-price" :modelValue="editProduct.cost_price"
                                            type="number" min="0" step="100" size="sm" rounded="md" label="Harga Modal"
                                            required title="Harga kulakan" placeholder="0"
                                            :error="formErrors.cost_price"
                                            @update:modelValue="(value) => (editProduct.cost_price = Number(value || 0))">
                                            <template #prefix>
                                                <span class="text-gray-400 text-sm font-medium">Rp</span>
                                            </template>
                                        </Input>
                                    </div>
                                    <div>
                                        <Input id="edit-product-price" :modelValue="editProduct.price" type="number"
                                            min="0" step="100" size="sm" rounded="md" label="Harga Jual" required
                                            title="Harga yang dijual di Kasir" placeholder="0" :error="formErrors.price"
                                            @update:modelValue="(value) => (editProduct.price = Number(value || 0))">
                                            <template #prefix>
                                                <span class="text-gray-400 text-sm font-medium">Rp</span>
                                            </template>
                                        </Input>
                                    </div>
                                </div>

                                <div>
                                    <Input id="edit-product-stock" :modelValue="editProduct.stock" type="number" min="0"
                                        size="sm" rounded="md" label="Stok" required placeholder="0"
                                        @update:modelValue="(value) => (editProduct.stock = Number(value || 0))" />
                                    <p class="mt-1 text-xs text-gray-500">Untuk adjustment stok yang lebih detail,
                                        gunakan tombol "Tambah Stok" pada tabel</p>
                                </div>

                                <div class="pt-2 flex justify-end gap-3 text-sm">
                                    <Button type="button" variant="secondary" size="sm" rounded="md"
                                        :disabled="isSaving"
                                        class="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                                        @click="$emit('close')">
                                        Batal
                                    </Button>
                                    <Button type="submit" size="sm" rounded="md" :loading="isSaving"
                                        :disabled="isSaving">
                                        {{ isUploading ? 'Mengupload...' : 'Simpan Perubahan' }}
                                    </Button>
                                </div>
                            </form>

                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
