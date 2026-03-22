import { ref } from 'vue'
import { useRouter } from 'vue-router'
import bcrypt from 'bcryptjs'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { DesaPOSError, ERROR_CODES, logError, getErrorMessage } from '@/services/errorHandler'

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
        throw new DesaPOSError(
          ERROR_CODES.DB_ERROR,
          'Gagal mengakses data pengguna. Periksa koneksi internet Anda.',
          dbError
        )
      }

      if (!data) {
        throw new DesaPOSError(
          ERROR_CODES.AUTH_INVALID_PIN,
          'Nama pengguna atau PIN salah. Periksa kembali.'
        )
      }

      if (!data.is_active) {
        throw new DesaPOSError(
          ERROR_CODES.AUTH_USER_INACTIVE,
          'Akun Anda telah dinonaktifkan. Hubungi Admin.'
        )
      }

      const isPinValid = await bcrypt.compare(pin, data.pin)
      if (!isPinValid) {
        throw new DesaPOSError(
          ERROR_CODES.AUTH_INVALID_PIN,
          'PIN salah. Periksa kembali.'
        )
      }

      if (!['KASIR', 'ADMIN'].includes(data.role)) {
        throw new DesaPOSError(
          ERROR_CODES.AUTH_UNAUTHORIZED,
          'Akun Anda belum dikonfigurasi dengan benar. Hubungi Admin.'
        )
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
      if (err instanceof DesaPOSError) {
        error.value = getErrorMessage(err.code)
        logError(err, { context: 'login', username: name })
      } else {
        console.error('[DesaPOS] Unexpected error saat login:', err)
        error.value = 'Terjadi kesalahan tidak terduga. Coba lagi nanti.'
        logError(err, { context: 'login', username: name })
      }
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
