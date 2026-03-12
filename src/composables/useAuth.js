import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref(null)

  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (supabaseError) {
        error.value = mapErrorMessage(supabaseError.message)
        return { success: false }
      }

      // Simpan session & user ke authStore
      authStore.setUser(data.user, data.session)

      // Redirect berdasarkan role
      const role = data.user?.user_metadata?.role
      if (role === 'ADMIN') {
        await router.push({ name: 'Dashboard' })
      } else {
        await router.push({ name: 'POS' })
      }

      return { success: true }
    } catch (err) {
      error.value = 'Terjadi kesalahan. Coba lagi nanti.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await supabase.auth.signOut()
    } finally {
      authStore.clearUser()
      await router.push({ name: 'Login' })
      loading.value = false
    }
  }

  function mapErrorMessage(message) {
    if (!message) return 'Terjadi kesalahan tidak diketahui.'
    if (message.includes('Invalid login credentials')) {
      return 'Email atau password salah. Periksa kembali.'
    }
    if (message.includes('Email not confirmed')) {
      return 'Email belum diverifikasi. Cek inbox email Anda.'
    }
    if (message.includes('Too many requests')) {
      return 'Terlalu banyak percobaan login. Tunggu beberapa menit.'
    }
    return message
  }

  return { login, logout, loading, error }
}
