<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost'].includes(v),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  rounded: {
    type: String,
    default: 'xl',
    validator: (v) => ['sm', 'md', 'lg', 'xl', 'full'].includes(v),
  },
})

const attrs = useAttrs()

const sizeClasses = computed(() => {
  const sizeMap = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  }
  return sizeMap[props.size] || sizeMap.md
})

const roundedClasses = computed(() => {
  const roundedMap = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }
  return roundedMap[props.rounded] || roundedMap.xl
})

const variantClasses = computed(() => {
  const variantMap = {
    primary: 'bg-green-600 hover:bg-green-500 text-white focus:ring-green-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white focus:ring-gray-600',
  }
  return variantMap[props.variant] || variantMap.primary
})

import { useAttrs } from 'vue'
</script>

<template>
  <button 
    :type="type" 
    :disabled="disabled || loading" 
    :class="[
      'inline-flex items-center justify-center gap-2 font-semibold',
      'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
      roundedClasses,
      fullWidth && 'w-full',
      variantClasses,
      attrs.class,
    ]"
  >
    <i v-if="loading" class="pi pi-spin pi-spinner" :style="{ fontSize: props.size === 'sm' ? '1rem' : props.size === 'lg' ? '1.5rem' : '1.25rem' }"></i>
    <slot />
  </button>
</template>