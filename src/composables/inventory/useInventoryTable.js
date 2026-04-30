import { computed, ref, unref } from 'vue'

export function useInventoryTable(rowsRef) {
    const sortKey = ref('')
    const sortOrder = ref('asc')

    const columns = computed(() => [
        { key: 'sku', label: 'SKU', width: 'w-32' },
        { key: 'name', label: 'Nama Barang' },
        { key: 'cost_price', label: 'Harga Modal', width: 'w-28' },
        { key: 'price', label: 'Harga Jual', width: 'w-28' },
        { key: 'margin', label: 'Margin', width: 'w-24' },
        { key: 'discount', label: 'Diskon', width: 'w-20' },
        { key: 'stock', label: 'Sisa Stok', width: 'w-24' },
    ])

    function toggleSort(key) {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
            return
        }

        sortKey.value = key
        sortOrder.value = 'asc'
    }

    function getSortValue(row, key) {
        if (key === 'discount') {
            if (!row.is_on_discount || !row.discount_price) return 0
            return Number(row.price || 0) - Number(row.discount_price || 0)
        }

        if (key === 'margin') {
            if (row.margin !== undefined && row.margin !== null) return Number(row.margin) || 0
            return Number(row.price || 0) - Number(row.cost_price || 0)
        }

        if (key === 'cost_price' || key === 'price' || key === 'stock') {
            return Number(row[key] || 0)
        }

        return row[key] || ''
    }

    function getSortIcon(key) {
        if (sortKey.value !== key) return 'pi pi-sort-alt'
        return sortOrder.value === 'asc' ? 'pi pi-sort-amount-up-alt' : 'pi pi-sort-amount-down'
    }

    const sortedRows = computed(() => {
        const rows = unref(rowsRef)
        if (!Array.isArray(rows)) return []
        if (!sortKey.value) return rows

        const direction = sortOrder.value === 'asc' ? 1 : -1
        return [...rows].sort((left, right) => {
            const leftValue = getSortValue(left, sortKey.value)
            const rightValue = getSortValue(right, sortKey.value)

            if (leftValue === rightValue) return 0
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return (leftValue - rightValue) * direction
            }

            return String(leftValue)
                .localeCompare(String(rightValue), 'id', { numeric: true, sensitivity: 'base' }) * direction
        })
    })

    return {
        columns,
        sortedRows,
        sortKey,
        sortOrder,
        toggleSort,
        getSortIcon,
    }
}
