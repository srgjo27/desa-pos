<script setup>
import { ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useCartStore } from '@/stores/cartStore'
import { useCheckout } from '@/composables/useCheckout'
import { formatRupiah } from '@/utils/formatCurrency'

const props = defineProps({
  isOpen: { type: Boolean, required: true }
})

const emit = defineEmits(['close', 'checkout-success'])
const cartStore = useCartStore()
const { processCheckout, loading, error } = useCheckout()

const amountPaidRaw = ref('')
const paymentMethod = ref('CASH')
const transactionDiscountRaw = ref('')

const amountPaid = computed(() => Number(amountPaidRaw.value) || 0)

const transactionDiscount = computed(() => Number(transactionDiscountRaw.value) || 0)

const grandTotal = computed(() => {
  const subtotal = cartStore.subtotalAfterItemDiscount
  const maxDiscount = subtotal
  return Math.max(0, subtotal - Math.min(transactionDiscount.value, maxDiscount))
})

const changeAmount = computed(() => amountPaid.value - grandTotal.value)

const isCashEnough = computed(() => {
  if (paymentMethod.value !== 'CASH') return true
  return amountPaid.value >= grandTotal.value
})

function onCashInput(e) {
  const raw = e.target.value.replace(/\D/g, '')
  amountPaidRaw.value = raw
  e.target.value = raw ? Number(raw).toLocaleString('id-ID') : ''
}

function onDiscountInput(e) {
  const raw = e.target.value.replace(/\D/g, '')
  transactionDiscountRaw.value = raw
  e.target.value = raw ? Number(raw).toLocaleString('id-ID') : ''
  cartStore.setTransactionDiscount(Number(raw) || 0)
}

const quickNominals = computed(() => {
  const total = grandTotal.value
  const options = new Set([total])

  if (total < 50000) options.add(50000)
  if (total < 100000) options.add(100000)

  const round50 = Math.ceil(total / 50000) * 50000
  const round100 = Math.ceil(total / 100000) * 100000
  options.add(round50)
  options.add(round100)

  return Array.from(options).sort((a, b) => a - b).slice(0, 4)
})

function setQuickCash(nominal) {
  paymentMethod.value = 'CASH'
  amountPaidRaw.value = nominal.toString()
}

function handleClose() {
  amountPaidRaw.value = ''
  transactionDiscountRaw.value = ''
  paymentMethod.value = 'CASH'
  cartStore.setTransactionDiscount(0)
  emit('close')
}

async function handleCheckout() {
  if (!isCashEnough.value) return

  const payload = {
    amountPaid: paymentMethod.value === 'CASH' ? amountPaid.value : grandTotal.value,
    paymentMethod: paymentMethod.value,
    transactionDiscount: transactionDiscount.value,
    customerPhone: '',
    notes: ''
  }

  const result = await processCheckout(payload)
  if (result.success) {
    emit('checkout-success', result.receiptData)
    handleClose()
  }
}
</script>

<template>
  <TransitionRoot as="template" :show="props.isOpen">
    <Dialog as="div" class="relative z-50" @close="handleClose">
      <!-- Backdrop -->
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform overflow-hidden rounded-2xl bg-white text-left transition-all sm:my-8 sm:w-full sm:max-w-lg w-full">

              <!-- Header -->
              <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <DialogTitle as="h3" class="text-xl font-bold text-gray-800 flex items-center gap-2">
                  Proses Pembayaran
                </DialogTitle>
                <button @click="handleClose"
                  class="text-gray-400 hover:text-gray-600 focus:outline-none p-1 bg-white rounded-md border border-gray-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div class="px-6 py-6 space-y-6">

                <div v-if="cartStore.subtotalBeforeDiscount > 0" class="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-bold text-gray-800">{{ formatRupiah(cartStore.subtotalBeforeDiscount) }}</span>
                  </div>
                  <div v-if="cartStore.totalItemDiscounts > 0" class="flex justify-between text-sm">
                    <span class="text-gray-600">Diskon Item</span>
                    <span class="font-bold text-orange-600">-{{ formatRupiah(cartStore.totalItemDiscounts) }}</span>
                  </div>
                  <div v-if="cartStore.totalItemDiscounts > 0"
                    class="border-t border-gray-200 pt-2 flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal Setelah Diskon Item</span>
                    <span class="font-bold text-gray-800">{{ formatRupiah(cartStore.subtotalAfterItemDiscount) }}</span>
                  </div>
                </div>

                <div class="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <label class="text-sm font-bold text-amber-700 block mb-2">
                    Diskon Transaksi (Manual)
                  </label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                    <input type="text" placeholder="0" @input="onDiscountInput"
                      class="w-full bg-amber-100 border border-amber-200 rounded-lg pl-12 pr-4 py-3 text-lg font-bold text-amber-900 placeholder-amber-300 focus:outline-none focus:bg-white focus:border-amber-400 transition-colors" />
                  </div>
                  <p class="text-xs text-amber-600 mt-2">Kasir kasih diskon / potongan harga untuk pembeli</p>
                </div>

                <!-- Total Section -->
                <div class="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
                  <p class="text-sm font-semibold text-blue-600 mb-1">Total Tagihan ({{ cartStore.totalItems }} Item)
                  </p>
                  <p class="text-4xl font-black text-blue-700 tracking-tight">{{ formatRupiah(grandTotal) }}</p>
                </div>

                <!-- Error Alert -->
                <div v-if="error"
                  class="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2">
                  <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{{ error }}</span>
                </div>

                <!-- Payment Methods Toggle -->
                <div class="flex bg-gray-100 p-1 rounded-xl">
                  <button @click="paymentMethod = 'CASH'"
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-colors focus:outline-none"
                    :class="paymentMethod === 'CASH' ? 'bg-white text-gray-800' : 'text-gray-500 hover:text-gray-700'">Tunai
                    (Cash)</button>
                  <button @click="paymentMethod = 'QRIS'"
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-colors focus:outline-none"
                    :class="paymentMethod === 'QRIS' ? 'bg-white text-gray-800' : 'text-gray-500 hover:text-gray-700'">QRIS</button>
                  <button @click="paymentMethod = 'TRANSFER'"
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-colors focus:outline-none"
                    :class="paymentMethod === 'TRANSFER' ? 'bg-white text-gray-800' : 'text-gray-500 hover:text-gray-700'">Transfer</button>
                </div>

                <!-- Cash Options -->
                <div v-if="paymentMethod === 'CASH'" class="space-y-4 animate-in fade-in slide-in-from-top-2">

                  <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-bold text-gray-700">Uang Diterima dari Pelanggan</label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                      <input :value="amountPaidRaw ? Number(amountPaidRaw).toLocaleString('id-ID') : ''"
                        @input="onCashInput" type="text" inputmode="numeric"
                        class="w-full bg-white border-2 border-gray-200 focus:border-blue-500 rounded-xl py-3 pl-12 pr-4 text-right font-bold text-lg text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                        placeholder="0" autofocus />
                    </div>
                  </div>

                  <!-- Quick Cash Buttons -->
                  <div class="grid grid-cols-4 gap-2">
                    <button v-for="nom in quickNominals" :key="nom" @click="setQuickCash(nom)"
                      class="py-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-700 hover:text-blue-700 font-bold text-sm rounded-lg transition-colors"
                      type="button">
                      <span v-if="nom === grandTotal">Uang Pas</span>
                      <span v-else>{{ (nom / 1000).toLocaleString('id-ID') }}k</span>
                    </button>
                  </div>

                  <!-- Change Calculator -->
                  <div class="flex items-center justify-between p-4 rounded-xl border"
                    :class="changeAmount >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'">
                    <span class="font-bold" :class="changeAmount >= 0 ? 'text-green-700' : 'text-red-700'">
                      {{ changeAmount >= 0 ? 'Uang Kembalian' : 'Kurang Bayar' }}
                    </span>
                    <span class="text-xl font-black font-mono tracking-tighter"
                      :class="changeAmount >= 0 ? 'text-green-700' : 'text-red-700'">
                      {{ formatRupiah(Math.abs(changeAmount)) }}
                    </span>
                  </div>
                </div>

                <!-- Non-Cash Options Info -->
                <div v-else class="text-center py-6 pb-2 animate-in fade-in zoom-in-95">
                  <div class="w-20 h-20 bg-blue-50 rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h4 class="font-bold text-gray-800">Pembayaran Non-Tunai</h4>
                  <p class="text-sm text-gray-500 mt-2 px-8">Pastikan pelanggan telah melakukan transfer atau scan QRIS
                    sesuai nominal tagihan <strong class="text-gray-700">{{ formatRupiah(grandTotal) }}</strong> sebelum
                    memproses.</p>
                </div>

              </div>

              <!-- Footer Actions -->
              <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button type="button" @click="handleClose"
                  class="flex-1 px-4 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors focus:outline-none">
                  Batal
                </button>
                <button type="button" @click="handleCheckout" :disabled="!isCashEnough || loading"
                  class="flex-1 px-4 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none flex justify-center items-center gap-2">
                  <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>{{ loading ? 'Memproses...' : 'Proses Transaksi' }}</span>
                </button>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
