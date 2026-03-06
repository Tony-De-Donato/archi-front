<template>
  <div class="logo-container" :class="[`size-${size}`]">
    <div class="logo-icon">
      <span class="logo-s">S</span>
    </div>
    <span class="logo-text">SHIBUI</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
}>(), {
  size: 'md'
});
</script>

<style scoped>
.logo-container {
  display: flex;
  align-items: center;
  text-decoration: none !important;
  color: inherit;
  user-select: none;
}

.logo-icon {
  background-color: var(--shibui-orange);
  border-radius: 9999px;
  text-decoration: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
}

.logo-s {
  color: white !important;
  font-weight: 900;
  line-height: 1;
  font-style: italic;
  text-decoration: none !important;
}

.logo-text {
  font-weight: 700;
  letter-spacing: -0.025em;
  text-decoration: none !important;
  color: var(--shibui-orange) !important;
}

/* Size variations */
.size-sm { gap: 0.25rem; }
.size-sm .logo-icon { width: 1.5rem; height: 1.5rem; }
.size-sm .logo-s { font-size: 0.875rem; }
.size-sm .logo-text { font-size: 1.125rem; }

.size-md { gap: 0.5rem; }
.size-md .logo-icon { width: 2.5rem; height: 2.5rem; }
.size-md .logo-s { font-size: 1.25rem; }
.size-md .logo-text { font-size: 1.875rem; }

.size-lg { gap: 0.75rem; }
.size-lg .logo-icon { width: 3rem; height: 3rem; }
.size-lg .logo-s { font-size: 1.5rem; }
.size-lg .logo-text { font-size: 2.25rem; }

.size-xl { gap: 1rem; }
.size-xl .logo-icon { width: 4rem; height: 4rem; }
.size-xl .logo-s { font-size: 1.875rem; }
.size-xl .logo-text { font-size: 3.75rem; }
</style>
