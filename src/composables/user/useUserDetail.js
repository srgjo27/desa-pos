import { ref } from 'vue'
import { useUsers } from '@/composables/user/useUsers'

export function useUserDetail(userId) {
    const { getUserById, toggleUserStatus } = useUsers()

    const user = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const isToggling = ref(false)
    const isToggleModalOpen = ref(false)

    const initializeUserData = async () => {
        loading.value = true
        error.value = null

        try {
            const data = await getUserById(userId)

            if (data) {
                user.value = data
                return { success: true, data }
            } else {
                error.value = 'Profil pengguna tidak ditemukan atau tidak valid.'
                return { success: false, error: error.value }
            }
        } catch (err) {
            error.value = 'Terjadi kesalahan sistem saat memuat profil.'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    const handleConfirmToggle = async (userData) => {
        isToggling.value = true

        try {
            const success = await toggleUserStatus(userData.id, userData.is_active)

            if (success) {
                user.value.is_active = !userData.is_active
                isToggleModalOpen.value = false
            }

            return success
        } catch (err) {
            console.error(err)
            return false
        } finally {
            isToggling.value = false
        }
    }

    const isKasir = () => user.value?.role === 'KASIR'

    const isUserActive = () => user.value?.is_active

    return {
        user,
        loading,
        error,
        isToggling,
        isToggleModalOpen,
        initializeUserData,
        handleConfirmToggle,
        isKasir,
        isUserActive
    }
}
