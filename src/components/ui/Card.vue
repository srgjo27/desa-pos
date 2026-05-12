<script setup>
import { computed } from 'vue'
import { useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  padding: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  rounded: {
    type: String,
    default: 'lg',
    validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v),
  },
  bordered: {
    type: Boolean,
    default: true,
  },
  shadow: {
    type: Boolean,
    default: false,
  },
})

const attrs = useAttrs()

const paddingClasses = computed(() => {
  const paddingMap = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }
  return paddingMap[props.padding] || paddingMap.md
})

const roundedClasses = computed(() => {
  const roundedMap = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  }
  return roundedMap[props.rounded] || roundedMap.lg
})

const cardClasses = computed(() => [
  'bg-white',
  props.bordered && 'border border-gray-200',
  props.shadow && 'shadow-sm',
  roundedClasses.value,
])
</script>

<template>
  <div v-bind="attrs" :class="cardClasses">
    <div v-if="title || subtitle || $slots.header" :class="[paddingClasses, 'border-b border-gray-100']">
      <slot name="header">
        <div class="flex flex-col gap-1">
          <p class="text-sm font-semibold">{{ title }}</p>
          <p v-if="subtitle" class="text-xs text-gray-500">{{ subtitle }}</p>
        </div>
      </slot>
    </div>

    <div v-if="$slots.default" :class="paddingClasses">
      <slot />
    </div>

    <div v-if="$slots.footer" :class="[paddingClasses, 'border-t border-gray-100']">
      <slot name="footer" />
    </div>
  </div>
</template>
