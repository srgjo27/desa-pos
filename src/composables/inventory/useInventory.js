import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { logError } from '@/services/errorHandler'
import { logActivity, ACTIVITY_TYPES } from '@/services/activityLogService'

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
      error.value = err.message
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

      if (insertErr) return

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

        if (logErr) return
      }

      products.value.push(newProd)

      await logActivity({
        activityType: ACTIVITY_TYPES.INVENTORY_ADD,
        userId: authStore.user.id,
        description: `New product added: ${name} (SKU: ${sku})`,
        metadata: {
          productId: newProd.id,
          productName: name,
          productSku: sku,
          costPrice: cost_price,
          sellingPrice: price,
          initialStock: stock,
          timestamp: new Date().toISOString()
        }
      })

      return { data: newProd }
    } catch (err) {
      error.value = err.message
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

      if (updateErr) return

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

      if (logErr) return

      products.value[prodIndex].stock = stockAfter
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(productId) {
    loading.value = true
    error.value = null
    
    try {
      const productToDelete = products.value.find(p => p.id === productId)

      const { error: delErr } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId)

      if (delErr) return

      products.value = products.value.filter(p => p.id !== productId)

      if (productToDelete && authStore.user?.id) {
        await logActivity({
          activityType: ACTIVITY_TYPES.INVENTORY_DELETE,
          userId: authStore.user.id,
          description: `Product soft deleted: ${productToDelete.name} (SKU: ${productToDelete.sku})`,
          metadata: {
            productId: productId,
            productName: productToDelete.name,
            productSku: productToDelete.sku,
            costPrice: productToDelete.cost_price,
            sellingPrice: productToDelete.price,
            remainingStock: productToDelete.stock,
            timestamp: new Date().toISOString()
          }
        })
      }
    } catch (err) {
      error.value = err.message
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

      if (updateErr) return

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

        if (logErr) return
      }

      const prodIndex = products.value.findIndex(p => p.id === id)
      if (prodIndex !== -1) {
        products.value[prodIndex] = updatedProd
      }

      await logActivity({
        activityType: ACTIVITY_TYPES.INVENTORY_EDIT,
        userId: authStore.user.id,
        description: `Product updated: ${name} (SKU: ${sku})`,
        metadata: {
          productId: id,
          productName: name,
          productSku: sku,
          costPrice: cost_price,
          sellingPrice: price,
          stockBefore,
          stockAfter: stock,
          stockChangeReason: stockDifference !== 0 ? 'Stock adjusted during edit' : 'No stock change',
          timestamp: new Date().toISOString()
        }
      })

      return { data: updatedProd }
    } catch (err) {
      error.value = err.message
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

      if (updateErr) return

      const prodIndex = products.value.findIndex(p => p.id === productId)
      if (prodIndex !== -1) {
        products.value[prodIndex] = {
          ...products.value[prodIndex],
          is_on_discount: updatedProd.is_on_discount,
          discount_price: updatedProd.discount_price
        }
      }

      return { data: updatedProd }
    } catch (err) {
      error.value = err.message
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
