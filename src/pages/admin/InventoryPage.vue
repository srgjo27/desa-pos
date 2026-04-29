<script setup>
import AddProductModal from '@/components/inventory/AddProductModal.vue'
import EditProductModal from '@/components/inventory/EditProductModal.vue'
import AddStockModal from '@/components/inventory/AddStockModal.vue'
import EditDiscountModal from '@/components/inventory/EditDiscountModal.vue'
import InventoryActionsBar from '@/components/inventory/InventoryActionsBar.vue'
import InventoryMetrics from '@/components/inventory/InventoryMetrics.vue'
import InventoryTable from '@/components/inventory/InventoryTable.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useInventoryPage } from '@/composables/inventory/useInventoryPage'

const {
  searchQuery,
  filteredProducts,
  totalAssetValue,
  totalProducts,
  isInventoryLoading,
  isModalProductOpen,
  isModalEditOpen,
  isModalStockOpen,
  isModalDiscountOpen,
  selectedProduct,
  isExporting,
  openProductModal,
  openEditModal,
  openStockModal,
  openDiscountModal,
  handleDelete,
  handleAddStock,
  handleEditProduct,
  handleSaveDiscount,
  handleExportInventoryPDF,
} = useInventoryPage()
</script>

<template>
  <AdminLayout title="Katalog Inventaris" subtitle="BUMDes DesaPOS - Mode Admin" activeTab="inventory">
    <InventoryMetrics :totalProducts="totalProducts" :totalAssetValue="totalAssetValue" />

    <InventoryActionsBar
      v-model="searchQuery"
      :isExporting="isExporting"
      @export="handleExportInventoryPDF"
      @add="openProductModal"
    />

    <InventoryTable
      :rows="filteredProducts"
      :loading="isInventoryLoading"
      @edit="openEditModal"
      @stock="openStockModal"
      @discount="openDiscountModal"
      @delete="handleDelete"
    />

    <!-- Modals -->
    <AddProductModal :isOpen="isModalProductOpen" @close="isModalProductOpen = false" />

    <EditProductModal :isOpen="isModalEditOpen" :product="selectedProduct" @close="isModalEditOpen = false"
      @updated="handleEditProduct" />

    <AddStockModal :isOpen="isModalStockOpen" :product="selectedProduct" :isLoading="isInventoryLoading"
      @close="isModalStockOpen = false" @confirm="handleAddStock" />

    <EditDiscountModal :isOpen="isModalDiscountOpen" :product="selectedProduct" @close="isModalDiscountOpen = false"
      @save="handleSaveDiscount" />

  </AdminLayout>
</template>
