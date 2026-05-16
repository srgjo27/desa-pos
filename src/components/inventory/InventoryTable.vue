<script setup>
import { toRef } from "vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { Table } from "@/components/ui";
import { useInventoryTable } from "@/composables/inventory/useInventoryTable";
import { formatRupiah } from "@/utils/format";

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["detail", "edit", "stock", "discount", "delete"]);

const rowsRef = toRef(props, "rows");
const { columns, sortedRows, toggleSort, getSortIcon } =
  useInventoryTable(rowsRef);
</script>

<template>
  <Table
    :columns="columns"
    :rows="sortedRows"
    :loading="loading"
    size="md"
    :striped="true"
    :bordered="true"
    :hoverable="true"
    emptyMessage="Tidak ada barang yang ditemukan."
  >
    <template
      v-for="col in columns"
      :key="`header-${col.key}`"
      #[`header-${col.key}`]
    >
      <button
        type="button"
        class="inline-flex items-center gap-2 text-left font-semibold text-gray-700 hover:text-gray-900"
        @click="toggleSort(col.key)"
      >
        <span>{{ col.label }}</span>
        <i :class="getSortIcon(col.key)" style="font-size: 12px"></i>
      </button>
    </template>

    <template
      v-for="col in columns"
      :key="col.key"
      #[`cell-${col.key}`]="{ value, row }"
    >
      <span v-if="col.key === 'sku'" class="font-mono text-xs text-gray-400">{{
        value
      }}</span>
      <span v-else-if="col.key === 'name'" class="font-semibold">{{
        value
      }}</span>
      <span
        v-else-if="col.key === 'cost_price'"
        class="font-mono text-xs text-gray-500"
      >
        {{ formatRupiah(value) }}
      </span>
      <span
        v-else-if="col.key === 'price' || col.key === 'margin'"
        class="font-mono text-sm font-semibold"
      >
        {{ formatRupiah(value) }}
      </span>
      <span v-else-if="col.key === 'discount'">
        <span
          v-if="row.is_on_discount && row.discount_price"
          class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-bold text-xs bg-orange-50 text-orange-700 border border-orange-200"
        >
          {{ formatRupiah(row.price - row.discount_price) }}
        </span>
        <span v-else class="text-xs text-gray-400">-</span>
      </span>
      <span v-else-if="col.key === 'stock'">
        <span
          class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-bold text-xs border"
          :class="
            value <= 5
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-gray-50 border-gray-200'
          "
        >
          {{ value }}
        </span>
      </span>
      <span v-else>{{ value }}</span>
    </template>

    <template #actions="{ row }">
      <Menu as="div" class="relative inline-block text-left">
        <MenuButton
          class="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 focus:outline-none transition-colors"
          title="Lebih banyak aksi"
        >
          <i class="pi pi-ellipsis-v" style="font-size: 12px"></i>
        </MenuButton>

        <MenuItems
          class="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg z-50 focus:outline-none shadow-lg"
        >
          <MenuItem @click="emit('detail', row)">
            <button
              class="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 border-b border-gray-100 transition-colors first:rounded-t-lg"
            >
              <i class="pi pi-eye" style="font-size: 12px"></i>
              <span class="text-sm font-medium">Detail Produk</span>
            </button>
          </MenuItem>

          <MenuItem @click="emit('edit', row)">
            <button
              class="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50 border-b border-gray-100 transition-colors"
            >
              <i class="pi pi-pencil" style="font-size: 12px"></i>
              <span class="text-sm font-medium">Edit Data</span>
            </button>
          </MenuItem>

          <MenuItem @click="emit('stock', row)">
            <button
              class="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-amber-50 border-b border-gray-100 transition-colors"
            >
              <i class="pi pi-plus" style="font-size: 12px"></i>
              <span class="text-sm font-medium">Tambah Stok</span>
            </button>
          </MenuItem>

          <MenuItem @click="emit('discount', row)">
            <button
              class="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-orange-50 border-b border-gray-100 transition-colors"
            >
              <i class="pi pi-tag" style="font-size: 12px"></i>
              <span class="text-sm font-medium">Atur Diskon</span>
            </button>
          </MenuItem>

          <MenuItem @click="emit('delete', row)">
            <button
              class="w-full text-left px-4 py-2.5 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg"
            >
              <i class="pi pi-trash" style="font-size: 12px"></i>
              <span class="text-sm font-medium">Hapus</span>
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
    </template>
  </Table>
</template>
