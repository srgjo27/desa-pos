import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export function useUsers() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('id, name, role, is_active, employee_number, img_url, created_at')
        .order('created_at', { ascending: false })

      if (dbError) {
        console.error('[DesaPOS] Error fetching users:', dbError)
        error.value = 'Gagal mengambil data pengguna.'
      } else {
        users.value = data || []
      }
    } catch (err) {
      console.error('[DesaPOS] Unexpected error fetching users:', err)
      error.value = 'Terjadi kesalahan sistem.'
    } finally {
      loading.value = false
    }
  }

  async function toggleUserStatus(userId, currentStatus) {
    loading.value = true
    error.value = null
    const newStatus = !currentStatus

    try {
      const { error: dbError } = await supabase
        .from('users')
        .update({ is_active: newStatus })
        .eq('id', userId)

      if (dbError) {
        console.error('[DesaPOS] Error updating user status:', dbError)
        error.value = 'Gagal mengubah status pengguna.'
        return false
      } else {
        const index = users.value.findIndex(u => u.id === userId)
        if (index !== -1) {
          users.value[index].is_active = newStatus
        }
        return true
      }
    } catch (err) {
      console.error('[DesaPOS] Unexpected error updating user status:', err)
      error.value = 'Terjadi kesalahan sistem saat mengubah status.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function getUserById(userId) {
    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('id, name, role, is_active, employee_number, img_url, phone, address, created_at')
        .eq('id', userId)
        .single()

      if (dbError) {
        console.error('[DesaPOS] Error fetching user detail:', dbError)
        error.value = 'Gagal memuat profil pengguna.'
        return null
      }
      return data
    } catch (err) {
      console.error('[DesaPOS] Unexpected error fetching user detail:', err)
      error.value = 'Terjadi kesalahan sistem.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(userId) {
    error.value = null

    try {
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (dbError) {
        console.error('[DesaPOS] Error deleting user:', dbError)
        error.value = 'Gagal menghapus pengguna.'
        return false
      }

      users.value = users.value.filter(u => u.id !== userId)
      return true
    } catch (err) {
      console.error('[DesaPOS] Unexpected error deleting user:', err)
      error.value = 'Terjadi kesalahan sistem saat menghapus pengguna.'
      return false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    toggleUserStatus,
    getUserById,
    deleteUser
  }
}
