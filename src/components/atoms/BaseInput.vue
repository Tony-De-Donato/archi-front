<template>
  <div
    class="base-input-wrapper"
    :class="{
      'has-error': error,
      'has-focus': isFocused,
      'disabled': disabled
    }"
  >
    <div v-if="$slots.prefix" class="icon-prefix">
      <slot name="prefix" />
    </div>
    
    <input
      ref="inputRef"
      class="input-element"
      v-bind="$attrs"
      :value="modelValue"
      :disabled="disabled"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />

    <div v-if="$slots.suffix" class="icon-suffix">
      <slot name="suffix" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: string | number;
  error?: boolean | string;
  disabled?: boolean;
}>(), {
  modelValue: '',
  disabled: false
});

defineEmits(['update:modelValue']);

const isFocused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

defineExpose({
  focus: () => inputRef.value?.focus()
});
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0 0.75rem;
  transition: all 0.2s ease;
}

.base-input-wrapper:hover:not(.disabled) {
  border-color: #d1d5db;
}

.has-focus {
  border-color: var(--shibui-orange) !important;
  box-shadow: 0 0 0 2px var(--shibui-light-orange);
}

.has-error {
  border-color: var(--color-danger) !important;
}

.has-error.has-focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.input-element {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.75rem 0.25rem;
  font-size: 1rem;
  color: var(--shibui-dark-gray);
  outline: none;
  width: 100%;
}

.input-element::placeholder {
  color: #9ca3af;
}

.icon-prefix {
  margin-right: 0.5rem;
  color: #9ca3af;
  display: flex;
}

.icon-suffix {
  margin-left: 0.5rem;
  color: #9ca3af;
  display: flex;
}
</style>
