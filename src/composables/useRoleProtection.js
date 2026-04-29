import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { logActivityHelper } from '@/utils/activityLoggerHelper'
import { ACTIVITY_TYPES } from '@/services/activityLogService'

export function useRoleProtection(allowedRoles, pageContext = 'Unknown') {
    const router = useRouter()
    const authStore = useAuthStore()

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

    const isAuthorized = rolesArray.includes(authStore.role)

    if (!isAuthorized) {
        logActivityHelper(
            ACTIVITY_TYPES.SECURITY_ALERT,
            authStore.user?.id,
            `Unauthorized access attempt to ${pageContext}`,
            {
                userName: authStore.user?.name,
                userRole: authStore.role,
                pageContext,
                requiredRoles: rolesArray,
                accessDenied: true
            }
        )

        router.push({ name: 'AccessDenied' })
        return false
    }

    return true
}

export function hasRole(roles) {
    const authStore = useAuthStore()
    const rolesArray = Array.isArray(roles) ? roles : [roles]
    return rolesArray.includes(authStore.role)
}

export function redirectToRoleHome() {
    const router = useRouter()
    const authStore = useAuthStore()

    if (authStore.role === 'ADMIN') {
        router.push({ name: 'Inventory' })
    } else {
        router.push({ name: 'OpenShift' })
    }
}
