<template>
  <button
    :class="[
      'base-button',
      `variant-${variant}`,
      `size-${size}`,
      { 'full-width': fullWidth }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <template v-if="loading">
      <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </template>
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  loading: false,
  disabled: false
});
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  outline: none;
}

.base-button:active:not(:disabled) {
  transform: scale(0.95);
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.full-width {
  width: 100%;
}

/* Variants */
.variant-primary {
  background-color: var(--shibui-orange);
  color: white;
  box-shadow: var(--shadow-soft);
}
.variant-primary:hover:not(:disabled) {
  background-color: var(--shibui-orange-dark);
  box-shadow: var(--shadow-medium);
}

.variant-outline {
  background-color: transparent;
  border: 2px solid white;
  color: white;
}
.variant-outline:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
}

.variant-secondary {
  background-color: white;
  color: var(--shibui-dark-gray);
  border: 1px solid #e5e7eb;
}
.variant-secondary:hover:not(:disabled) {
  background-color: #f9fafb;
}

.variant-ghost {
  background-color: transparent;
  color: var(--shibui-orange);
}
.variant-ghost:hover:not(:disabled) {
  background-color: var(--shibui-light-orange);
}

/* Sizes */
.size-sm {
  padding: 0.375rem 1rem;
  font-size: 0.875rem;
}
.size-md {
  padding: 0.625rem 1.5rem;
  font-size: 1rem;
}
.size-lg {
  padding: 0.75rem 2rem;
  font-size: 1.125rem;
}
.size-xl {
  padding: 1rem 2.5rem;
  font-size: 1.25rem;
}

.spinner {
  animation: spin 1s linear infinite;
  margin-left: -0.25rem;
  margin-right: 0.75rem;
  height: 1.25rem;
  width: 1.25rem;
  color: currentColor;
}

.opacity-25 { opacity: 0.25; }
.opacity-75 { opacity: 0.75; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
