import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.qty, 0)
  )

  const subtotalBeforeDiscount = computed(() =>
    items.value.reduce((sum, item) => sum + (item.price * item.qty), 0)
  )

  const totalItemDiscounts = computed(() =>
    items.value.reduce((sum, item) => sum + ((item.itemDiscount || 0) * item.qty), 0)
  )

  const subtotalAfterItemDiscount = computed(() =>
    subtotalBeforeDiscount.value - totalItemDiscounts.value
  )

  const transactionDiscount = ref(0)

  const totalAmount = computed(() =>
    Math.max(0, subtotalAfterItemDiscount.value - transactionDiscount.value)
  )

  function addItem(product) {
    const existing = items.value.find((i) => i.product_id === product.id)
    if (existing) {
      existing.qty++
    } else {
      const itemDiscount = product.is_on_discount && product.discount_price
        ? (product.price - product.discount_price)
        : 0

      items.value.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        price_at_sale: product.price,
        qty: 1,
        image_url: product.image_url || null,
        discountPrice: product.discount_price || null,
        isOnDiscount: product.is_on_discount || false,
        itemDiscount: itemDiscount,
      })
    }
  }

  function setItemDiscount(productId, discountAmount) {
    const item = items.value.find((i) => i.product_id === productId)
    if (item) {
      item.itemDiscount = Math.max(0, discountAmount)
    }
  }

  function setTransactionDiscount(amount) {
    transactionDiscount.value = Math.max(0, amount)
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
    transactionDiscount.value = 0
  }

  return {
    items,
    totalItems,
    subtotalBeforeDiscount,
    subtotalAfterItemDiscount,
    totalItemDiscounts,
    transactionDiscount,
    totalAmount,
    addItem,
    removeItem,
    deleteItem,
    clearCart,
    setItemDiscount,
    setTransactionDiscount,
  }
}, {
  persist: {
    key: 'desa-pos-cart',
    storage: localStorage,
  },
})
