<template>
  <MainLayout
    :is-authenticated="!!user"
    :user-email="user?.email"
    :user-role="user?.role"
    @logout="logout"
  >
    <div class="company-offers-view">
      <div class="section-header">
        <BaseTypography variant="h2" bold>Mes Offres</BaseTypography>
        <BaseButton @click="showCreateModal = true">Créer une offre</BaseButton>
      </div>

      <div v-if="loading" class="loading-state">
        <BaseTypography variant="p" color="light">Chargement des offres...</BaseTypography>
      </div>

      <div v-else-if="offers.length === 0" class="empty-state">
        <BaseTypography variant="p" color="light">Vous n'avez pas encore créé d'offres.</BaseTypography>
        <BaseButton variant="outline" @click="showCreateModal = true">Créer ma première offre</BaseButton>
      </div>

      <div v-else class="offers-grid">
        <BaseCard v-for="offer in offers" :key="offer.id" class="offer-card">
          <div class="offer-card-header">
            <BaseTypography variant="h3" bold>{{ offer.title }}</BaseTypography>
            <BaseBadge :variant="offer.status === 'PUBLISHED' ? 'success' : 'info'">{{ offer.status }}</BaseBadge>
          </div>
          <BaseTypography variant="p" color="light" class="offer-location">{{ offer.location }}</BaseTypography>
          <BaseTypography variant="p" class="offer-description">{{ truncate(offer.description, 100) }}</BaseTypography>
          
          <div class="offer-actions">
            <BaseButton size="sm" variant="ghost" @click="viewApplications(offer.id)">
              Candidatures
            </BaseButton>
            <BaseButton size="sm" variant="ghost" @click="editOffer(offer)">
              Modifier
            </BaseButton>
            <BaseButton v-if="offer.status === 'DRAFT'" size="sm" variant="ghost" @click="publishOffer(offer.id)">
              Publier
            </BaseButton>
            <BaseButton size="sm" variant="ghost" @click="handleDeleteOffer(offer.id)">
              Supprimer
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showCreateModal || editingOffer" class="modal-overlay">
      <BaseCard class="modal-card">
        <BaseTypography variant="h3" bold class="modal-title">{{ editingOffer ? 'Modifier l\'offre' : 'Nouvelle offre' }}</BaseTypography>
        <form @submit.prevent class="offer-form">
          <FormField label="Titre" v-model="form.title" required />
          <FormField label="Lieu" v-model="form.location" required />
          <FormField label="Salaire (annuel brut)" v-model.number="form.salary" type="number" placeholder="Ex: 1200" />
          
          <FormField label="Secteur d'étude">
            <select v-model="form.fieldOfStudy" required class="ds-select">
              <option value="ADMINISTRATION">Administration</option>
              <option value="ARTS_DESIGN">Arts & Design</option>
              <option value="BUSINESS_MANAGEMENT">Business & Management</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="COMPUTER_SCIENCE">Informatique</option>
              <option value="DATA_ANALYTICS">Data & Analytics</option>
              <option value="ENGINEERING">Ingénierie</option>
              <option value="FINANCE_ACCOUNTING">Finance & Comptabilité</option>
              <option value="HUMAN_RESOURCES">Ressources Humaines</option>
              <option value="LAW">Droit</option>
              <option value="MARKETING">Marketing</option>
              <option value="SALES">Vente</option>
            </select>
          </FormField>
          
          <FormField label="Description">
            <textarea v-model="form.description" required class="ds-textarea" rows="5"></textarea>
          </FormField>

          <div class="modal-actions">
            <BaseButton variant="ghost" @click="closeModal">Annuler</BaseButton>
            <div class="action-group">
              <BaseButton 
                v-if="!editingOffer || editingOffer.status === 'DRAFT'"
                variant="ghost"
                @click="saveOffer('DRAFT')" 
                :loading="saving"
              >
                Brouillon
              </BaseButton>
              <BaseButton 
                @click="saveOffer('PUBLISHED')" 
                :loading="saving"
              >
                {{ editingOffer ? 'Mettre à jour & Publier' : 'Publier l\'offre' }}
              </BaseButton>
            </div>
          </div>
        </form>
      </BaseCard>
    </div>

    <div v-if="showApplicationsModal" class="modal-overlay">
      <BaseCard class="modal-card wide">
        <div class="modal-header">
          <BaseTypography variant="h3" bold>Candidatures pour {{ selectedOfferTitle }}</BaseTypography>
          <BaseButton variant="ghost" size="sm" @click="showApplicationsModal = false">Fermer</BaseButton>
        </div>
        
        <div v-if="loadingApplications" class="loading-state">
          <BaseTypography variant="p">Chargement des candidatures...</BaseTypography>
        </div>
        <div v-else-if="applications.length === 0" class="empty-state">
          <BaseTypography variant="p" color="light">Aucune candidature reçue pour le moment.</BaseTypography>
        </div>
        <div v-else class="applications-list">
          <div v-for="app in applications" :key="app.id" class="application-item">
            <div class="app-info">
              <div class="app-student-header">
                <BaseTypography variant="h4">{{ studentStore.getStudentName(app.studentId) }}</BaseTypography>
                <BaseBadge :variant="app.status === 'ACCEPTED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'info'">
                  {{ app.status }}
                </BaseBadge>
              </div>
              <BaseTypography v-if="app.description" variant="p" class="app-description">{{ app.description }}</BaseTypography>
              <BaseTypography variant="caption" color="light">Postulé le {{ formatDate(app.createdAt) }}</BaseTypography>
            </div>
            <div class="app-actions">
              <a :href="app.cvUrl" target="_blank" class="cv-button">
                <BaseButton size="sm" variant="outline">Voir CV</BaseButton>
              </a>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useOfferStore } from '../stores/offers';
import { useApplicationStore } from '../stores/applications';
import { useStudentStore } from '../stores/students';
import MainLayout from '../components/templates/MainLayout.vue';
import BaseButton from '../components/atoms/BaseButton.vue';
import BaseCard from '../components/atoms/BaseCard.vue';
import BaseTypography from '../components/atoms/BaseTypography.vue';
import BaseBadge from '../components/atoms/BaseBadge.vue';
import FormField from '../components/molecules/FormField.vue';

const { user, logout } = useAuth();
const offerStore = useOfferStore();
const applicationStore = useApplicationStore();
const studentStore = useStudentStore();

const offers = computed(() => 
  offerStore.offers.filter(o => o.companyId === user.value?.id)
);
const loading = computed(() => offerStore.loading);
const showCreateModal = ref(false);
const editingOffer = ref<any>(null);
const saving = ref(false);

const form = reactive({
  title: '',
  description: '',
  location: '',
  fieldOfStudy: 'COMPUTER_SCIENCE' as any,
  salary: undefined as number | undefined
});

async function fetchOffers() {
  if (!user.value) return;
  await offerStore.fetchOffersByCompany(user.value.id);
}

onMounted(fetchOffers);

function editOffer(offer: any) {
  editingOffer.value = offer;
  form.title = offer.title;
  form.description = offer.description;
  form.location = offer.location;
  form.fieldOfStudy = offer.fieldOfStudy;
  form.salary = offer.salary;
  showCreateModal.value = true;
}

function closeModal() {
  showCreateModal.value = false;
  editingOffer.value = null;
  form.title = '';
  form.description = '';
  form.location = '';
  form.fieldOfStudy = 'COMPUTER_SCIENCE';
  form.salary = undefined;
}

async function saveOffer(targetStatus: 'DRAFT' | 'PUBLISHED' = 'DRAFT') {
  if (!user.value) return;
  saving.value = true;
  try {
    const offerData = {
      title: form.title,
      description: form.description,
      location: form.location,
      fieldOfStudy: form.fieldOfStudy,
      salary: form.salary
    };

    const publish = targetStatus === 'PUBLISHED';

    if (editingOffer.value) {
      await offerStore.updateOffer(editingOffer.value.id, offerData, publish);
    } else {
      await offerStore.createOffer(user.value.id, offerData, publish);
    }

    closeModal();
  } catch (err) {
    console.error('Failed to save offer:', err);
    alert('Erreur lors de l\'enregistrement de l\'offre.');
  } finally {
    saving.value = false;
  }
}

async function handleDeleteOffer(id: number) {
  if (!confirm('Voulez-vous vraiment supprimer cette offre ?')) return;
  try {
    await offerStore.deleteOffer(id);
  } catch (err) {
    console.error('Failed to delete offer:', err);
    alert('Erreur lors de la suppression.');
  }
}

async function publishOffer(id: number) {
  try {
    await offerStore.updateOffer(id, {}, true);
  } catch (err) {
    console.error('Failed to publish offer:', err);
  }
}

// Applications management
const showApplicationsModal = ref(false);
const applications = ref<any[]>([]);
const loadingApplications = ref(false);
const selectedOfferTitle = ref('');

async function viewApplications(offerId: number) {
  const offer = offers.value.find(o => o.id === offerId);
  selectedOfferTitle.value = offer?.title || '';
  showApplicationsModal.value = true;
  loadingApplications.value = true;
  try {
    const apps = await applicationStore.fetchOfferApplications(offerId);
    applications.value = apps;
    
    // Charger les noms des étudiants
    const studentIds = Array.from(new Set(apps.map(a => a.studentId)));
    await Promise.all(studentIds.map(id => studentStore.fetchStudentById(id)));
  } catch (err) {
    console.error('Failed to fetch applications:', err);
  } finally {
    loadingApplications.value = false;
  }
}

function truncate(str: string, n: number) {
  return str.length > n ? str.substr(0, n - 1) + '...' : str;
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
</script>

<style scoped>
.company-offers-view {
  padding: 2rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.offer-card {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.offer-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.offer-location {
  margin-bottom: 1rem;
}

.offer-description {
  flex: 1;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.offer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1.25rem;
  margin-top: auto;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2.5rem;
}

.modal-card.wide {
  max-width: 800px;
}

.modal-title {
  margin-bottom: 2rem;
}

.offer-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ds-select, .ds-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background-color: white;
}

.ds-select:focus, .ds-textarea:focus {
  border-color: var(--shibui-orange);
  box-shadow: 0 0 0 2px var(--shibui-light-orange);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
}

.action-group {
  display: flex;
  gap: 1rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--shibui-gray);
}

.app-student-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.app-description {
  margin-bottom: 0.5rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
</style>
