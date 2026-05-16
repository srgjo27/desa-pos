<script setup>
import { computed } from "vue";
import { Input, Button } from "@/components/ui";

const props = defineProps({
  startDate: {
    type: String,
    default: "",
  },
  endDate: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:startDate",
  "update:endDate",
  "apply",
  "reset",
]);

const startDateModel = computed({
  get: () => props.startDate,
  set: (value) => emit("update:startDate", value),
});

const endDateModel = computed({
  get: () => props.endDate,
  set: (value) => emit("update:endDate", value),
});
</script>

<template>
  <div
    class="bg-white p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-end gap-4 mb-6"
  >
    <div class="w-full sm:w-auto flex-1 max-w-xs">
      <label
        class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5"
        for="analytics-start-date"
      >
        Mulai Tanggal
      </label>
      <Input
        id="analytics-start-date"
        v-model="startDateModel"
        type="date"
        size="sm"
        rounded="lg"
        autocomplete="off"
        class="bg-gray-50"
      />
    </div>
    <div class="w-full sm:w-auto flex-1 max-w-xs">
      <label
        class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5"
        for="analytics-end-date"
      >
        Sampai Tanggal
      </label>
      <Input
        id="analytics-end-date"
        v-model="endDateModel"
        type="date"
        size="sm"
        rounded="lg"
        autocomplete="off"
        class="bg-gray-50"
      />
    </div>

    <div class="w-full sm:w-auto flex gap-2">
      <Button
        @click="emit('apply')"
        :loading="loading"
        :disabled="loading"
        size="sm"
        rounded="md"
      >
        Terapkan
      </Button>
      <Button
        @click="emit('reset')"
        :disabled="loading"
        variant="secondary"
        size="sm"
        rounded="md"
      >
        Reset Filter
      </Button>
    </div>
  </div>
</template>
