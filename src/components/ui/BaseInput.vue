<template>
  <div class="base-input-container">
    <label v-if="label" :for="id" class="input-label">
      {{ label }} <span v-if="required" class="required-mark">*</span>
    </label>
    <div class="input-wrapper">
      <div v-if="$slots.prefix" class="prefix-icon">
        <slot name="prefix" />
      </div>
      <input
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="input-field"
        :class="{
          'has-prefix': $slots.prefix,
          'has-suffix': $slots.suffix
        }"
        v-bind="$attrs"
      />
      <div v-if="$slots.suffix" class="suffix-icon">
        <slot name="suffix" />
      </div>
    </div>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  id?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  modelValue?: string | number;
  required?: boolean;
  error?: string;
}>(), {
  type: 'text',
  modelValue: ''
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--shibui-dark-gray);
  margin-left: 0.25rem;
}

.required-mark {
  color: var(--shibui-orange);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-xl);
  padding: 0.625rem 1rem;
  color: var(--shibui-dark-gray);
  font-size: 1rem;
  transition: border-color 0.2s;
  outline: none;
}

.input-field:focus {
  border-color: var(--shibui-orange);
}

.has-prefix {
  padding-left: 2.75rem;
}

.has-suffix {
  padding-right: 2.75rem;
}

.prefix-icon, .suffix-icon {
  position: absolute;
  display: flex;
  align-items: center;
  color: #9ca3af;
}

.prefix-icon {
  left: 1rem;
}

.suffix-icon {
  right: 1rem;
}

.error-message {
  font-size: 0.75rem;
  color: #ef4444;
  margin-left: 0.25rem;
  margin-top: 0.125rem;
}
</style>
