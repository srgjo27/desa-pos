<script setup>
import { toRef } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
import { Alert, Button, Input } from "@/components/ui";
import { useAddProductModal } from "@/composables/inventory/useAddProductModal";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const {
  newProduct,
  imagePreview,
  formErrors,
  isUploading,
  isSaving,
  onImageSelected,
  clearImage,
  submitAddProduct,
} = useAddProductModal(toRef(props, "isOpen"), () => emit("close"));
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
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto w-screen">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
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
              class="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle transition-all border border-gray-200"
            >
              <div
                class="px-6 py-5 border-b border-gray-100 flex items-center justify-between"
              >
                <DialogTitle as="h3" class="text-base font-bold text-gray-900">
                  Tambah Barang Baru
                </DialogTitle>
              </div>

              <form
                @submit.prevent="submitAddProduct"
                class="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto"
              >
                <!-- ALERT -->
                <Alert
                  v-if="formErrors.submit"
                  type="error"
                  :message="formErrors.submit"
                />

                <div>
                  <label
                    class="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide"
                    >Gambar Produk</label
                  >

                  <!-- IMAGE PREVIEW -->
                  <div v-if="imagePreview" class="mb-3 relative">
                    <img
                      :src="imagePreview"
                      alt="Preview"
                      class="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      @click="clearImage"
                      class="absolute top-2 right-2 text-red-700"
                      title="Hapus gambar"
                    >
                      <i class="pi pi-times" style="font-size: 16px"></i>
                    </button>
                  </div>

                  <!-- UPLOAD INPUT -->
                  <div
                    v-if="!imagePreview"
                    class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-600 transition-colors cursor-pointer group"
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      @change="onImageSelected"
                      class="hidden"
                      id="imageInput"
                    />
                    <label for="imageInput" class="cursor-pointer block">
                      <i class="pi pi-upload" style="font-size: 24px"></i>
                      <p
                        class="mt-2 text-sm text-gray-600 group-hover:text-green-600"
                      >
                        Klik untuk upload gambar (JPEG, PNG, WebP)
                      </p>
                      <p class="text-xs text-gray-500">Maksimal 5MB</p>
                    </label>
                  </div>

                  <!-- ERROR MESSAGE -->
                  <div
                    v-if="formErrors.image"
                    class="flex items-center gap-1 mt-2"
                  >
                    <i
                      class="pi pi-info-circle"
                      style="font-size: 12px; color: #e60000"
                    ></i>
                    <p class="text-xs text-red-700">
                      {{ formErrors.image }}
                    </p>
                  </div>
                </div>

                <div>
                  <Input
                    id="add-product-sku"
                    v-model="newProduct.sku"
                    type="text"
                    size="sm"
                    rounded="md"
                    label="Kode SKU"
                    required
                    autocomplete="off"
                    placeholder="Contoh: SKU-010"
                    :error="formErrors.sku"
                  />
                </div>

                <div>
                  <Input
                    id="add-product-name"
                    v-model="newProduct.name"
                    type="text"
                    size="sm"
                    rounded="md"
                    label="Nama Barang"
                    required
                    autocomplete="off"
                    placeholder="Contoh: Sabun Cuci"
                    :error="formErrors.name"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="add-product-cost-price"
                      :modelValue="newProduct.cost_price"
                      type="number"
                      size="sm"
                      rounded="md"
                      label="Harga Modal"
                      required
                      placeholder="0"
                      :error="formErrors.cost_price"
                      @update:modelValue="
                        (value) => (newProduct.cost_price = Number(value || 0))
                      "
                    >
                      <template #prefix>
                        <span class="text-gray-400 text-sm font-medium"
                          >Rp</span
                        >
                      </template>
                    </Input>
                  </div>
                  <div>
                    <Input
                      id="add-product-price"
                      :modelValue="newProduct.price"
                      type="number"
                      size="sm"
                      rounded="md"
                      label="Harga Jual"
                      required
                      placeholder="0"
                      :error="formErrors.price"
                      @update:modelValue="
                        (value) => (newProduct.price = Number(value || 0))
                      "
                    >
                      <template #prefix>
                        <span class="text-gray-400 text-sm font-medium"
                          >Rp</span
                        >
                      </template>
                    </Input>
                  </div>
                </div>

                <div>
                  <Input
                    id="add-product-stock"
                    :modelValue="newProduct.stock"
                    type="number"
                    size="sm"
                    rounded="md"
                    label="Stok Awal Fisik"
                    placeholder="0"
                    :error="formErrors.stock"
                    @update:modelValue="
                      (value) => (newProduct.stock = Number(value || 0))
                    "
                  />
                </div>

                <div class="pt-2 flex justify-end gap-3 text-sm">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    rounded="md"
                    :disabled="isSaving"
                    class="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    @click="$emit('close')"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    rounded="md"
                    :loading="isSaving"
                    :disabled="isSaving"
                  >
                    {{ isUploading ? "Mengupload..." : "Simpan Barang" }}
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
