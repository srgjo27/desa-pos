<script setup>
import { computed } from 'vue'
import { useAttrs } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  striped: {
    type: Boolean,
    default: true,
  },
  bordered: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingMessage: {
    type: String,
    default: 'Loading...',
  },
  emptyMessage: {
    type: String,
    default: 'Tidak ada data',
  },
  hoverable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['rowClick', 'rowAction'])
const attrs = useAttrs()

const cellPadding = computed(() => {
  const paddingMap = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base',
  }
  return paddingMap[props.size] || paddingMap.md
})

const rowClasses = computed(() => {
  return [
    'border-t border-gray-200',
    props.hoverable && 'hover:bg-gray-50 transition-colors cursor-pointer',
  ]
})
</script>

<template>
  <div class="w-full rounded-lg border border-gray-200 bg-white">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
        <p class="text-gray-500 text-sm">{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Table Wrapper with overflow -->
    <div v-else :class="attrs.class">
      <table class="w-full bg-white border-collapse">
      <!-- Header -->
      <thead class="bg-gray-50 border-b-2 border-gray-200">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              cellPadding,
              'text-left font-semibold',
              column.width,
              bordered && 'border-r border-gray-200',
            ]"
          >
            <slot :name="`header-${column.key}`" :column="column">
              {{ column.label }}
            </slot>
          </th>

          <!-- Actions header jika ada slot actions -->
          <th
            v-if="$slots.actions"
            :class="[cellPadding, 'text-center font-semibold w-24']"
          >
            Aksi
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody v-if="rows.length > 0">
        <tr
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
          :class="[
            rowClasses,
            striped && rowIndex % 2 === 1 && 'bg-gray-50',
            'relative',
          ]"
          @click="emit('rowClick', row)"
        >
          <td
            v-for="column in columns"
            :key="`${rowIndex}-${column.key}`"
            :class="[
              cellPadding,
              column.width,
              bordered && 'border-r border-gray-200',
            ]"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>

          <!-- Actions cell -->
          <td v-if="$slots.actions" :class="[cellPadding, 'text-center relative overflow-visible']">
            <slot name="actions" :row="row" :rowIndex="rowIndex" />
          </td>
        </tr>
      </tbody>

      <!-- Empty State -->
      <tbody v-else>
        <tr class="border-t border-gray-200">
          <td
            :colspan="columns.length + ($slots.actions ? 1 : 0)"
            class="px-4 py-8 text-center text-gray-500 text-sm"
          >
            {{ emptyMessage }}
          </td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>
