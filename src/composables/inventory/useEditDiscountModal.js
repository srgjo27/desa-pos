import { computed, ref, unref, watch } from 'vue'

export function useEditDiscountModal(isOpenRef, productRef, { onClose, onSave } = {}) {
    const isOnDiscount = ref(false)
    const discountPriceRaw = ref('')
    const discountPercentRaw = ref('')

    watch([isOpenRef, productRef], ([isOpen, product]) => {
        if (!isOpen) return
        if (product) {
            isOnDiscount.value = product.is_on_discount || false
            discountPriceRaw.value = product.discount_price ? String(product.discount_price) : ''
            discountPercentRaw.value = ''
            return
        }

        isOnDiscount.value = false
        discountPriceRaw.value = ''
        discountPercentRaw.value = ''
    }, { immediate: true })

    const normalPrice = computed(() => {
        const product = unref(productRef)
        return product?.price || 0
    })

    const discountPrice = computed(() => Number(discountPriceRaw.value) || 0)
    const discountAmount = computed(() => normalPrice.value - discountPrice.value)
    const discountPercent = computed(() => {
        if (normalPrice.value === 0) return 0
        return Math.round((discountAmount.value / normalPrice.value) * 100)
    })

    function onDiscountPriceInput(value) {
        const raw = String(value || '').replace(/\D/g, '')
        discountPriceRaw.value = raw
    }

    function setDiscountByPercent(percent) {
        if (percent < 0 || percent > 100) return
        const discounted = Math.round(normalPrice.value * ((100 - percent) / 100))
        discountPercentRaw.value = percent.toString()
        discountPriceRaw.value = discounted.toString()
    }

    function onDiscountPercentInput(value) {
        const raw = String(value || '').replace(/\D/g, '')
        if (raw === '') {
            discountPercentRaw.value = ''
        } else {
            const percent = Math.min(100, Number(raw))
            discountPercentRaw.value = percent.toString()
            setDiscountByPercent(percent)
        }
    }

    function removeDiscount() {
        isOnDiscount.value = false
        discountPriceRaw.value = ''
        discountPercentRaw.value = ''
    }

    function handleSave() {
        if (isOnDiscount.value && (!discountPrice.value || discountPrice.value >= normalPrice.value)) {
            alert('Harga diskon harus lebih rendah dari harga normal!')
            return
        }

        if (typeof onSave === 'function') {
            onSave({
                is_on_discount: isOnDiscount.value,
                discount_price: isOnDiscount.value ? discountPrice.value : null,
            })
        }
    }

    function handleClose() {
        if (typeof onClose === 'function') onClose()
    }

    return {
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
    }
}
