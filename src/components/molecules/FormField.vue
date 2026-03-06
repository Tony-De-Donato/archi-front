<template>
  <div class="form-field">
    <BaseTypography
      v-if="label"
      tag="label"
      variant="label"
      :for="id"
    >
      {{ label }}
    </BaseTypography>
    
    <div class="input-wrapper">
      <slot>
        <BaseInput
          :id="id"
          v-bind="$attrs"
          :error="!!error"
        />
      </slot>
    </div>

    <BaseTypography
      v-if="error"
      variant="caption"
      class="error-message"
    >
      {{ error }}
    </BaseTypography>
    <BaseTypography
      v-else-if="helpText"
      variant="caption"
      class="help-text"
    >
      {{ helpText }}
    </BaseTypography>
  </div>
</template>

<script setup lang="ts">
import BaseTypography from '../atoms/BaseTypography.vue';
import BaseInput from '../atoms/BaseInput.vue';

defineProps<{
  label?: string;
  id?: string;
  error?: string;
  helpText?: string;
}>();
</script>

<style scoped>
.form-field {
  margin-bottom: 1.25rem;
  width: 100%;
}

.error-message {
  color: #ef4444;
  margin-top: 0.25rem;
}

.help-text {
  margin-top: 0.25rem;
}
</style>
