<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import JsBarcode from "jsbarcode";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const barcodeRef = ref(null);

const generateBarcode = async () => {
  if (props.product?.sku && barcodeRef.value) {
    await nextTick();
    JsBarcode(barcodeRef.value, props.product.sku, {
      format: "CODE128",
      width: 1.5,
      height: 40,
      displayValue: false,
      margin: 0,
      background: "transparent",
      lineColor: "#374151",
    });
  }
};

onMounted(() => {
  generateBarcode();
});

watch(
  () => props.product?.sku,
  () => {
    generateBarcode();
  }
);
</script>

<template>
  <div
    class="col-span-1 border border-neutral-100 bg-white rounded-lg overflow-hidden flex flex-col items-center p-4"
  >
    <div class="relative w-40 h-40 mb-4">
      <div
        v-if="product.image_url"
        class="rounded-lg border border-neutral-200 w-full h-full overflow-hidden bg-white"
      >
        <img
          :src="product.image_url"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-else
        class="rounded-lg border border-neutral-200 bg-neutral-100 text-gray-500 w-full h-full flex flex-col items-center justify-center font-bold"
      >
        <i class="pi pi-image mb-2" style="font-size: 32px"></i>
        <span class="text-xs">No Image</span>
      </div>
    </div>

    <h2 class="text-lg font-bold text-center leading-tight">
      {{ product.name }}
    </h2>
    <p
      class="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest text-center"
    >
      {{ product.sku }}
    </p>

    <div class="w-full mt-8 border-t border-neutral-100 pt-6">
      <div class="grid grid-cols-2 gap-4 text-center">
        <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
          <p class="text-xs text-gray-500 font-bold uppercase mb-1">
            Stok Saat Ini
          </p>
          <p
            class="text-xl font-bold"
            :class="product.stock <= 5 ? 'text-red-600' : 'text-green-700'"
          >
            {{ product.stock }}
          </p>
        </div>
        <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
          <p class="text-xs text-gray-500 font-bold uppercase mb-1">
            Status Diskon
          </p>
          <p
            class="text-sm font-bold mt-1"
            :class="
              product.is_on_discount ? 'text-orange-600' : 'text-gray-400'
            "
          >
            {{ product.is_on_discount ? 'AKTIF' : 'NON-AKTIF' }}
          </p>
        </div>
      </div>

      <!-- Barcode SKU -->
      <div
        class="mt-4 pt-4 border-t border-neutral-100 flex flex-col items-center"
      >
        <p class="text-xs text-gray-500 font-bold uppercase mb-3">
          Barcode SKU
        </p>
        <svg ref="barcodeRef"></svg>
      </div>
    </div>
  </div>
</template>
