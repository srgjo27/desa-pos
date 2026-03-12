<script setup>
import { ref, reactive } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useAuth } from '@/composables/useAuth'

const { login, loading, error } = useAuth()

const form = reactive({
  email: '',
  password: '',
})

const showPassword = ref(false)
const formErrors = reactive({
  email: '',
  password: '',
})

function validateForm() {
  let isValid = true
  formErrors.email = ''
  formErrors.password = ''

  if (!form.email) {
    formErrors.email = 'Email wajib diisi.'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    formErrors.email = 'Format email tidak valid.'
    isValid = false
  }

  if (!form.password) {
    formErrors.password = 'Password wajib diisi.'
    isValid = false
  } else if (form.password.length < 6) {
    formErrors.password = 'Password minimal 6 karakter.'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) return
  await login(form.email, form.password)
}
</script>

<template>
  <AuthLayout>
    <!-- Card Glassmorphism -->
    <div
      class="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/50 p-8 overflow-hidden"
    >
      <!-- Top accent line -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <!-- Logo Icon -->
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/50 mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-tight">DesaPOS</h1>
        <p class="text-gray-400 text-sm mt-1">Sistem Kasir BUMDes Digital</p>
      </div>

      <!-- Login Form -->
      <form id="login-form" @submit.prevent="handleSubmit" class="space-y-5" novalidate>

        <!-- Global Error Alert -->
        <div
          v-if="error"
          class="flex items-start gap-3 bg-red-950/60 border border-red-800/60 rounded-xl px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Email Field -->
        <BaseInput
          id="login-email"
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="kasir@bumdes.desa.id"
          autocomplete="email"
          :error="formErrors.email"
        />

        <!-- Password Field -->
        <BaseInput
          id="login-password"
          v-model="form.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Masukkan password Anda"
          autocomplete="current-password"
          :error="formErrors.password"
        >
          <template #suffix>
            <button
              type="button"
              id="toggle-password"
              class="text-gray-500 hover:text-gray-300 transition-colors p-0.5 focus:outline-none"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              @click="showPassword = !showPassword"
            >
              <!-- Eye icon -->
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <!-- Eye-off icon -->
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </button>
          </template>
        </BaseInput>

        <!-- Submit Button -->
        <BaseButton
          id="login-submit"
          type="submit"
          :loading="loading"
          :disabled="loading"
          full-width
          class="mt-2"
        >
          <span v-if="!loading">
            Masuk ke DesaPOS
          </span>
          <span v-else>Memvalidasi...</span>
        </BaseButton>
      </form>

      <!-- Footer -->
      <div class="mt-6 pt-5 border-t border-gray-800/60 text-center">
        <p class="text-xs text-gray-500">
          Butuh bantuan?
          <a
            href="mailto:admin@bumdes.desa.id"
            class="text-blue-400 hover:text-blue-300 transition-colors font-medium ml-1"
          >
            Hubungi Admin
          </a>
        </p>
        <p class="text-xs text-gray-600 mt-2">
          DesaPOS v0.1.0 · BUMDes Digital
        </p>
      </div>
    </div>
  </AuthLayout>
</template>
