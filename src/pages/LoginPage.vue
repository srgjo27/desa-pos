<script setup>
import { ref, reactive } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { Button, Input, Alert } from '@/components/ui'
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
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">

      <!-- Header -->
      <div class="bg-linear-to-r from-green-600 to-emerald-600 px-8 pt-10 pb-12 text-center relative overflow-hidden">
        <div class="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div class="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

        <!-- Logo -->
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-4 relative z-10">
          <i class="pi pi-credit-card" style="font-size: 2rem; color: #10b981;" ></i>
        </div>
        <h1 class="text-3xl font-extrabold text-white relative z-10 tracking-tight">DesaPOS</h1>
        <p class="text-green-100 text-sm mt-1.5 relative z-10 font-medium">
          Sistem Kasir BUMDes Digital
        </p>
      </div>

      <!-- Form -->
      <div class="px-8 pt-6 pb-8">
        <form id="login-form" @submit.prevent="handleSubmit" class="space-y-5" novalidate>

          <!-- Alert -->
          <Alert type="error" :message="error" />

          <!-- Name -->
          <Input id="login-name" v-model="form.name" label="Nama Pengguna" type="text"
            placeholder="Masukkan nama Anda" autocomplete="username" :error="formErrors.name" />

          <!-- PIN -->
          <Input id="login-pin" v-model="form.pin" label="PIN" :type="showPin ? 'text' : 'password'"
            placeholder="Masukkan PIN Anda" autocomplete="current-password" :error="formErrors.pin">
            <template #suffix>
              <button type="button" id="toggle-pin"
                class="text-gray-400 hover:text-green-600 transition-colors p-0.5 focus:outline-none"
                :aria-label="showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'" @click="showPin = !showPin">
                <i v-if="!showPin" class="pi pi-eye" style="font-size: 1rem" />
                <i v-else class="pi pi-eye-slash" style="font-size: 1rem" />
              </button>
            </template>
          </Input>

          <!-- Submit -->
          <div class="pt-2">
            <Button id="login-submit" type="submit" :loading="loading" :disabled="loading" full-width>
              <span v-if="!loading">Masuk ke DesaPOS</span>
              <span v-else>Memverifikasi...</span>
            </Button>
          </div>
        </form>

        <!-- Footer -->
        <div class="mt-6 pt-5 border-t border-gray-100 text-center space-y-1">
          <p class="text-sm text-gray-500">
            Butuh bantuan?
            <a href="mailto:admin@bumdes.desa.id"
              class="text-green-600 hover:text-green-700 transition-colors font-semibold ml-1 underline underline-offset-2">
              Hubungi Admin
            </a>
          </p>
          <p class="text-xs text-gray-400">
            DesaPOS v0.1.1 · BUMDes Digital
          </p>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
