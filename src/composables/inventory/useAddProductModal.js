import { computed, ref, watch } from 'vue'
import { useInventory } from '@/composables/inventory/useInventory'
import { useValidation } from '@/composables/useValidation'
import { uploadProductImage, validateImageFile } from '@/services/imageService'

export function useAddProductModal(isOpenRef, onClose) {
    const invStore = useInventory()
    const { validateProductForm } = useValidation()

    const newProduct = ref({
        sku: '',
        name: '',
        cost_price: 0,
        price: 0,
        stock: 0,
    })

    const imageFile = ref(null)
    const imagePreview = ref(null)
    const formErrors = ref({})
    const isUploading = ref(false)

    const isSaving = computed(() => isUploading.value || invStore.loading.value)

    function resetState() {
        newProduct.value = { sku: '', name: '', cost_price: 0, price: 0, stock: 0 }
        imageFile.value = null
        imagePreview.value = null
        formErrors.value = {}
        isUploading.value = false
    }

    watch(isOpenRef, (isOpen) => {
        if (isOpen) resetState()
    })

    function validateForm() {
        const validation = validateProductForm(newProduct.value)
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
            imagePreview.value = null
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

    async function submitAddProduct() {
        if (!validateForm()) return

        isUploading.value = true

        try {
            let imageUrl = null

            if (imageFile.value) {
                const uploadResult = await uploadProductImage(imageFile.value, newProduct.value.name)
                if (!uploadResult.success) {
                    formErrors.value.image = uploadResult.error
                    return
                }
                imageUrl = uploadResult.publicUrl
            }

            const res = await invStore.addProduct({
                ...newProduct.value,
                image_url: imageUrl,
            })

            if (res?.success) {
                if (typeof onClose === 'function') onClose()
                return
            }

            formErrors.value.submit = res?.error || invStore.error.value || 'Terjadi kesalahan saat menambahkan produk.'
        } catch (err) {
            formErrors.value.submit = err.message || 'Terjadi kesalahan saat menambahkan produk.'
        } finally {
            isUploading.value = false
        }
    }

    return {
        newProduct,
        imageFile,
        imagePreview,
        formErrors,
        isUploading,
        isSaving,
        onImageSelected,
        clearImage,
        submitAddProduct,
    }
}
