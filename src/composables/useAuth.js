import { ref } from 'vue'
import { useRouter } from 'vue-router'
import bcrypt from 'bcryptjs'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { ERROR_CODES, getErrorMessage, logError } from '../services/errorHandler'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref(null)

  async function login(name, pin) {
    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('id, name, role, pin, is_active')
        .eq('name', name.trim())
        .maybeSingle()

      if (dbError) {
        logError(dbError, { context: 'login' })
        return { success: false }
      }

      if (!data) {
        error.value = getErrorMessage(ERROR_CODES.DB_NOT_FOUND)
        return { success: false }
      }

      if (!data.is_active) {
        error.value = getErrorMessage(ERROR_CODES.AUTH_USER_INACTIVE)
        return { success: false }
      }

      const isPinValid = await bcrypt.compare(pin, data.pin)
      if (!isPinValid) {
        error.value = getErrorMessage(ERROR_CODES.AUTH_INVALID_PIN)
        return { success: false }
      }

      if (!['KASIR', 'ADMIN'].includes(data.role)) {
        error.value = getErrorMessage(ERROR_CODES.AUTH_UNAUTHORIZED)
        return { success: false }
      }

      const { pin: _pin, is_active: _active, ...safeUser } = data
      authStore.setUser(safeUser)

      if (data.role === 'ADMIN') {
        await router.push({ name: 'Inventory' })
      } else {
        await router.push({ name: 'OpenShift' })
      }

      return { success: true }
    } catch (err) {
      logError(err, { context: 'login' })
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      authStore.clearUser()
      await router.push({ name: 'Login' })
      return { success: true }
    } catch (err) {
      logError(err, { context: 'logout' })
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return { login, logout, loading, error }
}
