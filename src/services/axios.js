import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

// Axios instance untuk Supabase REST API
const apiClient = axios.create({
  baseURL: supabaseUrl ? `${supabaseUrl}/rest/v1` : '',
  headers: {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
})

// Request interceptor: inject JWT token dari authStore
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.session?.access_token) {
      config.headers['Authorization'] = `Bearer ${authStore.session.access_token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.clearUser()
    }
    return Promise.reject(error)
  }
)

export default apiClient
