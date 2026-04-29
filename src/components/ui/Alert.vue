<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (v) => ['success', 'error', 'warning', 'info'].includes(v),
  },
  message: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const alertClasses = computed(() => {
  const typeMap = {
    success: {
      container: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-600',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
    },
  }
  return typeMap[props.type] || typeMap.info
})

const iconMap = {
  success: 'pi-check-circle',
  error: 'pi-info-circle',
  warning: 'pi-exclamation-triangle',
  info: 'pi-info-circle',
}
</script>

<template>
  <div v-if="message" :class="[
    'flex items-start gap-3 border rounded-xl px-4 py-3 text-sm',
    alertClasses.container,
    alertClasses.text,
  ]" role="alert">
    <div class="flex items-center justify-center shrink-0 mt-0.5">
      <i :class="['pi', iconMap[type]]" :style="{ fontSize: '1rem', color: 'currentColor' }" />
    </div>

    <div class="flex-1">
      <p v-if="title" class="font-semibold mb-1">{{ title }}</p>
      <p>{{ message }}</p>
    </div>

    <button v-if="dismissible" type="button" @click="emit('close')" :aria-label="`Tutup ${type} alert`"
      class="shrink-0 hover:opacity-70 transition-opacity p-1 focus:outline-none self-center">
      <i class="pi pi-times" style="font-size: 1rem" />
    </button>
  </div>
</template>
