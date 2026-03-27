<script setup>
import { computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useSessionTimeout } from '@/composables/useSessionTimeout'

const { showWarning, timeRemaining, extendSession, logout } = useSessionTimeout()

const minutesRemaining = computed(() => {
    return Math.ceil(timeRemaining.value / 60000)
})

const secondsRemaining = computed(() => {
    return Math.floor((timeRemaining.value % 60000) / 1000)
})

const timeDisplay = computed(() => {
    return `${minutesRemaining.value}:${secondsRemaining.value.toString().padStart(2, '0')}`
})
</script>

<template>
    <TransitionRoot as="template" :show="showWarning">
        <Dialog as="div" class="relative z-50" @close="logout">
            <!-- Backdrop -->
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black bg-opacity-50" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 transition-all">
                            <!-- Warning Icon -->
                            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 9v2m0 4v2m0 4v2m0-14a9 9 0 110 18 9 9 0 010-18z" />
                                </svg>
                            </div>

                            <!-- Title & Message -->
                            <div class="mt-4 text-center">
                                <DialogTitle as="h3" class="text-lg font-bold text-gray-900">
                                    Sesi Anda Akan Berakhir
                                </DialogTitle>

                                <p class="mt-3 text-sm text-gray-600">
                                    Anda telah tidak aktif selama beberapa waktu. Sesi Anda akan berakhir dalam:
                                </p>

                                <!-- Time Countdown -->
                                <div class="mt-4 inline-flex items-center rounded-lg bg-yellow-50 px-4 py-3">
                                    <span class="font-mono text-2xl font-bold text-yellow-600">{{ timeDisplay }}</span>
                                    <span class="ml-2 text-sm text-yellow-600">menit</span>
                                </div>

                                <p class="mt-3 text-xs text-gray-500">
                                    Silakan klik "Tetap Login" untuk melanjutkan atau Anda akan secara otomatis logout.
                                </p>
                            </div>

                            <!-- Action Buttons -->
                            <div class="mt-6 flex gap-3">
                                <button @click="logout" type="button"
                                    class="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                                    Logout Sekarang
                                </button>
                                <button @click="extendSession" type="button"
                                    class="flex-1 rounded-md border border-transparent bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
                                    Tetap Login
                                </button>
                            </div>

                            <!-- Footer Info -->
                            <p class="mt-4 text-center text-xs text-gray-400">
                                Gerakan mouse atau tekan tombol untuk reset waktu
                            </p>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
