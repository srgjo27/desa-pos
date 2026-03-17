<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShift } from '@/composables/useShift'
import { useAuthStore } from '@/stores/authStore'
import { formatRupiah } from '@/utils/formatCurrency'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const { openShift, loading, error } = useShift()

const now = ref(new Date())
const form = reactive({ openingCash: '' })
const formError = ref('')

const timer = setInterval(() => { now.value = new Date() }, 1000)
onMounted(() => { })

function formatTime(date) {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function formatDateLong(date) {
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function onCashInput(e) {
  const raw = e.target.value.replace(/\D/g, '')
  form.openingCash = raw
  e.target.value = raw ? Number(raw).toLocaleString('id-ID') : ''
  formError.value = ''
}

async function handleSubmit() {
  const amount = Number(form.openingCash)
  if (isNaN(amount) || amount < 0) {
    formError.value = 'Masukkan nominal uang modal yang valid.'
    return
  }

  const result = await openShift(amount)
  if (result.success) {
    await router.push({ name: 'POS' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">

    <!-- Card -->
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

      <!-- Header biru -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white text-center relative overflow-hidden">
        <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />

        <!-- Jam digital -->
        <p class="text-4xl font-bold tracking-widest relative z-10 font-mono">
          {{ formatTime(now) }}
        </p>
        <p class="text-blue-100 text-sm mt-1 relative z-10">{{ formatDateLong(now) }}</p>
      </div>

      <!-- Body -->
      <div class="px-8 py-6 space-y-5">

        <!-- Sapaan kasir -->
        <div class="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {{ authStore.user?.name?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium">Selamat datang,</p>
            <p class="text-gray-800 font-bold leading-tight">{{ authStore.user?.name }}</p>
            <span class="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5"
              :class="authStore.user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'">
              {{ authStore.user?.role }}
            </span>
          </div>
        </div>

        <!-- Judul -->
        <div>
          <h1 class="text-xl font-extrabold text-gray-800">Buka Shift Hari Ini</h1>
          <p class="text-gray-500 text-sm mt-0.5">Catat jumlah uang tunai di laci kasir sebelum mulai berjualan.</p>
        </div>

        <!-- Form uang modal -->
        <form id="open-shift-form" @submit.prevent="handleSubmit" class="space-y-4" novalidate>

          <!-- Error global -->
          <div v-if="error" class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700" role="alert">
            <svg class="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            {{ error }}
          </div>

          <!-- Input modal kas -->
          <div class="flex flex-col gap-1.5">

            <label for="opening-cash" class="text-sm font-semibold text-gray-700">
              Uang Modal di Laci Kasir
            </label>

            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm select-none">Rp</span>
              <input
                id="opening-cash"
                type="text"
                inputmode="numeric"
                placeholder="0"
                maxlength="15"
                :class="[
                  'w-full rounded-xl pl-10 pr-4 py-3 text-sm text-right font-mono',
                  'bg-white border-2 transition-all duration-200',
                  'focus:outline-none',
                  formError
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-blue-500 hover:border-gray-300',
                ]"
                @input="onCashInput"
              />
            </div>

            <p v-if="formError" class="text-xs text-red-500 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ formError }}
            </p>

            <!-- Preview format rupiah -->
            <p v-if="form.openingCash" class="text-xs text-blue-600 font-medium">
              {{ formatRupiah(Number(form.openingCash)) }}
            </p>
          </div>

          <!-- Tombol mulai shift -->
          <BaseButton
            id="start-shift-btn"
            type="submit"
            :loading="loading"
            :disabled="loading"
            full-width
          >
            <span v-if="!loading">Mulai Shift</span>
            <span v-else>Memulai...</span>
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>
