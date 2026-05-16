<script setup>
import { formatRupiah } from "@/utils/format";

defineProps({
  product: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div
    class="bg-white border border-neutral-100 rounded-lg overflow-hidden"
  >
    <div class="border-b border-neutral-200 bg-neutral-50 p-4">
      <h3 class="font-bold">Informasi Harga</h3>
    </div>

    <div class="p-4">
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-gray-500 mb-1">
            Harga Modal
          </dt>
          <dd
            class="text-lg font-bold border-l-2 border-neutral-300 pl-3"
          >
            {{ formatRupiah(product.cost_price) }}
          </dd>
        </div>

        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-gray-500 mb-1">
            Harga Jual Normal
          </dt>
          <dd
            class="text-lg font-black text-blue-700 border-l-2 border-blue-500 pl-3"
          >
            {{ formatRupiah(product.price) }}
          </dd>
        </div>

        <div class="sm:col-span-1" v-if="product.is_on_discount">
          <dt class="text-sm font-medium text-gray-500 mb-1">
            Harga Diskon
          </dt>
          <dd
            class="text-lg font-black text-orange-600 border-l-2 border-orange-500 pl-3"
          >
            {{ formatRupiah(product.discount_price) }}
          </dd>
        </div>

        <div
          class="sm:col-span-1 border-t border-neutral-100 pt-4 mt-2 sm:mt-0 sm:border-t-0 sm:pt-0"
          :class="{
            'sm:col-span-2': !product.is_on_discount,
          }"
        >
          <dt class="text-sm font-medium text-gray-500 mb-1">
            Margin Keuntungan
          </dt>
          <dd class="text-sm font-bold flex items-center gap-2 mt-1">
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black bg-green-50 text-green-700 border border-green-200"
            >
              {{
                formatRupiah(
                  (product.is_on_discount
                    ? product.discount_price
                    : product.price) - product.cost_price
                )
              }}
            </span>
            <span class="text-gray-500 font-medium text-xs">/ item</span>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
