<template>
  <component
    :is="tag"
    :class="[
      'base-typography',
      `variant-${variant}`,
      { 'bold': bold, 'italic': italic, 'center': center }
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  tag?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'small' | 'caption' | 'label';
  bold?: boolean;
  italic?: boolean;
  center?: boolean;
}>(), {
  variant: 'p',
  bold: false,
  italic: false,
  center: false
});

const tag = computed(() => {
  if (props.tag) return props.tag;
  switch (props.variant) {
    case 'h1': return 'h1';
    case 'h2': return 'h2';
    case 'h3': return 'h3';
    case 'h4': return 'h4';
    case 'small':
    case 'caption': return 'small';
    case 'label': return 'label';
    default: return 'p';
  }
});
</script>

<style scoped>
.base-typography {
  margin: 0;
  color: var(--shibui-dark-gray);
  line-height: 1.5;
}

.bold { font-weight: 700; }
.italic { font-style: italic; }
.center { text-align: center; }

.variant-h1 {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.variant-h2 {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.3;
}

.variant-h3 {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.4;
}

.variant-h4 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
}

.variant-p {
  font-size: 1rem;
}

.variant-small {
  font-size: 0.875rem;
}

.variant-caption {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.variant-label {
  font-size: 0.875rem;
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
}
</style>
