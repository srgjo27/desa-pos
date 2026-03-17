import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'

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
      console.error('[Inventory] Fetch error:', err)
      error.value = 'Gagal mengambil data produk: ' + err.message
    } finally {
      loading.value = false
    }
  }

  async function addProduct({ sku, name, cost_price, price, stock, image_url }) {
    loading.value = true
    error.value = null
    try {
      if (!authStore.user?.id) throw new Error('Akses ditolak. Sesi tidak valid.')

      const { data: newProd, error: insertErr } = await supabase
        .from('products')
        .insert({
          sku, name, cost_price, price, stock, image_url: image_url || null
        })
        .select()
        .single()

      if (insertErr) {
        if (insertErr.code === '23505') throw new Error('SKU sudah digunakan oleh produk lain.')
        throw insertErr
      }

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

        if (logErr) console.error('[Inventory] Gagal catat log stok awal:', logErr)
      }

      products.value.push(newProd)

      return { success: true, data: newProd }
    } catch (err) {
      console.error('[Inventory] Add Product error:', err)
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
      if (!authStore.user?.id) throw new Error('Akses ditolak. Sesi tidak valid.')
      if (qtyAdded <= 0) throw new Error('Jumlah stok ditambahkan harus lebih dari 0.')

      const prodIndex = products.value.findIndex(p => p.id === productId)
      if (prodIndex === -1) throw new Error('Produk tidak ditemukan di memori.')

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

      if (logErr) console.error('[Inventory] Gagal catat log restock:', logErr)

      products.value[prodIndex].stock = stockAfter

      return { success: true }
    } catch (err) {
      console.error('[Inventory] Add Stock error:', err)
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

      if (delErr) throw delErr

      products.value = products.value.filter(p => p.id !== productId)

      return { success: true }
    } catch (err) {
      console.error('[Inventory] Delete Product error:', err)
      error.value = 'Gagal menghapus produk: ' + err.message
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
    deleteProduct
  }
}
