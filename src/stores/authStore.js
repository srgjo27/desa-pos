import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const isAuthenticated = computed(() => !!user.value?.id)
  const role = computed(() => user.value?.role || null)
  const isAdmin = computed(() => role.value === 'ADMIN')
  const isKasir = computed(() => role.value === 'KASIR')

  function setUser(userData) {
    user.value = userData
  }

  function clearUser() {
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    role,
    isAdmin,
    isKasir,
    setUser,
    clearUser,
  }
}, {
  persist: {
    key: 'desa-pos-auth',
    storage: localStorage,
    pick: ['user'],
  },
})
