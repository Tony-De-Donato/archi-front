<template>
  <MainLayout
    :is-authenticated="!!user"
    :user-email="user?.email"
    :user-role="user?.role"
    @logout="logout"
    :full-width="true"
  >
    <div class="job-board-content">
      <aside class="offers-list-container">
        <div class="sidebar-search">
          <SearchInput icon="search" placeholder="Rechercher par titre ou entreprise" v-model="searchQuery" />
          <SearchInput icon="location" placeholder="Où ?" v-model="locationQuery" />
          
          <div class="sort-section">
            <BaseTypography variant="caption" bold>Domaine d'étude :</BaseTypography>
            <select v-model="selectedField" class="sort-select">
              <option value="">Tous les domaines</option>
              <option value="ADMINISTRATION">Administration</option>
              <option value="ARTS_DESIGN">Arts & Design</option>
              <option value="BUSINESS_MANAGEMENT">Management</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="COMPUTER_SCIENCE">Informatique</option>
              <option value="DATA_ANALYTICS">Data Analytics</option>
              <option value="ENGINEERING">Ingénierie</option>
              <option value="FINANCE_ACCOUNTING">Finance</option>
              <option value="HUMAN_RESOURCES">RH</option>
              <option value="LAW">Droit</option>
              <option value="MARKETING">Marketing</option>
              <option value="SALES">Vente</option>
            </select>
          </div>
        </div>
        
        <BaseTypography variant="h3" class="sidebar-title">Offres d'emplois</BaseTypography>

        <div class="offers-scroll-area">
          <JobCard
            v-for="offer in filteredOffers"
            :key="offer.id"
            :job="{
              id: offer.id,
              title: offer.title,
              companyName: offer.companyName || companyStore.getCompanyName(offer.companyId),
              location: offer.location,
              salary: offer.salary ? offer.salary + ' € par an' : undefined,
              easyApply: true
            }"
            :class="{ active: selectedOffer?.id === offer.id }"
            @click="selectedOffer = offer"
          />
        </div>
      </aside>

      <section class="offer-detail-container">
        <template v-if="selectedOffer">
          <BaseCard class="detail-main-card">
            <div class="detail-header">
              <BaseTypography variant="h2" bold>{{ selectedOffer.title }}</BaseTypography>
              <BaseTypography variant="p" color="light">{{ selectedOffer.companyName || companyStore.getCompanyName(selectedOffer.companyId) }}</BaseTypography>
              <BaseTypography variant="p" color="light">{{ selectedOffer.location }}</BaseTypography>

              <div class="apply-section">
                <template v-if="user?.role === 'STUDENT'">
                  <div v-if="!hasAppliedToSelected" class="apply-actions">
                    <div v-if="showMotivationInput" class="motivation-container">
                      <BaseTypography variant="caption" bold>Votre message de motivation (optionnel)</BaseTypography>
                      <textarea 
                        v-model="motivationMessage" 
                        class="motivation-textarea" 
                        placeholder="Expliquez en quelques phrases pourquoi vous postulez..."
                      ></textarea>
                      <div class="motivation-buttons">
                        <BaseButton variant="ghost" size="sm" @click="cancelApply">Annuler</BaseButton>
                        <BaseButton 
                          size="md" 
                          :loading="applying" 
                          @click="handleApply"
                        >
                          Confirmer ma candidature
                        </BaseButton>
                      </div>
                    </div>
                    <BaseButton 
                      v-else
                      size="lg" 
                      :loading="applying" 
                      @click="handleApply"
                    >
                      Postuler maintenant
                    </BaseButton>
                  </div>
                  <BaseBadge v-else variant="success" size="lg" class="applied-badge">
                    Déjà postulé
                  </BaseBadge>
                </template>
                <BaseTypography v-else-if="user?.role === 'COMPANY'" variant="p" italic color="light">
                  Connectez-vous en tant qu'étudiant pour postuler.
                </BaseTypography>
              </div>
            </div>

            <div class="detail-body">
              <div class="detail-section">
                <BaseTypography variant="h3" bold>Description de l'offre</BaseTypography>
                <div class="description-content">
                  {{ selectedOffer.description }}
                </div>
              </div>
            </div>
          </BaseCard>
        </template>
        <div v-else class="empty-state">
          <BaseIcon name="briefcase" size="64" class="empty-icon" />
          <BaseTypography variant="h4" center>Sélectionnez une offre pour voir les détails</BaseTypography>
        </div>
      </section>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useOfferStore } from '../stores/offers';
import { useApplicationStore } from '../stores/applications';
import { useCompanyStore } from '../stores/companies';
import MainLayout from '../components/templates/MainLayout.vue';
import BaseButton from '../components/atoms/BaseButton.vue';
import BaseCard from '../components/atoms/BaseCard.vue';
import BaseTypography from '../components/atoms/BaseTypography.vue';
import BaseIcon from '../components/atoms/BaseIcon.vue';
import SearchInput from '../components/molecules/SearchInput.vue';
import JobCard from '../components/organisms/JobCard.vue';
import BaseBadge from '../components/atoms/BaseBadge.vue';
import type { Offer } from '../types';

const { user, logout } = useAuth();
const offerStore = useOfferStore();
const applicationStore = useApplicationStore();
const companyStore = useCompanyStore();

const selectedOffer = ref<Offer | null>(null);
const applying = ref(false);
const showMotivationInput = ref(false);
const motivationMessage = ref('');
const searchQuery = ref('');
const locationQuery = ref('');
const selectedField = ref<string>('');

const hasAppliedToSelected = computed(() => {
  if (!selectedOffer.value || !user.value) return false;
  return applicationStore.hasAppliedTo(selectedOffer.value.id);
});

const filteredOffers = computed(() => {
  const filtered = offerStore.publishedOffers.filter(offer => {
    const companyName = offer.companyName || companyStore.getCompanyName(offer.companyId);
    const matchesSearch = !searchQuery.value || 
      offer.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (companyName && companyName.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    const matchesLocation = !locationQuery.value || 
      offer.location.toLowerCase().includes(locationQuery.value.toLowerCase());

    const matchesField = !selectedField.value || 
      offer.fieldOfStudy === selectedField.value;
    
    return matchesSearch && matchesLocation && matchesField;
  });

  // Toujours trier par le plus récent par défaut
  return [...filtered].sort((a, b) => b.id - a.id);
});

onMounted(async () => {
  await offerStore.fetchAllOffers();
  if (user.value?.role === 'STUDENT') {
    await applicationStore.fetchStudentApplications(user.value.id);
  }
  
  if (offerStore.publishedOffers.length > 0) {
    selectedOffer.value = offerStore.publishedOffers[0] || null;
  }
});

async function handleApply() {
  if (!selectedOffer.value || !user.value || hasAppliedToSelected.value) return;
  
  if (!showMotivationInput.value) {
    showMotivationInput.value = true;
    return;
  }

  applying.value = true;
  try {
    await applicationStore.applyToOffer(
      selectedOffer.value.id, 
      user.value.id, 
      motivationMessage.value
    );
    alert('Candidature envoyée avec succès !');
    showMotivationInput.value = false;
    motivationMessage.value = '';
  } catch (err: any) {
    const message = err.response?.data?.message || 'Erreur lors de l\'envoi de la candidature.';
    alert(message);
  } finally {
    applying.value = false;
  }
}

function cancelApply() {
  showMotivationInput.value = false;
  motivationMessage.value = '';
}
</script>

<style scoped>
.job-board-content {
  display: grid;
  grid-template-columns: 550px 1fr;
  height: calc(100vh - 80px);
  overflow: hidden;
}

.sidebar-search {
  padding: 0 1.5rem 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.sort-select {
  flex: 1;
  padding: 0.4rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background-color: white;
  font-size: 0.875rem;
  color: var(--shibui-dark-gray);
  outline: none;
}

.sort-select:focus {
  border-color: var(--shibui-orange);
}

.offers-list-container {
  border-right: 1px solid var(--color-border);
  background: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0 0 0;
}

.sidebar-title {
  padding: 0 1.5rem;
  margin-bottom: 0.25rem;
}

.sidebar-subtitle {
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
}

.offers-scroll-area {
  flex: 1;
  overflow: scroll;
  padding: 0 1.5rem 1.5rem 1.5rem;
  max-height: 55vh;
}

.offer-detail-container {
  background-color: var(--shibui-gray);
  padding: 2rem;
  overflow-y: auto;
}

.detail-main-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 2.5rem;
}

.detail-header {
  margin-bottom: 2.5rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 2rem;
}

.apply-section {
  margin-top: 2rem;
}

.motivation-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--shibui-gray);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  margin-bottom: 1rem;
  width: 100%;
}

.motivation-textarea {
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
}

.motivation-textarea:focus {
  outline: none;
  border-color: var(--shibui-orange);
  box-shadow: 0 0 0 2px var(--shibui-light-orange);
}

.motivation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.applied-badge {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.description-content {
  margin-top: 1rem;
  line-height: 1.7;
  white-space: pre-wrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-light);
  gap: 1.5rem;
}

.empty-icon {
  opacity: 0.2;
}

.active {
  border-color: var(--shibui-orange) !important;
  box-shadow: 0 0 0 1px var(--shibui-orange) !important;
}

@media (max-width: 1024px) {
  .job-board-content {
    grid-template-columns: 1fr;
  }

}
</style>
