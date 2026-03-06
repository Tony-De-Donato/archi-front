<template>
  <div class="main-layout">
    <slot name="header">
      <AppHeader
        :is-authenticated="isAuthenticated"
        :user-email="userEmail"
        :user-role="userRole"
        @logout="$emit('logout')"
      />
    </slot>

    <main :class="['main-content', { 'container': !fullWidth }]">
      <slot />
    </main>

  </div>
</template>

<script setup lang="ts">
import AppHeader from '../organisms/AppHeader.vue';
import BaseTypography from '../atoms/BaseTypography.vue';

withDefaults(defineProps<{
  isAuthenticated: boolean;
  userEmail?: string;
  userRole?: string;
  fullWidth?: boolean;
}>(), {
  fullWidth: false
});

defineEmits(['logout']);
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--shibui-gray);
}

.main-content {
  flex: 1;
}

.main-content.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
}

.app-footer {
  padding: 2rem 0;
  background: white;
  border-top: 1px solid var(--color-border);
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
</style>
