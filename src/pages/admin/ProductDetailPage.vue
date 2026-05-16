<script setup>
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useProductDetailPage } from "@/composables/inventory/useProductDetailPage";
import ProductProfileCard from "@/components/inventory/ProductProfileCard.vue";
import ProductPriceInfo from "@/components/inventory/ProductPriceInfo.vue";
import ProductStockHistory from "@/components/inventory/ProductStockHistory.vue";
import { ErrorState, LoadingState } from "@/components/ui";

const { product, stockLogs, loading, error, goBack } = useProductDetailPage();
</script>

<template>
  <AdminLayout
    title="Detail Produk"
    subtitle="Informasi rincian produk dan histori stok"
    activeTab="inventory"
  >
    <div class="mb-6">
      <button
        @click="goBack()"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
      >
        <i class="pi pi-arrow-left" style="font-size: 14px"></i>
        Kembali ke Inventory
      </button>
    </div>

    <!-- ERROR STATE -->
    <ErrorState
      v-if="error"
      title="Gagal Memuat Produk"
      :message="error"
      actionLabel="Lihat Daftar Semua Produk"
      @action="goBack()"
    />

    <!-- LOADING STATE -->
    <LoadingState
      v-else-if="loading"
      message="Sedang memuat data produk..."
    />

    <!-- CONTENT STATE -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProductProfileCard :product="product" />

      <div class="col-span-1 md:col-span-2 space-y-6">
        <ProductPriceInfo :product="product" />
        <ProductStockHistory :stockLogs="stockLogs" />
      </div>
    </div>
  </AdminLayout>
</template>
