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


  async function processCheckout({ amountPaid, paymentMethod = 'CASH', customerPhone = '', notes = '' }) {
    loading.value = true
    error.value = null

    try {
      if (!authStore.user?.id) {
        throw new DesaPOSError(ERROR_CODES.AUTH_UNAUTHORIZED, 'Sesi kasir tidak valid. Silakan login ulang.')
      }
      if (!shiftStore.shiftId) {
        throw new DesaPOSError(ERROR_CODES.CHECKOUT_STOCK_ERROR, 'Tidak ada shift kasir yang aktif.')
      }
      if (cartStore.items.length === 0) {
        throw new DesaPOSError(ERROR_CODES.CART_EMPTY, 'Keranjang belanja kosong.')
      }

      const totalAmount = cartStore.totalAmount
      const discountAmount = 0
      const grandTotal = totalAmount - discountAmount

      if (amountPaid < grandTotal && paymentMethod === 'CASH') {
        throw new DesaPOSError(
          ERROR_CODES.CHECKOUT_INSUFFICIENT_PAYMENT,
          'Uang pembayaran kurang dari total belanja.'
        )
      }

      const changeAmount = paymentMethod === 'CASH' ? amountPaid - grandTotal : 0

      const productIds = cartStore.items.map(item => item.product_id)
      const { data: productMasterData, error: productFetchError } = await supabase
        .from('products')
        .select('id, cost_price')
        .in('id', productIds)

      if (productFetchError) {
        throw new DesaPOSError(
          ERROR_CODES.DB_ERROR,
          'Gagal mengambil data harga produk untuk snapshot transaksi.'
        )
      }

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

      if (saleError) {
        throw new DesaPOSError(ERROR_CODES.DB_ERROR, 'Gagal mencatat transaksi utama.')
      }

      const saleItemsData = cartStore.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        qty: item.qty,
        price_at_sale: item.price_at_sale || item.price,
        cost_at_sale: costMap.get(item.product_id) || 0,
        discount_amount: 0
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData)

      if (itemsError) {
        await supabase.from('sales').delete().eq('id', saleData.id)
        throw new DesaPOSError(ERROR_CODES.DB_ERROR, 'Gagal mencatat rincian barang. Transaksi dibatalkan.')
      }

      const receiptData = {
        saleId: saleData.id,
        createdAt: saleData.created_at,
        cashierName: authStore.user.name,
        items: cartStore.items.map(item => ({
          ...item,
          costAtSale: costMap.get(item.product_id) || 0
        })),
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
      if (err instanceof DesaPOSError) {
        error.value = getErrorMessage(err.code)
        logError(err, { context: 'processCheckout', errorCode: err.code })
      } else {
        error.value = err.message || 'Terjadi kesalahan sistem saat memproses transaksi.'
        logError(err, { context: 'processCheckout' })
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
