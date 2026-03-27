import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { logActivity, ACTIVITY_TYPES } from '@/services/activityLogService'

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
        error.value = 'Gagal mengambil data pengguna.'
      } else {
        users.value = data || []
      }
    } catch (err) {
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
        error.value = 'Gagal mengubah status pengguna.'
        return false
      } else {
        const index = users.value.findIndex(u => u.id === userId)
        if (index !== -1) {
          users.value[index].is_active = newStatus
        }
        
        const authStore = useAuthStore()
        if (authStore.user?.id) {
          await logActivity({
            activityType: ACTIVITY_TYPES.USER_EDIT,
            userId: authStore.user.id,
            description: `User ${userId} status changed to ${newStatus ? 'ACTIVE' : 'INACTIVE'}`,
            metadata: {
              targetUserId: userId,
              changedBy: authStore.user.id,
              changedByName: authStore.user.name,
              newStatus: newStatus,
              timestamp: new Date().toISOString()
            }
          })
        }
        
        return true
      }
    } catch (err) {
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
        error.value = 'Gagal memuat profil pengguna.'
        return null
      }
      return data
    } catch (err) {
      error.value = 'Terjadi kesalahan sistem.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(userId) {
    error.value = null

    try {
      const userToDelete = users.value.find(u => u.id === userId)

      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (dbError) {
        error.value = 'Gagal menghapus pengguna.'
        return false
      }

      users.value = users.value.filter(u => u.id !== userId)
      
      const authStore = useAuthStore()
      if (authStore.user?.id && userToDelete) {
        await logActivity({
          activityType: ACTIVITY_TYPES.USER_DELETE,
          userId: authStore.user.id,
          description: `User deleted: ${userToDelete.name} (${userToDelete.role})`,
          metadata: {
            deletedUserId: userId,
            deletedUserName: userToDelete.name,
            deletedUserRole: userToDelete.role,
            deletedByUserId: authStore.user.id,
            deletedByName: authStore.user.name,
            timestamp: new Date().toISOString()
          }
        })
      }
      
      return true
    } catch (err) {
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
