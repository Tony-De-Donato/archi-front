<template>
  <BaseCard class="job-card" :hoverable="true">
    <div class="job-card-header">
      <div class="job-info-ctn">
        <BaseTypography variant="h4">{{ job.title }}</BaseTypography>
        <BaseTypography variant="small" color="light">{{ job.companyName }}</BaseTypography>
        <BaseTypography variant="caption" color="light">{{ job.location }}</BaseTypography>
      </div>
      <div class="job-actions">
      </div>
    </div>
    
    <div class="job-badges">
      <BaseBadge v-if="job.salary" variant="success">
        <BaseIcon name="check" size="12" /> {{ job.salary }}
      </BaseBadge>
      <BaseBadge v-if="job.schedule" variant="success">
        <BaseIcon name="check" size="12" /> {{ job.schedule }}
      </BaseBadge>
      <BaseBadge v-if="job.easyApply" variant="primary">
        <BaseIcon name="check" size="12" /> Entreprise Vérifiée
      </BaseBadge>
    </div>

    <div class="job-card-footer">
      <BaseTypography variant="caption" class="ad-label">Annonce</BaseTypography>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '../atoms/BaseCard.vue';
import BaseTypography from '../atoms/BaseTypography.vue';
import BaseBadge from '../atoms/BaseBadge.vue';
import BaseIcon from '../atoms/BaseIcon.vue';

defineProps<{
  job: {
    id: string | number;
    title: string;
    companyName: string | undefined;
    location: string;
    salary?: string;
    schedule?: string;
    easyApply?: boolean;
  }
}>();
</script>

<style scoped>
.job-card {
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.job-card-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.job-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.job-card-footer {
  border-top: 1px solid #f3f4f6;
  padding-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-info-ctn{
  display: flex;
  flex-direction: column;
}

.ad-label {
  color: #9ca3af;
}
</style>
