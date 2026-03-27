import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useShiftStore } from '@/stores/shiftStore'
import { useCartStore } from '@/stores/cartStore'
import { DesaPOSError, ERROR_CODES, logError, getErrorMessage } from '@/services/errorHandler'
import { logActivity, ACTIVITY_TYPES } from '@/services/activityLogService'

export function useCheckout() {
  const authStore = useAuthStore()
  const shiftStore = useShiftStore()
  const cartStore = useCartStore()

  const loading = ref(false)
  const error = ref(null)


  async function processCheckout({ 
    amountPaid, 
    paymentMethod = 'CASH',
    transactionDiscount = 0,
    customerPhone = '', 
    notes = '' 
  }) {
    loading.value = true
    error.value = null

    try {
      if (!authStore.user?.id) error.value = getErrorMessage(ERROR_CODES.AUTH_UNAUTHORIZED)
      if (!shiftStore.shiftId) error.value = getErrorMessage(ERROR_CODES.CHECKOUT_STOCK_ERROR)
      if (cartStore.items.length === 0) error.value = getErrorMessage(ERROR_CODES.CART_EMPTY)
      
      const totalAmount = cartStore.subtotalAfterItemDiscount
      const discountAmount = Math.min(
        transactionDiscount, 
        totalAmount
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
          discount_amount: discountAmount,
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

      const saleItemsData = cartStore.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        qty: item.qty,
        price_at_sale: item.price_at_sale || item.price,
        cost_at_sale: costMap.get(item.product_id) || 0,
        discount_amount: (item.itemDiscount || 0) * item.qty
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData)

      if (itemsError) {
        await supabase.from('sales').delete().eq('id', saleData.id)
        error.value = getErrorMessage(ERROR_CODES.DB_ERROR)
      }

      const receiptData = {
        saleId: saleData.id,
        createdAt: saleData.created_at,
        cashierName: authStore.user.name,
        items: cartStore.items.map(item => ({
          ...item,
          costAtSale: costMap.get(item.product_id) || 0
        })),
        subtotalBeforeDiscount: cartStore.subtotalBeforeDiscount,
        totalItemDiscounts: cartStore.totalItemDiscounts,
        totalAmount,
        discountAmount,
        grandTotal,
        amountPaid,
        changeAmount,
        paymentMethod,
        customerPhone
      }

      cartStore.clearCart()

      await logActivity({
        activityType: ACTIVITY_TYPES.POS_CHECKOUT,
        userId: authStore.user.id,
        description: `Sale transaction completed - ${cartStore.items.length} items, Total: Rp${grandTotal.toLocaleString('id-ID')}`,
        metadata: {
          saleId: saleData.id,
          shiftId: shiftStore.shiftId,
          itemCount: cartStore.items.length,
          subtotal: cartStore.subtotalAfterItemDiscount,
          transactionDiscount: discountAmount,
          grandTotal,
          paymentMethod,
          cashierName: authStore.user.name,
          customerPhone: customerPhone || 'N/A',
          timestamp: new Date().toISOString()
        }
      })

      return { success: true, saleId: saleData.id, receiptData }
    } catch (err) {
      error.value = err
      logError(err, { context: 'checkout' })
      
      if (authStore.user?.id) {
        await logActivity({
          activityType: ACTIVITY_TYPES.ERROR_OCCURRED,
          userId: authStore.user.id,
          description: `Checkout error: ${err?.message || 'Unknown error'}`,
          metadata: {
            errorMessage: err?.message,
            errorContext: 'POS_CHECKOUT',
            timestamp: new Date().toISOString()
          }
        })
      }
      
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
