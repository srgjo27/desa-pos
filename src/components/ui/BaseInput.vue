<script setup>
defineProps({
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
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      :for="id"
      class="text-xs font-semibold text-gray-400 uppercase tracking-widest"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :class="[
          'w-full rounded-xl px-4 py-3 text-sm',
          'bg-gray-800/60 text-gray-100 placeholder-gray-500',
          'border transition-all duration-200',
          'focus:outline-none focus:ring-2',
          error
            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
            : 'border-gray-700/60 focus:border-blue-500 focus:ring-blue-500/30',
        ]"
        @input="emit('update:modelValue', $event.target.value)"
      />
      <!-- Slot untuk suffix (misal: toggle password) -->
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" class="text-xs text-red-400 flex items-center gap-1">
      <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
    </p>
  </div>
</template>
