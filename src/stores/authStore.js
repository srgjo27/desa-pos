import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const session = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!session.value?.access_token)
  const role = computed(() => user.value?.user_metadata?.role || null)
  const isAdmin = computed(() => role.value === 'ADMIN')
  const isKasir = computed(() => role.value === 'KASIR')

  // Actions
  function setUser(userData, sessionData) {
    user.value = userData
    session.value = sessionData
  }

  function clearUser() {
    user.value = null
    session.value = null
  }

  return {
    user,
    session,
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
    pick: ['user', 'session'],
  },
})
