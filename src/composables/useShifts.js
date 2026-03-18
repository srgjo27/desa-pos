import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export function useShifts() {
  const shifts = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchShifts() {
    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('shifts')
        .select(`
          id,
          status,
          opened_at,
          closed_at,
          users (
            id,
            name,
            employee_number
          )
        `)
        .order('opened_at', { ascending: false })

      if (dbError) {
        console.error('[DesaPOS] Error fetching shifts:', dbError)
        error.value = 'Gagal mengambil riwayat absensi kasir.'
      } else {
        shifts.value = data || []
      }
    } catch (err) {
      console.error('[DesaPOS] Unexpected error fetching shifts:', err)
      error.value = 'Terjadi kesalahan sistem saat memuat shift.'
    } finally {
      loading.value = false
    }
  }

  async function fetchShiftsByUserId(userId) {
    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('shifts')
        .select(`
          id,
          status,
          opened_at,
          closed_at
        `)
        .eq('user_id', userId)
        .order('opened_at', { ascending: false })

      if (dbError) {
        console.error('[DesaPOS] Error fetching user shifts:', dbError)
        error.value = 'Gagal mengambil riwayat absensi pengguna.'
      } else {
        shifts.value = data || []
      }
    } catch (err) {
      console.error('[DesaPOS] Unexpected error fetching user shifts:', err)
      error.value = 'Terjadi kesalahan sistem saat memuat shift pengguna.'
    } finally {
      loading.value = false
    }
  }

  return {
    shifts,
    loading,
    error,
    fetchShifts,
    fetchShiftsByUserId
  }
}
