import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useShiftStore } from '@/stores/shiftStore'
import { useCartStore } from '@/stores/cartStore'

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
      if (!authStore.user?.id) throw new Error('Sesi kasir tidak valid. Silakan login ulang.')
      if (!shiftStore.shiftId) throw new Error('Tidak ada shift kasir yang aktif.')
      if (cartStore.items.length === 0) throw new Error('Keranjang belanja kosong.')

      const totalAmount = cartStore.totalAmount
      const discountAmount = 0
      const grandTotal = totalAmount - discountAmount

      if (amountPaid < grandTotal && paymentMethod === 'CASH') {
        throw new Error('Uang pembayaran kurang dari total belanja.')
      }

      const changeAmount = paymentMethod === 'CASH' ? amountPaid - grandTotal : 0

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
          notes: notes || null
        })
        .select()
        .single()

      if (saleError) {
        console.error('[DesaPOS] Log insert sales:', saleError)
        throw new Error('Gagal mencatat transaksi utama.')
      }

      const saleItemsData = cartStore.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        qty: item.qty,
        price_at_sale: item.price,
        cost_at_sale: 0,
        discount_amount: 0
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData)

      if (itemsError) {
        console.error('[DesaPOS] Log insert sale_items:', itemsError)
        await supabase.from('sales').delete().eq('id', saleData.id)
        throw new Error('Gagal mencatat rincian barang. Transaksi dibatalkan.')
      }

      const receiptData = {
        saleId: saleData.id,
        createdAt: saleData.created_at,
        cashierName: authStore.user.name,
        items: [...cartStore.items],
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
      console.error('[DesaPOS] Checkout Error:', err)
      error.value = err.message || 'Terjadi kesalahan sistem saat memproses transaksi.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return { processCheckout, loading, error }
}
