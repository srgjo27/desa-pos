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
    path: '/open-shift',
    name: 'OpenShift',
    component: () => import('@/pages/OpenShiftPage.vue'),
    meta: { requiresAuth: true, roles: ['KASIR'] },
  },
  {
    path: '/pos',
    name: 'POS',
    component: () => import('@/pages/PosTrxPage.vue'),
    meta: { requiresAuth: true, roles: ['KASIR'] },
  },
  {
    path: '/dashboard',
    redirect: '/inventory'
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/pages/InventoryPage.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/pages/AnalyticsPage.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/pages/UsersPage.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login' })
    }
    if (to.meta.roles && !to.meta.roles.includes(authStore.role)) {
      if (authStore.isAdmin) return next({ name: 'Inventory' })
      if (authStore.isKasir) return next({ name: 'OpenShift' })
      return next({ name: 'Login' })
    }
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    if (authStore.isAdmin) return next({ name: 'Inventory' })
    return next({ name: 'OpenShift' })
  }

  next()
})

export default router
