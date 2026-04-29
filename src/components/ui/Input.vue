<script setup>
import { computed } from 'vue'
import { useAttrs, useSlots } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  error: {
    type: String,
    default: '',
  },
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  autocomplete: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    required: true,
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
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const attrs = useAttrs()
const slots = useSlots()
const emit = defineEmits(['update:modelValue'])

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

const paddingClasses = computed(() => {
  const baseSize = props.size || 'md'
  const sizeMap = {
    sm: {
      defaultLeft: 'pl-2.5',
      defaultRight: 'pr-2.5',
      withPrefix: 'pl-9',
      withSuffix: 'pr-9',
    },
    md: {
      defaultLeft: 'pl-4',
      defaultRight: 'pr-4',
      withPrefix: 'pl-12',
      withSuffix: 'pr-12',
    },
    lg: {
      defaultLeft: 'pl-5',
      defaultRight: 'pr-5',
      withPrefix: 'pl-14',
      withSuffix: 'pr-14',
    },
  }

  const padding = sizeMap[baseSize] || sizeMap.md
  const paddingLeft = slots.prefix ? padding.withPrefix : padding.defaultLeft
  const paddingRight = slots.suffix ? padding.withSuffix : padding.defaultRight

  return `${paddingLeft} ${paddingRight}`
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm font-semibold text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <div class="relative">
      <input :id="id" :type="type" :value="modelValue" :placeholder="placeholder" :autocomplete="autocomplete"
        :disabled="disabled" :class="[
          'w-full text-gray-800 placeholder-gray-400',
          'bg-white border transition-all duration-200',
          'focus:outline-none focus:ring-0',
          sizeClasses,
          paddingClasses,
          roundedClasses,
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-gray-200 focus:border-green-500 hover:border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
          attrs.class,
        ]" @input="emit('update:modelValue', $event.target.value)" />

      <div v-if="$slots.prefix" class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-auto">
        <slot name="prefix" />
      </div>

      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-auto">
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" class="text-xs text-red-500 flex items-center gap-1">
      <i class="pi pi-info-circle" style="font-size: 12px;"></i>
      {{ error }}
    </p>
  </div>
</template>
