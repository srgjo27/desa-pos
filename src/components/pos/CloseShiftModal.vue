<script setup>
import { ref, computed, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { supabase } from '@/services/supabase'
import { useShiftStore } from '@/stores/shiftStore'
import { useShift } from '@/composables/useShift'
import { useAuth } from '@/composables/useAuth'
import { formatRupiah } from '@/utils/formatCurrency'

const props = defineProps({
  isOpen: { type: Boolean, required: true }
})

const emit = defineEmits(['close'])

const shiftStore = useShiftStore()
const { closeShift } = useShift()
const { logout } = useAuth()

const loadingData = ref(false)
const processing = ref(false)
const errorMsg = ref('')

const cashSales = ref(0)
const closingCashRaw = ref('')
const notes = ref('')

const expectedCash = computed(() => {
  return shiftStore.openingCash + cashSales.value
})

const closingCash = computed(() => {
  return Number(closingCashRaw.value) || 0
})

const cashDifference = computed(() => {
  return closingCash.value - expectedCash.value
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal && shiftStore.shiftId) {
    closingCashRaw.value = ''
    notes.value = ''
    errorMsg.value = ''
    await fetchCashSales()
  }
})

async function fetchCashSales() {
  loadingData.value = true
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('grand_total')
      .eq('shift_id', shiftStore.shiftId)
      .eq('payment_method', 'CASH')

    if (error) throw error

    cashSales.value = data.reduce((sum, item) => sum + Number(item.grand_total), 0)
  } catch (err) {
    errorMsg.value = 'Gagal memuat rekap kasir. Periksa koneksi.'
  } finally {
    loadingData.value = false
  }
}

function handleInputCash(e) {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  closingCashRaw.value = raw
  e.target.value = raw ? Number(raw).toLocaleString('id-ID') : ''
}

async function submitCloseShift() {
  if (!closingCashRaw.value) {
    errorMsg.value = 'Uang fisik di laci harus diisi.'
    return
  }

  processing.value = true
  errorMsg.value = ''

  try {
    const res = await closeShift(
      shiftStore.shiftId,
      closingCash.value,
      expectedCash.value,
      notes.value
    )

    if (!res.success) {
      errorMsg.value = 'Gagal menutup shift. Silakan coba lagi.'
      processing.value = false
      return
    }

    emit('close')
    await logout()
  } catch (err) {
    errorMsg.value = err
    processing.value = false
  }
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-950/80 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto w-screen">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-middle transition-all">

              <!-- Header -->
              <div class="px-6 py-4 bg-green-600 text-white flex items-center justify-between">
                <DialogTitle as="h3" class="text-lg font-bold flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Tutup Shift Kasir
                </DialogTitle>
                <button @click="$emit('close')" :disabled="processing"
                  class="text-green-200 hover:text-white focus:outline-none">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Loader -->
              <div v-if="loadingData" class="p-8 text-center text-gray-500 font-bold flex flex-col items-center">
                <svg class="animate-spin h-8 w-8 text-green-500 mb-3" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memuat Rekap Penjualan...
              </div>

              <!-- Main Form -->
              <div v-else class="px-6 py-5">

                <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-4 border-gray-100 pb-2">
                  Ringkasan Sistem</p>

                <div class="space-y-3 mb-6">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-600 font-medium">Uang Modal Awal:</span>
                    <span class="font-bold text-gray-800">{{ formatRupiah(shiftStore.openingCash) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-600 font-medium">Penjualan Tunai:</span>
                    <span class="font-bold text-green-600">+ {{ formatRupiah(cashSales) }}</span>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span class="text-gray-700 font-semibold">Harusnya di Laci:</span>
                    <span class="font-black text-green-600 text-lg">{{ formatRupiah(expectedCash)
                    }}</span>
                  </div>
                </div>

                <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4 border-gray-100 pb-2">
                  Pengecekan Fisik</p>

                <!-- Input Fisik Laci -->
                <div class="mb-4">
                  <label class="block text-sm font-semibold text-gray-700 mb-1">
                    Hitung Uang Fisik di Laci Sekarang <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-500">Rp</span>
                    <input :value="closingCashRaw ? Number(closingCashRaw).toLocaleString('id-ID') : ''"
                      @input="handleInputCash" type="text" placeholder="0"
                      class="w-full text-right bg-white border border-gray-300 focus:border-green-500 rounded-lg pl-12 pr-4 py-3 font-semibold text-base focus:outline-none focus:ring-4 focus:ring-green-500/10">
                  </div>
                </div>

                <!-- Selisih Indikator -->
                <div v-if="closingCashRaw"
                  class="p-3 rounded-lg mb-4 text-sm font-semibold flex justify-between items-center border" :class="[
                    cashDifference === 0 ? 'bg-green-50 text-green-700 border-green-200' :
                      cashDifference > 0 ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-red-50 text-red-700 border-red-200'
                  ]">
                  <span>Selisih (Dibanding Sistem):</span>
                  <span>
                    {{ cashDifference > 0 ? '+' : '' }}{{ formatRupiah(Math.abs(cashDifference)) }}
                    <span v-if="cashDifference < 0" class="text-xs ml-1">(Minus)</span>
                    <span v-if="cashDifference > 0" class="text-xs ml-1">(Lebih)</span>
                  </span>
                </div>

                <!-- Notes -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Catatan Tambahan (Bila ada
                    selisih)</label>
                  <textarea v-model="notes" rows="2"
                    placeholder="Contoh: Ada uang palsu, dipakai untuk beli kresek, dsb."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"></textarea>
                </div>

                <!-- Error Message -->
                <div v-if="errorMsg"
                  class="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg border border-red-100 flex items-start gap-2">
                  <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ errorMsg }}</span>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                  <button @click="$emit('close')" :disabled="processing"
                    class="w-1/3 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold transition-colors focus:outline-none disabled:opacity-50">
                    Batal
                  </button>
                  <button @click="submitCloseShift" :disabled="processing || !closingCashRaw"
                    class="w-2/3 px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none flex justify-center items-center gap-2">
                    <svg v-if="processing" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none"
                      viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{{ processing ? 'Memproses...' : 'Akhiri Shift & Keluar' }}</span>
                  </button>
                </div>

              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
