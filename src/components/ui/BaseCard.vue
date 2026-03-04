<template>
  <div
    class="base-card"
    :class="[`padding-${padding}`]"
  >
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-content">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  padding?: 'none' | 'sm' | 'md' | 'lg';
}>(), {
  padding: 'md'
});
</script>

<style scoped>
.base-card {
  background-color: white;
  border-radius: var(--radius-xl);
  border: 1px solid #f3f4f6;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.card-header {
  border-bottom: 1px solid #f9fafb;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}

.card-footer {
  border-top: 1px solid #f9fafb;
  margin-top: 1rem;
  padding-top: 1rem;
}

/* Padding variants */
.padding-none { padding: 0; }
.padding-sm { padding: 0.75rem; }
.padding-md { padding: 1.5rem; }
.padding-lg { padding: 2rem; }

/* If header/footer are present, content might need specific adjustment 
   but for now we follow the original logic where padding was on the container */
</style>
