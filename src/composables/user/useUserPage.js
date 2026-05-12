import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUsers } from '@/composables/user/useUsers'

export function useUserPage() {
    const router = useRouter()
    const authStore = useAuthStore()
    const { users, loading, error, fetchUsers, toggleUserStatus, deleteUser } = useUsers()

    const searchQuery = ref('')
    const isToggleModalOpen = ref(false)
    const userToToggle = ref(null)
    const isToggling = ref(false)

    const currentPage = ref(1)
    const itemsPerPage = ref(20)
    const itemsPerPageOptions = [10, 20, 30, 50]

    const filteredUsers = computed(() => {
        const list = users.value || []
        if (!list.length) return []
        const q = searchQuery.value.toLowerCase().trim()
        if (!q) return list
        return list.filter((user) =>
            user.name.toLowerCase().includes(q) ||
            (user.employee_number && user.employee_number.toLowerCase().includes(q)) ||
            user.role.toLowerCase().includes(q)
        )
    })

    const totalPages = computed(() => {
        return Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage.value))
    })

    const paginatedUsers = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value
        return filteredUsers.value.slice(start, start + itemsPerPage.value)
    })

    watch(searchQuery, () => {
        currentPage.value = 1
    })

    function prevPage() {
        if (currentPage.value > 1) currentPage.value -= 1
    }

    function nextPage() {
        if (currentPage.value < totalPages.value) currentPage.value += 1
    }

    function handleItemsPerPageChange(value) {
        const nextValue = Number(value)
        if (!Number.isNaN(nextValue)) {
            itemsPerPage.value = nextValue
            currentPage.value = 1
        }
    }

    function openToggleModal(user) {
        userToToggle.value = user
        isToggleModalOpen.value = true
    }

    function closeToggleModal() {
        isToggleModalOpen.value = false
        userToToggle.value = null
    }

    async function handleConfirmToggle(user) {
        isToggling.value = true
        const success = await toggleUserStatus(user.id, user.is_active)
        isToggling.value = false

        if (success) {
            closeToggleModal()
        }

        return success
    }

    async function handleDelete(user) {
        if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
            return
        }
        const success = await deleteUser(user.id)
        if (!success) alert(error.value)
    }

    function goToUserDetail(user) {
        const userId = typeof user === 'object' ? user?.id : user
        if (userId) router.push(`/users/${userId}`)
    }

    onMounted(async () => {
        if (authStore.role !== 'ADMIN') {
            alert('Akses Ditolak. Halaman ini hanya untuk ADMIN.')
            router.push({ name: 'POS' })
            return
        }
        await fetchUsers()
    })

    return {
        searchQuery,
        filteredUsers,
        paginatedUsers,
        totalPages,
        currentPage,
        itemsPerPage,
        itemsPerPageOptions,
        isToggleModalOpen,
        userToToggle,
        isToggling,
        loading,
        error,
        openToggleModal,
        closeToggleModal,
        handleConfirmToggle,
        handleDelete,
        handleItemsPerPageChange,
        prevPage,
        nextPage,
        goToUserDetail,
    }
}
