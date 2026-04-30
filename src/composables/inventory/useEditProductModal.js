import { computed, ref, unref, watch } from 'vue'
import { useInventory } from '@/composables/inventory/useInventory'
import { useValidation } from '@/composables/useValidation'
import { validateImageFile, updateProductImage } from '@/services/imageService'

export function useEditProductModal(isOpenRef, productRef, { onClose, onUpdated } = {}) {
    const invStore = useInventory()
    const { validateProductForm } = useValidation()

    const editProduct = ref({
        id: null,
        sku: '',
        name: '',
        cost_price: 0,
        price: 0,
        stock: 0,
        image_url: null,
    })

    const imageFile = ref(null)
    const imagePreview = ref(null)
    const formErrors = ref({})
    const isUploading = ref(false)

    const isSaving = computed(() => isUploading.value || invStore.loading.value)

    function resetState(product) {
        if (!product) {
            editProduct.value = {
                id: null,
                sku: '',
                name: '',
                cost_price: 0,
                price: 0,
                stock: 0,
                image_url: null,
            }
            imageFile.value = null
            imagePreview.value = null
            formErrors.value = {}
            isUploading.value = false
            return
        }

        editProduct.value = {
            id: product.id,
            sku: product.sku,
            name: product.name,
            cost_price: product.cost_price,
            price: product.price,
            stock: product.stock,
            image_url: product.image_url,
        }
        imageFile.value = null
        imagePreview.value = product.image_url ? product.image_url : null
        formErrors.value = {}
        isUploading.value = false
    }

    watch([isOpenRef, productRef], ([isOpen, product]) => {
        if (isOpen && product) resetState(product)
    })

    function validateForm() {
        const validation = validateProductForm(editProduct.value)
        formErrors.value = validation.errors
        return validation.isValid
    }

    function onImageSelected(e) {
        const file = e.target.files?.[0]
        if (!file) return

        const validation = validateImageFile(file)
        if (!validation.isValid) {
            formErrors.value.image = validation.error
            imageFile.value = null
            return
        }

        imageFile.value = file
        formErrors.value.image = null

        const reader = new FileReader()
        reader.onload = (event) => {
            imagePreview.value = event.target.result
        }
        reader.readAsDataURL(file)
    }

    function clearImage() {
        imageFile.value = null
        imagePreview.value = null
        formErrors.value.image = null
    }

    async function submitEditProduct() {
        if (!validateForm()) return

        const product = unref(productRef)
        if (!product) return

        isUploading.value = true

        try {
            let imageUrl = editProduct.value.image_url

            if (imageFile.value) {
                const updateResult = await updateProductImage(
                    imageFile.value,
                    editProduct.value.image_url,
                    editProduct.value.name
                )
                if (!updateResult.success) {
                    formErrors.value.image = updateResult.error
                    return
                }

                imageUrl = updateResult.publicUrl
            }

            const res = await invStore.editProduct({
                id: editProduct.value.id,
                sku: editProduct.value.sku,
                name: editProduct.value.name,
                cost_price: editProduct.value.cost_price,
                price: editProduct.value.price,
                stock: editProduct.value.stock,
                image_url: imageUrl,
                stockBefore: product.stock,
            })

            if (res?.success) {
                if (typeof onUpdated === 'function') onUpdated()
                if (typeof onClose === 'function') onClose()
                return
            }

            formErrors.value.submit = res?.error || invStore.error.value || 'Terjadi kesalahan saat memperbarui produk.'
        } catch (err) {
            formErrors.value.submit = err.message || 'Terjadi kesalahan saat memperbarui produk.'
        } finally {
            isUploading.value = false
        }
    }

    return {
        editProduct,
        imageFile,
        imagePreview,
        formErrors,
        isUploading,
        isSaving,
        onImageSelected,
        clearImage,
        submitEditProduct,
    }
}
