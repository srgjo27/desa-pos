import { ref, onMounted, onUnmounted } from 'vue'

// Simulated IndexedDB alternative menggunakan localStorage untuk MVP
// TODO: Upgrade ke Dexie.js atau vue-idb untuk production

const PENDING_SALES_KEY = 'desa-pos-pending-sales'
const PENDING_ITEMS_KEY = 'desa-pos-pending-items'


function getPendingSales() {
  const data = localStorage.getItem(PENDING_SALES_KEY)
  return data ? JSON.parse(data) : []
}

function savePendingSales(sales) {
  localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(sales))
}

function getPendingItems() {
  const data = localStorage.getItem(PENDING_ITEMS_KEY)
  return data ? JSON.parse(data) : []
}

function savePendingItems(items) {
  localStorage.setItem(PENDING_ITEMS_KEY, JSON.stringify(items))
}

export function useOfflineSync() {
  const isOnline = ref(navigator.onLine)
  const isSyncing = ref(false)
  const pendingCount = ref(0)
  const syncError = ref(null)

  async function savePendingTransaction(saleData, itemsData) {
    try {
      const saleWithStatus = {
        ...saleData,
        sync_status: 'PENDING',
        localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        savedAt: new Date().toISOString()
      }
      
      const pendingSales = getPendingSales()
      pendingSales.push(saleWithStatus)
      savePendingSales(pendingSales)
      
      const itemsWithSaleId = itemsData.map(item => ({
        ...item,
        saleLocalId: saleWithStatus.localId
      }))
      
      const pendingItems = getPendingItems()
      pendingItems.push(...itemsWithSaleId)
      savePendingItems(pendingItems)
      
      updatePendingCount()
      return { success: true, saleId: saleWithStatus.localId, isOffline: true }
    } catch (err) {
      console.error('[OfflineSync] Error saving pending transaction:', err)
      return { success: false, error: err.message }
    }
  }

  async function syncPendingTransactions(supabase) {
    if (!isOnline.value || isSyncing.value) {
      return { success: false, message: 'Not online or already syncing' }
    }
    
    isSyncing.value = true
    syncError.value = null
    let syncedCount = 0
    const errors = []
    
    try {
      const pendingSales = getPendingSales()
      const pendingItems = getPendingItems()
      
      for (const sale of pendingSales) {
        try {
          const { localId, sync_status: _, savedAt: __, ...salePayload } = sale
          salePayload.sync_status = 'SYNCED'
          
          const { data: remoteSale, error: saleError } = await supabase
            .from('sales')
            .insert(salePayload)
            .select()
            .single()
          
          if (saleError) {
            console.error('[OfflineSync] Error syncing sale:', saleError)
            errors.push({ saleId: localId, error: saleError.message })
            continue
          }
          
          const saleItems = pendingItems.filter(item => item.saleLocalId === localId)
          
          if (saleItems.length > 0) {
            const itemsPayload = saleItems.map(item => {
              const { saleLocalId, ...itemData } = item
              return {
                ...itemData,
                sale_id: remoteSale.id
              }
            })
            
            const { error: itemsError } = await supabase
              .from('sale_items')
              .insert(itemsPayload)
            
            if (itemsError) {
              console.error('[OfflineSync] Error syncing sale items:', itemsError)
              errors.push({ saleId: localId, error: itemsError.message })
              continue
            }
          }
          
          const updatedSales = pendingSales.filter(s => s.localId !== localId)
          savePendingSales(updatedSales)
          
          const updatedItems = pendingItems.filter(item => item.saleLocalId !== localId)
          savePendingItems(updatedItems)
          
          syncedCount++
        } catch (err) {
          console.error('[OfflineSync] Sync error untuk sale:', err)
          errors.push({ error: err.message })
        }
      }
      
      updatePendingCount()
      
      return {
        success: errors.length === 0,
        syncedCount,
        errors: errors.length > 0 ? errors : undefined
      }
    } catch (err) {
      console.error('[OfflineSync] Critical sync error:', err)
      syncError.value = err.message
      return { success: false, error: err.message, syncedCount }
    } finally {
      isSyncing.value = false
    }
  }

  function updatePendingCount() {
    pendingCount.value = getPendingSales().length
  }

  function clearAllPending() {
    localStorage.removeItem(PENDING_SALES_KEY)
    localStorage.removeItem(PENDING_ITEMS_KEY)
    updatePendingCount()
  }

  function getPending() {
    return {
      sales: getPendingSales(),
      items: getPendingItems()
    }
  }

  const handleOnline = () => {
    isOnline.value = true
    console.log('[OfflineSync] Device is online')
  }

  const handleOffline = () => {
    isOnline.value = false
    console.log('[OfflineSync] Device is offline')
  }

  onMounted(() => {
    updatePendingCount()
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncError,
    savePendingTransaction,
    syncPendingTransactions,
    updatePendingCount,
    clearAllPending,
    getPending
  }
}
