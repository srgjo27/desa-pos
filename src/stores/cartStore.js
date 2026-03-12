import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([]) // { product_id, name, price, qty, image_url }

  // Getters
  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.qty, 0)
  )

  const totalAmount = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.qty, 0)
  )

  // Actions
  function addItem(product) {
    const existing = items.value.find((i) => i.product_id === product.id)
    if (existing) {
      existing.qty++
    } else {
      items.value.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        price_at_sale: product.price, // penting: tangkap harga saat ini
        qty: 1,
        image_url: product.image_url || null,
      })
    }
  }

  function removeItem(productId) {
    const idx = items.value.findIndex((i) => i.product_id === productId)
    if (idx !== -1) {
      if (items.value[idx].qty > 1) {
        items.value[idx].qty--
      } else {
        items.value.splice(idx, 1)
      }
    }
  }

  function deleteItem(productId) {
    items.value = items.value.filter((i) => i.product_id !== productId)
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    totalItems,
    totalAmount,
    addItem,
    removeItem,
    deleteItem,
    clearCart,
  }
}, {
  persist: {
    key: 'desa-pos-cart',
    storage: localStorage,
  },
})
