import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'
import { useShiftStore } from '@/stores/shiftStore'

export function usePosTrxState() {
  const router = useRouter()
  const shiftStore = useShiftStore()
  const { logout, loading: logoutLoading } = useAuth()

  const showCheckoutModal = ref(false)
  const showReceiptModal = ref(false)
  const showCloseShiftModal = ref(false)
  const showMobileCart = ref(false)
  const latestReceiptData = ref({})

  function handleLogout() {
    if (shiftStore.hasActiveShift) {
      showCloseShiftModal.value = true
    } else {
      performLogout()
    }
  }

  async function performLogout() {
    await logout()
  }

  function openCheckout() {
    showCheckoutModal.value = true
  }

  function closeCheckout() {
    showCheckoutModal.value = false
  }

  function handleCheckoutSuccess(receiptData) {
    showCheckoutModal.value = false
    latestReceiptData.value = receiptData
    showReceiptModal.value = true
  }

  function closeReceipt() {
    showReceiptModal.value = false
  }

  function closeShiftModal() {
    showCloseShiftModal.value = false
  }

  function toggleMobileCart(show) {
    showMobileCart.value = show
  }

  return {
    showCheckoutModal,
    showReceiptModal,
    showCloseShiftModal,
    showMobileCart,
    latestReceiptData,
    logoutLoading,
    handleLogout,
    performLogout,
    openCheckout,
    closeCheckout,
    handleCheckoutSuccess,
    closeReceipt,
    closeShiftModal,
    toggleMobileCart,
  }
}
