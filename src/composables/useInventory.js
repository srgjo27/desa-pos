import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { logError } from '../services/errorHandler'

export function useInventory() {
  const authStore = useAuthStore()

  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('v_product_stock')
        .select('*')
        .order('nilai_inventaris', { ascending: false })

      if (err) throw err

      products.value = data || []
    } catch (err) {
      error.value = 'Gagal mengambil data produk: ' + err.message
    } finally {
      loading.value = false
    }
  }

  async function addProduct({ sku, name, cost_price, price, stock, image_url }) {
    loading.value = true
    error.value = null
    try {
      if (!authStore.user?.id) error.value = 'Akses ditolak. Sesi tidak valid.'

      const { data: newProd, error: insertErr } = await supabase
        .from('products')
        .insert({
          sku, name, cost_price, price, stock, image_url: image_url || null
        })
        .select()
        .single()

      if (insertErr) console.error(insertErr)

      if (stock > 0) {
        const { error: logErr } = await supabase
          .from('stock_logs')
          .insert({
            product_id: newProd.id,
            user_id: authStore.user.id,
            type: 'RESTOCK',
            qty_change: stock,
            stock_before: 0,
            stock_after: stock,
            notes: 'Stok awal penambahan produk baru'
          })

        if (logErr) logError(logErr, { context: 'addProduct - log initial stock' })
      }

      products.value.push(newProd)

      return { success: true, data: newProd }
    } catch (err) {
      error.value = err.message
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function addStock(productId, qtyAdded, notes = '') {
    loading.value = true
    error.value = null
    try {
      if (!authStore.user?.id) error.value = 'Akses ditolak. Sesi tidak valid.'
      if (qtyAdded <= 0) error.value = 'Jumlah stok ditambahkan harus lebih dari 0.'

      const prodIndex = products.value.findIndex(p => p.id === productId)

      if (prodIndex === -1) error.value = 'Produk tidak ditemukan di memori.'

      const stockBefore = products.value[prodIndex].stock
      const stockAfter = stockBefore + qtyAdded

      const { error: updateErr } = await supabase
        .from('products')
        .update({ stock: stockAfter })
        .eq('id', productId)

      if (updateErr) throw updateErr

      const { error: logErr } = await supabase
        .from('stock_logs')
        .insert({
          product_id: productId,
          user_id: authStore.user.id,
          type: 'RESTOCK',
          qty_change: qtyAdded,
          stock_before: stockBefore,
          stock_after: stockAfter,
          notes: notes || 'Restock manual via Dashboard'
        })

      if (logErr) logError(logErr, { context: 'addStock - log stock addition' })

      products.value[prodIndex].stock = stockAfter

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(productId) {
    loading.value = true
    error.value = null
    try {
      const { error: delErr } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId)

      if (delErr) error.value = delErr

      products.value = products.value.filter(p => p.id !== productId)

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function editProduct({ id, sku, name, cost_price, price, stock, image_url, stockBefore }) {
    loading.value = true
    error.value = null
    try {
      if (!authStore.user?.id) error.value = 'Akses ditolak. Sesi tidak valid.'

      const stockAfter = stock
      const stockDifference = stockAfter - stockBefore

      const updatePayload = {
        name,
        cost_price,
        price,
        stock,
        image_url: image_url || null
      }
      
      const { data: updatedProd, error: updateErr } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (updateErr) console.log(updateErr)

      if (stockDifference !== 0) {
        const { error: logErr } = await supabase
          .from('stock_logs')
          .insert({
            product_id: id,
            user_id: authStore.user.id,
            type: 'ADJUSTMENT',
            qty_change: stockDifference,
            stock_before: stockBefore,
            stock_after: stockAfter,
            notes: `Adjustment stok via Edit Produk (${stockBefore} → ${stockAfter})`
          })

        if (logErr) logError(logErr, { context: 'editProduct - log stock adjustment' })
      }

      const prodIndex = products.value.findIndex(p => p.id === id)
      if (prodIndex !== -1) {
        products.value[prodIndex] = updatedProd
      }

      return { success: true, data: updatedProd }
    } catch (err) {
      error.value = err.message
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function updateDiscount(productId, { is_on_discount, discount_price }) {
    loading.value = true
    error.value = null
    try {
      const updatePayload = {
        is_on_discount: is_on_discount || false,
        discount_price: is_on_discount && discount_price ? discount_price : null
      }

      const { data: updatedProd, error: updateErr } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', productId)
        .select()
        .single()

      if (updateErr) throw updateErr

      const prodIndex = products.value.findIndex(p => p.id === productId)
      if (prodIndex !== -1) {
        products.value[prodIndex] = {
          ...products.value[prodIndex],
          is_on_discount: updatedProd.is_on_discount,
          discount_price: updatedProd.discount_price
        }
      }

      return { success: true, data: updatedProd }
    } catch (err) {
      error.value = err.message
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    addStock,
    deleteProduct,
    editProduct,
    updateDiscount
  }
}
