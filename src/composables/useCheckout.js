import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useShiftStore } from '@/stores/shiftStore'
import { useCartStore } from '@/stores/cartStore'
import { DesaPOSError, ERROR_CODES, logError, getErrorMessage } from '@/services/errorHandler'

export function useCheckout() {
  const authStore = useAuthStore()
  const shiftStore = useShiftStore()
  const cartStore = useCartStore()

  const loading = ref(false)
  const error = ref(null)


  async function processCheckout({ 
    amountPaid, 
    paymentMethod = 'CASH',
    transactionDiscount = 0,  // ✅ BARU
    customerPhone = '', 
    notes = '' 
  }) {
    loading.value = true
    error.value = null

    try {
      if (!authStore.user?.id) error.value = getErrorMessage(ERROR_CODES.AUTH_UNAUTHORIZED)
      if (!shiftStore.shiftId) error.value = getErrorMessage(ERROR_CODES.CHECKOUT_STOCK_ERROR)
      if (cartStore.items.length === 0) error.value = getErrorMessage(ERROR_CODES.CART_EMPTY)
      
      // ✅ UBAH: Gunakan subtotalAfterItemDiscount
      const totalAmount = cartStore.subtotalAfterItemDiscount
      const discountAmount = Math.min(
        transactionDiscount, 
        totalAmount  // Ga boleh diskon > subtotal
      )
      const grandTotal = totalAmount - discountAmount

      if (amountPaid < grandTotal && paymentMethod === 'CASH') error.value = getErrorMessage(ERROR_CODES.CHECKOUT_INSUFFICIENT_PAYMENT)
      
      const changeAmount = paymentMethod === 'CASH' ? amountPaid - grandTotal : 0
      const productIds = cartStore.items.map(item => item.product_id)

      const { data: productMasterData, error: productFetchError } = await supabase
        .from('products')
        .select('id, cost_price')
        .in('id', productIds)

      if (productFetchError) error.value = getErrorMessage(ERROR_CODES.DB_ERROR)
      
      const costMap = new Map(productMasterData.map(p => [p.id, p.cost_price]))

      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: authStore.user.id,
          shift_id: shiftStore.shiftId,
          total_amount: totalAmount,
          discount_amount: discountAmount,  // ✅ UBAH: Simpan diskon transaksional
          grand_total: grandTotal,
          amount_paid: amountPaid,
          change_amount: changeAmount,
          payment_method: paymentMethod,
          customer_phone: customerPhone || null,
          notes: notes || null,
          sync_status: 'SYNCED'
        })
        .select()
        .single()

      if (saleError) error.value = getErrorMessage(ERROR_CODES.DB_ERROR)

      // ✅ UBAH: Simpan total diskon per item
      const saleItemsData = cartStore.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        qty: item.qty,
        price_at_sale: item.price_at_sale || item.price,
        cost_at_sale: costMap.get(item.product_id) || 0,
        discount_amount: (item.itemDiscount || 0) * item.qty  // ✅ UBAH: Diskon per item
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData)

      if (itemsError) {
        await supabase.from('sales').delete().eq('id', saleData.id)
        error.value = getErrorMessage(ERROR_CODES.DB_ERROR)
      }

      // ✅ UBAH: Include diskon details di receipt
      const receiptData = {
        saleId: saleData.id,
        createdAt: saleData.created_at,
        cashierName: authStore.user.name,
        items: cartStore.items.map(item => ({
          ...item,
          costAtSale: costMap.get(item.product_id) || 0
        })),
        subtotalBeforeDiscount: cartStore.subtotalBeforeDiscount,  // ✅ BARU
        totalItemDiscounts: cartStore.totalItemDiscounts,           // ✅ BARU
        totalAmount,
        discountAmount,
        grandTotal,
        amountPaid,
        changeAmount,
        paymentMethod,
        customerPhone
      }

      cartStore.clearCart()

      return { success: true, saleId: saleData.id, receiptData }
    } catch (err) {
      error.value = err
      logError(err, { context: 'checkout' })
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return {
    processCheckout,
    loading,
    error
  }
}
