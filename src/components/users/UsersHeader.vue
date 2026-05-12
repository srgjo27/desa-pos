<script setup>
import { computed } from 'vue'
import { Input } from '@/components/ui'

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: 'Pengguna Sistem',
    },
    subtitle: {
        type: String,
        default: 'Daftar akun pengawas (Admin) dan pelayan masyarakat (Kasir).',
    },
    placeholder: {
        type: String,
        default: 'Cari nama, no. pegawai, atau role...',
    },
})

const emit = defineEmits(['update:modelValue'])

const searchValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
})
</script>

<template>
    <div class="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h2 class="text-lg font-bold">{{ title }}</h2>
            <p class="text-sm text-gray-500">{{ subtitle }}</p>
        </div>
        <div class="w-full sm:max-w-xs">
            <Input id="user-search" v-model="searchValue" type="text" size="sm" rounded="md" autocomplete="off"
                :placeholder="placeholder" class="w-full">
                <template #prefix>
                    <i class="pi pi-search text-gray-400" style="font-size: 12px"></i>
                </template>
            </Input>
        </div>
    </div>
</template>
