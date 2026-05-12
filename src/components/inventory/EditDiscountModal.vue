<script setup>
import { toRef } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
import { Button, Input } from "@/components/ui";
import { useEditDiscountModal } from "@/composables/inventory/useEditDiscountModal";
import { formatRupiah } from "@/utils/format";

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  product: { type: Object, default: null },
});

const emit = defineEmits(["close", "save"]);

const {
  isOnDiscount,
  discountPriceRaw,
  discountPercentRaw,
  normalPrice,
  discountPrice,
  discountAmount,
  discountPercent,
  onDiscountPriceInput,
  setDiscountByPercent,
  onDiscountPercentInput,
  removeDiscount,
  handleSave,
  handleClose,
} = useEditDiscountModal(toRef(props, "isOpen"), toRef(props, "product"), {
  onClose: () => emit("close"),
  onSave: (payload) => emit("save", payload),
});
</script>

<template>
  <TransitionRoot as="template" :show="props.isOpen">
    <Dialog as="div" class="relative z-50" @close="handleClose">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        ></div>
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-xl bg-white text-left transition-all sm:my-8 sm:w-full sm:max-w-lg w-full"
            >
              <!-- HEADER -->
              <div
                class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50"
              >
                <div>
                  <DialogTitle as="h3" class="text-xl font-bold text-gray-800">
                    Atur Diskon
                  </DialogTitle>
                  <p v-if="product" class="text-sm text-gray-500 mt-1">
                    {{ product.name }}
                  </p>
                </div>
                <button @click="handleClose" class="text-gray-400">
                  <i class="pi pi-times" style="font-size: 20px"></i>
                </button>
              </div>

              <!-- BODY -->
              <div class="px-6 py-6 space-y-6">
                <!-- TOGGLE DISKON -->
                <div class="flex items-center gap-2">
                  <button
                    @click="isOnDiscount = !isOnDiscount"
                    :class="isOnDiscount ? 'bg-green-600' : 'bg-gray-300'"
                    class="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none"
                  >
                    <span
                      :class="isOnDiscount ? 'translate-x-7' : 'translate-x-1'"
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    ></span>
                  </button>
                  <span class="text-sm font-semibold text-gray-700">
                    {{ isOnDiscount ? "Diskon Aktif" : "Diskon Tidak Aktif" }}
                  </span>
                </div>

                <!-- NORMAL PRICE -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <label class="text-sm font-bold text-gray-700 block mb-2"
                    >Harga Normal</label
                  >
                  <div class="text-xl font-black">
                    {{ formatRupiah(normalPrice) }}
                  </div>
                </div>

                <!-- DISCOUNT INPUT SECTION -->
                <div
                  v-if="isOnDiscount"
                  class="space-y-4 animate-in fade-in slide-in-from-top-2"
                >
                  <!-- DISCOUNT PRICE -->
                  <div>
                    <Input
                      id="discount-price"
                      :modelValue="
                        discountPriceRaw
                          ? Number(discountPriceRaw).toLocaleString('id-ID')
                          : ''
                      "
                      type="text"
                      size="md"
                      rounded="lg"
                      label="Harga Setelah Diskon"
                      autocomplete="off"
                      placeholder="Masukkan harga diskon"
                      @update:modelValue="onDiscountPriceInput"
                    >
                      <template #prefix>
                        <span class="font-semibold text-gray-400">Rp</span>
                      </template>
                    </Input>
                  </div>

                  <!-- DISCOUNT PERCENT -->
                  <div>
                    <Input
                      id="discount-percent"
                      :modelValue="discountPercentRaw"
                      type="text"
                      size="md"
                      rounded="lg"
                      label="Persentase Diskon"
                      autocomplete="off"
                      placeholder="0 - 100"
                      @update:modelValue="onDiscountPercentInput"
                    >
                      <template #suffix>
                        <span class="font-semibold text-gray-400">%</span>
                      </template>
                    </Input>
                  </div>

                  <!-- QUICK PERCENT BUTTONS -->
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="percent in [5, 10, 15, 20]"
                      :key="percent"
                      @click="setDiscountByPercent(percent)"
                      :class="
                        discountPercent === percent
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      "
                      class="py-2 rounded-lg font-semibold text-sm transition-colors"
                    >
                      {{ percent }}%
                    </button>
                  </div>

                  <!-- DISCOUNT SUMMARY -->
                  <div
                    class="bg-orange-50 border border-orange-100 rounded-lg p-4 space-y-2"
                  >
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Harga Normal</span>
                      <span class="font-bold text-gray-800">{{
                        formatRupiah(normalPrice)
                      }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Harga Diskon</span>
                      <span class="font-bold text-green-700">{{
                        formatRupiah(discountPrice)
                      }}</span>
                    </div>
                    <div
                      class="border-t border-orange-200 pt-2 flex justify-between text-sm"
                    >
                      <span class="text-gray-600">Hemat</span>
                      <span class="font-bold text-orange-600"
                        >{{ formatRupiah(discountAmount) }} ({{
                          discountPercent
                        }}%)</span
                      >
                    </div>
                  </div>

                  <!-- PREVIEW DI KASIR -->
                  <div
                    class="bg-green-50 border border-green-100 rounded-lg p-4"
                  >
                    <p class="text-xs font-bold text-green-700 mb-2">
                      PREVIEW DI KASIR:
                    </p>
                    <p class="text-lg font-black text-green-700">
                      Harga: {{ formatRupiah(discountPrice) }}
                    </p>
                    <p class="text-xs text-green-600 mt-1">
                      Diskon otomatis akan diterapkan saat produk di-scan
                    </p>
                  </div>
                </div>

                <!-- EMPTY STATE -->
                <div v-else class="text-center py-8">
                  <div
                    class="w-16 h-16 bg-gray-100 rounded-md mx-auto flex items-center justify-center mb-4"
                  >
                    <i class="pi pi-ban" style="font-size: 24px"></i>
                  </div>
                  <p class="text-gray-600 font-semibold">
                    Diskon tidak aktif untuk produk ini
                  </p>
                  <p class="text-sm text-gray-500 mt-1">
                    Aktifkan toggle di atas untuk menambah diskon
                  </p>
                </div>
              </div>

              <!-- FOOTER -->
              <div
                class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3"
              >
                <Button
                  v-if="isOnDiscount"
                  type="button"
                  variant="danger"
                  size="sm"
                  rounded="md"
                  class="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  @click="removeDiscount"
                >
                  Hapus Diskon
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  rounded="md"
                  class="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  @click="handleClose"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  rounded="md"
                  @click="handleSave"
                >
                  Simpan
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
