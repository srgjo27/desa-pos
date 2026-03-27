import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const WARNING_TIMEOUT_MS = 25 * 60 * 1000

let timeoutId = null
let warningTimeoutId = null

export function useSessionTimeout() {
  const router = useRouter()
  const authStore = useAuthStore()
  
  const isSessionValid = ref(true)
  const showWarning = ref(false)
  const timeRemaining = ref(SESSION_TIMEOUT_MS)

  function resetSessionTimeout() {
    clearTimeout(timeoutId)
    clearTimeout(warningTimeoutId)

    isSessionValid.value = true
    showWarning.value = false
    timeRemaining.value = SESSION_TIMEOUT_MS

    warningTimeoutId = setTimeout(() => {
      showWarning.value = true
      updateTimeRemaining()
    }, WARNING_TIMEOUT_MS)

    timeoutId = setTimeout(() => {
      handleSessionTimeout()
    }, SESSION_TIMEOUT_MS)
  }

  function updateTimeRemaining() {
    const interval = setInterval(() => {
      timeRemaining.value -= 1000
      if (timeRemaining.value <= 0) {
        clearInterval(interval)
        handleSessionTimeout()
      }
    }, 1000)
  }

  function handleSessionTimeout() {
    showWarning.value = false
    isSessionValid.value = false
    
    authStore.clearUser()
    authStore.clearShift()
    
    router.push({
      name: 'Login',
      query: { session_expired: 'true' }
    })
  }

  function extendSession() {
    showWarning.value = false
    resetSessionTimeout()
  }

  async function logout() {
    clearTimeout(timeoutId)
    clearTimeout(warningTimeoutId)
    showWarning.value = false
    
    authStore.clearUser()
    authStore.clearShift()
    
    await router.push({ name: 'Login' })
  }

  function setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      if (authStore.user && isSessionValid.value) {
        resetSessionTimeout()
      }
    }

    events.forEach(event => {
      window.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity, true)
      })
    }
  }

  function validateSecurityHeaders() {
    const checks = {
      https: window.location.protocol === 'https:',
      cookieSecure: document.cookie.includes('Secure') || true,
      localStorage: typeof localStorage !== 'undefined'
    }
    
    if (!checks.https && !window.location.hostname.includes('localhost')) {
      console.warn('[Session] ⚠️ HTTPS not detected. Session data might be vulnerable.')
    }

    return checks
  }

  onMounted(() => {
    if (authStore.user) {
      resetSessionTimeout()
      setupActivityListeners()
      validateSecurityHeaders()
    }
  })

  onUnmounted(() => {
    clearTimeout(timeoutId)
    clearTimeout(warningTimeoutId)
  })

  return {
    isSessionValid,
    showWarning,
    timeRemaining,
    resetSessionTimeout,
    extendSession,
    logout,
    handleSessionTimeout,
    setupActivityListeners,
    validateSecurityHeaders
  }
}

export default useSessionTimeout
