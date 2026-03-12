import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/pos',
    name: 'POS',
    component: () => import('@/pages/PosRegisterPage.vue'),
    meta: { requiresAuth: true, roles: ['KASIR', 'ADMIN'] },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation Guard: Role-Based Access Control
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Halaman yang butuh login
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login' })
    }

    // Cek role access
    if (to.meta.roles && !to.meta.roles.includes(authStore.role)) {
      // Redirect ke halaman sesuai role
      if (authStore.isAdmin) return next({ name: 'Dashboard' })
      if (authStore.isKasir) return next({ name: 'POS' })
      return next({ name: 'Login' })
    }
  }

  // Halaman yang hanya untuk tamu (belum login)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    if (authStore.isAdmin) return next({ name: 'Dashboard' })
    return next({ name: 'POS' })
  }

  next()
})

export default router
