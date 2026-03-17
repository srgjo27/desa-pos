import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useShiftStore = defineStore('shift', () => {
  const activeShift = ref(null)

  const hasActiveShift = computed(() => !!activeShift.value?.id)
  const shiftId = computed(() => activeShift.value?.id ?? null)
  const openingCash = computed(() => activeShift.value?.opening_cash ?? 0)
  const openedAt = computed(() => activeShift.value?.opened_at ?? null)

  function setShift(shiftData) {
    activeShift.value = shiftData
  }

  function clearShift() {
    activeShift.value = null
  }

  return {
    activeShift,
    hasActiveShift,
    shiftId,
    openingCash,
    openedAt,
    setShift,
    clearShift,
  }
}, {
  persist: {
    key: 'desa-pos-shift',
    storage: localStorage,
  },
})
