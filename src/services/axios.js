import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const apiClient = axios.create({
  baseURL: supabaseUrl ? `${supabaseUrl}/rest/v1` : '',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey || '',
    'Authorization': `Bearer ${supabaseAnonKey || ''}`,
  },
})

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
