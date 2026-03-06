<template>
  <MainLayout
    :is-authenticated="!!user"
    :user-email="user?.email"
    :user-role="user?.role"
    @logout="logout"
  >
    <div class="applications-container">
      <header class="page-header">
        <BaseTypography variant="h2" bold>Mes Candidatures</BaseTypography>
        <BaseTypography variant="p" color="light">
          Retrouvez ici toutes les offres auxquelles vous avez postulé et suivez leur avancement.
        </BaseTypography>
      </header>

      <div v-if="loading" class="loading-state">
        <BaseTypography variant="p">Chargement de vos candidatures...</BaseTypography>
      </div>

      <div v-else-if="applications.length === 0" class="empty-state">
        <BaseIcon name="briefcase" size="64" class="empty-icon" />
        <BaseTypography variant="h4" center>Vous n'avez pas encore postulé.</BaseTypography>
        <BaseTypography variant="p" color="light" center>
          Parcourez les offres disponibles et trouvez celle qui vous correspond !
        </BaseTypography>
        <BaseButton variant="primary" @click="router.push('/offers')">Voir les offres</BaseButton>
      </div>

      <div v-else class="applications-grid">
        <BaseCard v-for="app in applications" :key="app.id" class="application-card">
          <div class="card-content">
            <div class="job-info">
              <BaseTypography variant="h3" bold>{{ getOfferTitle(app) }}</BaseTypography>
              <BaseTypography variant="p" color="light" class="company-name">
                {{ getCompanyName(app) }}
              </BaseTypography>
              <div class="meta-info">
                <BaseTypography variant="caption" color="light">
                  <BaseIcon name="location" size="14" /> {{ getOfferLocation(app) }}
                </BaseTypography>
                <BaseTypography v-if="getOfferType(app)" variant="caption" color="light">
                  <BaseIcon name="briefcase" size="14" /> {{ getOfferType(app) }}
                </BaseTypography>
                <BaseTypography variant="caption" color="light">
                  <BaseIcon name="calendar" size="14" /> Postulé le {{ formatDate(app.createdAt) }}
                </BaseTypography>
              </div>
            </div>
            
            <div class="status-section">
              <BaseBadge :variant="getStatusVariant(app.status)" size="lg">
                {{ formatStatus(app.status) }}
              </BaseBadge>
              
<!--              <BaseButton -->
<!--                v-if="app.status === 'SUBMITTED' || app.status === 'PENDING'" -->
<!--                variant="ghost" -->
<!--                size="sm" -->
<!--                class="cancel-btn"-->
<!--                @click="handleCancel(app.id)"-->
<!--              >-->
<!--                Annuler ma candidature-->
<!--              </BaseButton>-->
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useApplicationStore } from '../stores/applications';
import { useOfferStore } from '../stores/offers';
import { useCompanyStore } from '../stores/companies';
import MainLayout from '../components/templates/MainLayout.vue';
import BaseTypography from '../components/atoms/BaseTypography.vue';
import BaseButton from '../components/atoms/BaseButton.vue';
import BaseCard from '../components/atoms/BaseCard.vue';
import BaseBadge from '../components/atoms/BaseBadge.vue';
import BaseIcon from '../components/atoms/BaseIcon.vue';

const { user, logout } = useAuth();
const router = useRouter();
const applicationStore = useApplicationStore();
const offerStore = useOfferStore();
const companyStore = useCompanyStore();

const applications = computed(() => applicationStore.applications);
const loading = computed(() => applicationStore.loading || offerStore.loading || companyStore.loading);

async function fetchApplications() {
  if (!user.value) return;
  await applicationStore.fetchStudentApplications(user.value.id);
  
  // Charger les offres et les noms d'entreprises manquants
  const loadPromises = applications.value.map(async (app) => {
    // Si l'offre n'est pas déjà présente dans l'objet application, on la fetch
    if (!app.offer) {
      await offerStore.fetchOfferById(app.offerId);
    } else if (app.offer.companyId) {
      // Si l'offre est là mais pas forcément l'entreprise dans le store
      await companyStore.fetchCompanyById(app.offer.companyId);
    }
  });
  
  await Promise.all(loadPromises);
}

function getOffer(app: any) {
  return app.offer || offerStore.getOfferById(app.offerId);
}

function getCompanyName(app: any) {
  const offer = getOffer(app);
  if (offer?.companyName) return offer.companyName;
  if (offer?.companyId) return companyStore.getCompanyName(offer.companyId);
  return 'Entreprise';
}

function getOfferLocation(app: any) {
  const offer = getOffer(app);
  return offer?.location || 'Lieu non spécifié';
}

function getOfferType(app: any) {
  const offer = getOffer(app);
  return offer?.type;
}

function getOfferTitle(app: any) {
  const offer = getOffer(app);
  return offer?.title || 'Offre #' + app.offerId;
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'Date inconnue';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Date invalide';
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'ACCEPTED': return 'success';
    case 'REJECTED': return 'danger';
    case 'SUBMITTED':
    case 'PENDING': return 'info';
    default: return 'info';
  }
}

function formatStatus(status: string) {
  switch (status) {
    case 'SUBMITTED': return 'Envoyée';
    case 'PENDING': return 'En cours';
    case 'ACCEPTED': return 'Acceptée';
    case 'REJECTED': return 'Refusée';
    default: return status;
  }
}

onMounted(fetchApplications);
</script>

<style scoped>
.applications-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  gap: 1rem;
}

.empty-icon {
  color: var(--color-text-light);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.applications-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.application-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.application-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.company-name {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.meta-info {
  display: flex;
  gap: 1.5rem;
}

.meta-info span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.cancel-btn {
  color: var(--color-danger);
}

.cancel-btn:hover {
  background-color: #fff1f0;
}

@media (max-width: 768px) {
  .card-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .status-section {
    align-items: flex-start;
    width: 100%;
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
  }
}
</style>
