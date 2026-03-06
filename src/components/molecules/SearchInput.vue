<template>
  <div class="search-input">
    <BaseIcon :name="icon" class="search-icon" />
    <input
      v-bind="$attrs"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="input-element"
    />
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';

withDefaults(defineProps<{
  modelValue?: string;
  icon?: 'search' | 'location';
}>(), {
  modelValue: '',
  icon: 'search'
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.search-input {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  transition: all 0.2s;
  width: 100%;
}

.search-input:focus-within {
  border-color: var(--shibui-orange);
  box-shadow: 0 0 0 2px var(--shibui-light-orange);
}

.search-icon {
  color: var(--color-text-light);
  margin-right: 0.75rem;
}

.input-element {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  color: var(--shibui-dark-gray);
}

.input-element::placeholder {
  color: #9ca3af;
}
</style>
