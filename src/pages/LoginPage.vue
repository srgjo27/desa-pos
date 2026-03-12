<script setup>
import { ref, reactive } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useAuth } from '@/composables/useAuth'

const { login, loading, error } = useAuth()

const form = reactive({
  name: '',
  pin: '',
})

const showPin = ref(false)
const formErrors = reactive({
  name: '',
  pin: '',
})

function validateForm() {
  let isValid = true
  formErrors.name = ''
  formErrors.pin = ''

  if (!form.name.trim()) {
    formErrors.name = 'Nama pengguna wajib diisi.'
    isValid = false
  }

  if (!form.pin) {
    formErrors.pin = 'PIN wajib diisi.'
    isValid = false
  } else if (!/^\d+$/.test(form.pin)) {
    formErrors.pin = 'PIN hanya boleh berisi angka.'
    isValid = false
  } else if (form.pin.length < 4) {
    formErrors.pin = 'PIN minimal 4 digit.'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) return
  await login(form.name, form.pin)
}
</script>

<template>
  <AuthLayout>
    <!-- Card Putih Bersih -->
    <div class="bg-white rounded-3xl shadow-xl shadow-blue-100/60 border border-gray-100 overflow-hidden">

      <!-- Top Banner / Header berwarna -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 pt-10 pb-12 text-center relative overflow-hidden">
        <!-- Dekorasi lingkaran di dalam banner -->
        <div class="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div class="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

        <!-- Logo Icon -->
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md mb-4 relative z-10">
          <svg class="w-9 h-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-extrabold text-white relative z-10 tracking-tight">DesaPOS</h1>
        <p class="text-blue-100 text-sm mt-1.5 relative z-10 font-medium">
          Sistem Kasir BUMDes Digital
        </p>
      </div>

      <!-- Notch greeting card -->
      <div class="relative -mt-5 px-8">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 text-center">
          <p class="text-gray-600 text-sm font-medium">Selamat datang! Silakan masuk untuk melanjutkan.</p>
        </div>
      </div>

      <!-- Form Body -->
      <div class="px-8 pt-6 pb-8">
        <form id="login-form" @submit.prevent="handleSubmit" class="space-y-5" novalidate>

          <!-- Global Error Alert -->
          <div
            v-if="error"
            class="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            <svg class="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>{{ error }}</span>
          </div>

          <!-- Name Field -->
          <BaseInput
            id="login-name"
            v-model="form.name"
            label="Nama Pengguna"
            type="text"
            placeholder="Masukkan nama Anda"
            autocomplete="username"
            :error="formErrors.name"
          />

          <!-- PIN Field -->
          <BaseInput
            id="login-pin"
            v-model="form.pin"
            label="PIN"
            :type="showPin ? 'text' : 'password'"
            placeholder="Masukkan PIN Anda"
            autocomplete="current-password"
            :error="formErrors.pin"
          >
            <template #suffix>
              <button
                type="button"
                id="toggle-pin"
                class="text-gray-400 hover:text-blue-600 transition-colors p-0.5 focus:outline-none"
                :aria-label="showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'"
                @click="showPin = !showPin"
              >
                <!-- Eye icon -->
                <svg v-if="!showPin" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <!-- Eye-off icon -->
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </button>
            </template>
          </BaseInput>

          <!-- Submit Button -->
          <div class="pt-2">
            <BaseButton
              id="login-submit"
              type="submit"
              :loading="loading"
              :disabled="loading"
              full-width
            >
              <span v-if="!loading">🔑 Masuk ke DesaPOS</span>
              <span v-else>Memverifikasi...</span>
            </BaseButton>
          </div>
        </form>

        <!-- Footer -->
        <div class="mt-6 pt-5 border-t border-gray-100 text-center space-y-1">
          <p class="text-sm text-gray-500">
            Butuh bantuan?
            <a
              href="mailto:admin@bumdes.desa.id"
              class="text-blue-600 hover:text-blue-700 transition-colors font-semibold ml-1 underline underline-offset-2"
            >
              Hubungi Admin
            </a>
          </p>
          <p class="text-xs text-gray-400">
            DesaPOS v0.1.0 · BUMDes Digital
          </p>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
