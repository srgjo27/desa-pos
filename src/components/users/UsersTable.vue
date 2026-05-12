<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatCurrency'

const props = defineProps({
    users: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    searchQuery: {
        type: String,
        default: '',
    },
    currentPage: {
        type: Number,
        default: 1,
    },
    itemsPerPage: {
        type: Number,
        default: 20,
    },
    isToggling: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['view', 'toggle', 'delete'])

const emptyMessage = computed(() => {
    return props.searchQuery
        ? 'Tidak ditemukan pengguna yang cocok.'
        : 'Belum ada pengguna yang terdaftar.'
})
</script>

<template>
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-700">
                <thead
                    class="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider font-bold">
                    <tr>
                        <th class="px-6 py-4 w-12 border-r border-gray-100 text-center">No</th>
                        <th class="px-6 py-4">Nama Pengguna</th>
                        <th class="px-6 py-4 border-l border-gray-100">No. Pegawai</th>
                        <th class="px-6 py-4 border-l border-gray-100">Peran Pribadi</th>
                        <th class="px-6 py-4 border-l border-gray-100">Tgl Terdaftar</th>
                        <th class="px-6 py-4 text-center border-l border-gray-100 w-36">Status Akun</th>
                        <th class="px-6 py-4 text-center border-l border-gray-100 w-44">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="loading">
                        <td colspan="7" class="px-6 py-12 text-center text-gray-400 font-medium">
                            Mengunduh data karyawan...
                        </td>
                    </tr>
                    <tr v-else-if="users.length === 0">
                        <td colspan="7" class="px-6 py-12 text-center text-gray-400 font-medium">
                            {{ emptyMessage }}
                        </td>
                    </tr>
                    <tr v-else v-for="(user, idx) in users" :key="user.id"
                        class="hover:bg-gray-50/80 transition-colors group">
                        <td class="px-6 py-4 text-center text-gray-400 font-bold border-r border-gray-100">
                            {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                        </td>
                        <td class="px-6 py-4 font-semibold border-r border-gray-100">
                            <button @click="emit('view', user)"
                                class="flex items-center gap-3 text-left w-full hover:bg-gray-50 focus:outline-none p-1.5 -ml-1.5 rounded-lg transition-colors group">
                                <div v-if="user.img_url"
                                    class="w-8 h-8 rounded-full border border-gray-200 overflow-hidden shrink-0 group-hover:border-green-300 transition-colors">
                                    <img :src="user.img_url" alt="Avatar" class="w-full h-full object-cover" />
                                </div>
                                <div v-else
                                    class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm border border-blue-200 shrink-0 group-hover:bg-blue-200 transition-colors">
                                    {{ user.name.charAt(0).toUpperCase() }}
                                </div>
                                <span class="group-hover:text-green-700 transition-colors">{{ user.name }}</span>
                            </button>
                        </td>
                        <td class="px-6 py-4 font-mono text-sm text-gray-600 border-l border-gray-100">
                            {{ user.employee_number || '-' }}
                        </td>
                        <td class="px-6 py-4 border-l border-gray-100">
                            <span
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border"
                                :class="user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-orange-50 text-orange-700 border-orange-200'">
                                <svg v-if="user.role === 'ADMIN'" class="w-3.5 h-3.5" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {{ user.role }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-gray-500 font-medium text-sm border-l border-gray-100">
                            {{ formatDate(user.created_at) }}
                        </td>
                        <td class="px-6 py-4 text-center border-l border-gray-100">
                            <span
                                class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black border"
                                :class="user.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'">
                                <span class="w-1.5 h-1.5 rounded-full mr-2"
                                    :class="user.is_active ? 'bg-green-500' : 'bg-red-500'"></span>
                                {{ user.is_active ? 'AKTIF' : 'NON-AKTIF' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center border-l border-gray-100">
                            <div v-if="user.role === 'KASIR'" class="flex items-center justify-center gap-2">
                                <button @click="emit('toggle', user)" :disabled="isToggling"
                                    class="px-2.5 py-1.5 rounded-md text-xs font-bold border transition-colors focus:outline-none flex items-center gap-1.5 disabled:opacity-50"
                                    :class="user.is_active ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'">
                                    <svg v-if="user.is_active" class="w-3.5 h-3.5" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                    {{ user.is_active ? 'Blokir' : 'Aktifkan' }}
                                </button>
                                <button @click="emit('delete', user)" title="Hapus Pengguna"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 focus:outline-none transition-colors">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
