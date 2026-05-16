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
    path: '/access-denied',
    name: 'AccessDenied',
    component: () => import('@/pages/AccessDeniedPage.vue'),
  },
  {
    path: '/open-shift',
    name: 'OpenShift',
    component: () => import('@/pages/kasir/OpenShiftPage.vue'),
    meta: { requiresAuth: true, roles: ['KASIR'] },
  },
  {
    path: '/pos',
    name: 'POS',
    component: () => import('@/pages/kasir/PosTrxPage.vue'),
    meta: { requiresAuth: true, roles: ['KASIR'] },
  },
  {
    path: '/dashboard',
    redirect: '/inventory'
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/pages/admin/InventoryPage.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/inventory/:id',
    name: 'ProductDetail',
    component: () => import('@/pages/admin/ProductDetailPage.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/pages/admin/AnalyticsPage.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/pages/admin/UsersPage.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: () => import('@/pages/admin/UserDetailPage.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/shifts',
    name: 'Shifts',
    component: () => import('@/pages/admin/ShiftsPage.vue'),
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
      return next({ name: 'AccessDenied' })
    }
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    if (authStore.isAdmin) return next({ name: 'Inventory' })
    return next({ name: 'OpenShift' })
  }

  next()
})

export default router
