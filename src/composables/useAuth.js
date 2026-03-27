import { ref } from 'vue'
import { useRouter } from 'vue-router'
import bcrypt from 'bcryptjs'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { ERROR_CODES, getErrorMessage, logError } from '../services/errorHandler'
import { logActivity, ACTIVITY_TYPES } from '@/services/activityLogService'

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
        await logActivity({
          activityType: ACTIVITY_TYPES.SECURITY_ALERT,
          userId: data.id,
          description: `Failed login attempt for user ${data.name}: Invalid PIN`,
          metadata: {
            userName: data.name,
            failureReason: 'INVALID_PIN',
            timestamp: new Date().toISOString()
          }
        })
        error.value = getErrorMessage(ERROR_CODES.AUTH_INVALID_PIN)
        return { success: false }
      }

      if (!['KASIR', 'ADMIN'].includes(data.role)) {
        error.value = getErrorMessage(ERROR_CODES.AUTH_UNAUTHORIZED)
        return { success: false }
      }

      const { pin: _pin, is_active: _active, ...safeUser } = data
      authStore.setUser(safeUser)

      await logActivity({
        activityType: ACTIVITY_TYPES.AUTH_LOGIN,
        userId: data.id,
        description: `User ${data.name} (${data.role}) successfully logged in`,
        metadata: {
          userName: data.name,
          userRole: data.role,
          timestamp: new Date().toISOString()
        }
      })

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
      const currentUser = authStore.user
      
      if (currentUser?.id) {
        await logActivity({
          activityType: ACTIVITY_TYPES.AUTH_LOGOUT,
          userId: currentUser.id,
          description: `User ${currentUser.name} successfully logged out`,
          metadata: {
            userName: currentUser.name,
            userRole: currentUser.role,
            sessionEnd: new Date().toISOString()
          }
        })
      }
      
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
