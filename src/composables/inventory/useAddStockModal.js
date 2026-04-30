import { ref, unref, watch } from 'vue'
import { useValidation } from '@/composables/useValidation'

export function useAddStockModal(isOpenRef, productRef, onConfirm) {
    const { validateQuantity } = useValidation()

    const stockToAdd = ref(1)
    const error = ref(null)

    watch(isOpenRef, (isOpen) => {
        if (isOpen) {
            stockToAdd.value = 1
            error.value = null
        }
    })

    function validateInput() {
        const validationError = validateQuantity(stockToAdd.value, 1, 100000)
        if (validationError) {
            error.value = validationError
            return false
        }
        error.value = null
        return true
    }

    function handleStockInput(value) {
        stockToAdd.value = Number(value || 0)
    }

    function submitAddStock() {
        const product = unref(productRef)
        if (!product || !validateInput()) return

        if (typeof onConfirm === 'function') {
            onConfirm({ productId: product.id, qty: stockToAdd.value })
        }
    }

    return {
        stockToAdd,
        error,
        validateInput,
        handleStockInput,
        submitAddStock,
    }
}
