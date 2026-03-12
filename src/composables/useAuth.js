import { ref } from 'vue'
import { useRouter } from 'vue-router'
import bcrypt from 'bcryptjs'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'

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
        .select('id, name, role, pin')
        .eq('name', name.trim())
        .maybeSingle()

      if (dbError) {
        console.error('[DesaPOS] DB error saat login:', dbError)
        error.value = 'Terjadi kesalahan sistem. Coba lagi nanti.'
        return { success: false }
      }

      if (!data) {
        error.value = 'Nama pengguna atau PIN salah. Periksa kembali.'
        return { success: false }
      }

      const isPinValid = await bcrypt.compare(pin, data.pin)
      if (!isPinValid) {
        error.value = 'Nama pengguna atau PIN salah. Periksa kembali.'
        return { success: false }
      }

      if (!['KASIR', 'ADMIN'].includes(data.role)) {
        error.value = 'Akun Anda belum dikonfigurasi. Hubungi Admin.'
        return { success: false }
      }

      const { pin: _hash, ...safeUser } = data
      authStore.setUser(safeUser)

      if (data.role === 'ADMIN') {
        await router.push({ name: 'Dashboard' })
      } else {
        await router.push({ name: 'POS' })
      }

      return { success: true }
    } catch (err) {
      console.error('[DesaPOS] Unexpected error saat login:', err)
      error.value = 'Terjadi kesalahan tidak terduga. Coba lagi nanti.'
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
    } finally {
      loading.value = false
    }
  }

  return { login, logout, loading, error }
}
