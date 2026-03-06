<template>
  <span
    :class="[
      'base-badge',
      `variant-${variant}`
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light';
}>(), {
  variant: 'light'
});
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.variant-primary {
  background-color: var(--shibui-light-orange);
  color: var(--shibui-orange);
}

.variant-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.variant-success {
  background-color: #d1fae5;
  color: #065f46;
}

.variant-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.variant-danger {
  background-color: #fee2e2;
  color: #991b1b;
}

.variant-info {
  background-color: #e0f2fe;
  color: #075985;
}

.variant-light {
  background-color: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}
</style>
