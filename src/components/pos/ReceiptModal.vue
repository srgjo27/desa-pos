<script setup>
import { ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import html2canvas from 'html2canvas'
import { formatRupiah } from '@/utils/formatCurrency'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  receiptData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])
const receiptRef = ref(null)
const isPrinting = ref(false)

function formatDateRange(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function handlePrint() {
  window.print()
}

async function handleDownloadImage() {
  if (!receiptRef.value) return
  isPrinting.value = true

  try {
    const canvas = await html2canvas(receiptRef.value, {
      scale: 2,
      backgroundColor: '#ffffff'
    })

    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    link.download = `Struk_DesaPOS_${props.receiptData.saleId?.split('-')[0] || 'Transaksi'}.png`
    link.click()
  } catch (err) {
    console.error('Gagal membuat gambar struk:', err)
    alert('Maaf, gagal mengunduh gambar struk.')
  } finally {
    isPrinting.value = false
  }
}

function handleSendWhatsApp() {
  const data = props.receiptData
  if (!data || !data.items) return

  let text = `*DESAPOS - BUMDes*\n`
  text += `Jl. Desa Mandiri No. 1\n`
  text += `--------------------------------\n`
  text += `No: ${data.saleId?.split('-')[0].toUpperCase()}\n`
  text += `Tgl: ${formatDateRange(data.createdAt)}\n`
  text += `Kasir: ${data.cashierName}\n`
  text += `--------------------------------\n`

  data.items.forEach(item => {
    text += `${item.name}\n`
    text += `${item.qty} x ${item.price.toLocaleString('id-ID')} = ${(item.qty * item.price).toLocaleString('id-ID')}\n`
  })

  text += `--------------------------------\n`
  text += `Total     : Rp ${data.grandTotal?.toLocaleString('id-ID')}\n`
  text += `Dibayar   : Rp ${data.amountPaid?.toLocaleString('id-ID')} (${data.paymentMethod})\n`
  if (data.changeAmount > 0) {
    text += `Kembalian : Rp ${data.changeAmount?.toLocaleString('id-ID')}\n`
  }
  text += `--------------------------------\n`
  text += `Terima kasih atas kunjungannya!\n`

  const encodedText = encodeURIComponent(text)
  const phoneUrl = data.customerPhone ? `${data.customerPhone}?text=${encodedText}` : `?text=${encodedText}`
  window.open(`https://wa.me/${phoneUrl}`, '_blank')
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <TransitionRoot as="template" :show="props.isOpen">
    <Dialog as="div" class="relative z-50" @close="handleClose">
      <!-- Backdrop -->
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity print:hidden" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto print:static print:overflow-visible">
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0 print:p-0">
          <TransitionChild as="template" enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">

            <DialogPanel
              class="relative transform overflow-hidden rounded-2xl bg-white text-left transition-all sm:my-8 w-full max-w-sm print:transform-none print:w-full print:max-w-none print:m-0">

              <!-- Struk Container (Yang Akan Di-Print / Capture) -->
              <div ref="receiptRef" class="bg-white p-6 md:p-8 font-mono text-sm text-gray-800"
                style="width: 100%; max-width: 400px; margin: 0 auto;">
                <!-- Kop Struk -->
                <div class="text-center mb-6">
                  <h2 class="font-black text-xl mb-1">DESAPOS</h2>
                  <p class="text-xs text-gray-500">BUMDes Maju Bersama</p>
                  <p class="text-xs text-gray-500">Jl. Desa Mandiri No. 1, Kab. Sejahtera</p>
                </div>

                <!-- Info Basic -->
                <div class="text-xs mb-4 border-b border-dashed border-gray-300 pb-4 space-y-1">
                  <div class="flex justify-between">
                    <span class="text-gray-500">No.</span>
                    <span class="font-bold">{{ props.receiptData.saleId?.split('-')[0].toUpperCase() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Waktu</span>
                    <span>{{ formatDateRange(props.receiptData.createdAt) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Kasir</span>
                    <span>{{ props.receiptData.cashierName }}</span>
                  </div>
                </div>

                <!-- Item / Barang -->
                <div class="space-y-3 mb-4 border-b border-dashed border-gray-300 pb-4">
                  <div v-for="item in props.receiptData.items" :key="item.product_id" class="text-xs">
                    <div class="font-bold mb-0.5">{{ item.name }}</div>
                    <div class="flex justify-between text-gray-600">
                      <span>{{ item.qty }} x {{ item.price.toLocaleString('id-ID') }}</span>
                      <span class="font-bold text-gray-800">{{ (item.qty * item.price).toLocaleString('id-ID') }}</span>
                    </div>
                    <!-- ✅ BARU: Tampilkan diskon per item jika ada -->
                    <div v-if="item.itemDiscount > 0" class="flex justify-between text-orange-600 text-xs mt-0.5">
                      <span>Diskon ({{ item.qty }} × {{ item.itemDiscount.toLocaleString('id-ID') }})</span>
                      <span class="font-bold">-{{ (item.itemDiscount * item.qty).toLocaleString('id-ID') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Kalkulasi Akhir -->
                <div class="space-y-1 text-xs mb-6">
                  <div class="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{{ formatRupiah(props.receiptData.subtotalBeforeDiscount || props.receiptData.totalAmount ||
                      0) }}</span>
                  </div>
                  <!-- ✅ BARU: Diskon Per Item -->
                  <div v-if="props.receiptData.totalItemDiscounts > 0" class="flex justify-between text-orange-600">
                    <span>Dis. Item</span>
                    <span>-{{ formatRupiah(props.receiptData.totalItemDiscounts) }}</span>
                  </div>
                  <!-- ✅ BARU: Diskon Transaksional -->
                  <div v-if="props.receiptData.discountAmount > 0" class="flex justify-between text-orange-600">
                    <span>Dis. Transaksi</span>
                    <span>-{{ formatRupiah(props.receiptData.discountAmount) }}</span>
                  </div>
                  <div class="flex justify-between font-black text-[15px] pt-1 mt-1 border-t border-gray-200">
                    <span>TOTAL</span>
                    <span>{{ formatRupiah(props.receiptData.grandTotal || 0) }}</span>
                  </div>

                  <div class="flex justify-between pt-2">
                    <span class="text-gray-500">Tunai ({{ props.receiptData.paymentMethod }})</span>
                    <span>{{ formatRupiah(props.receiptData.amountPaid || 0) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Kembalian</span>
                    <span>{{ formatRupiah(props.receiptData.changeAmount || 0) }}</span>
                  </div>
                </div>

                <!-- Footer -->
                <div class="text-center text-[10px] text-gray-400">
                  <p>Terima Kasih Atas Kunjungan Anda</p>
                  <p class="mt-1">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
                </div>
              </div>

              <!-- Action Buttons (Hidden when printing) -->
              <div class="bg-gray-50 p-4 border-t border-gray-200 flex flex-col gap-2 print:hidden">

                <div class="grid grid-cols-2 gap-2 mb-2">
                  <button @click="handlePrint"
                    class="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors focus:outline-none">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Struk
                  </button>
                  <button @click="handleDownloadImage" :disabled="isPrinting"
                    class="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors focus:outline-none disabled:opacity-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Simpan PNG
                  </button>
                </div>

                <button @click="handleSendWhatsApp"
                  class="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-lg text-sm font-bold hover:bg-[#128C7E] transition-colors focus:outline-none mb-3">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  Kirim Nota ke WhatsApp
                </button>

                <button @click="handleClose"
                  class="w-full text-center py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors focus:outline-none">Tutup
                  Salinan & Lanjut Jualan</button>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }

  .print\:static,
  .print\:static * {
    visibility: visible;
  }

  .print\:hidden {
    display: none !important;
  }

  .print\:static {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
