<template>
  <div class="company-offers-view">
    <header class="view-header">
      <div class="header-content">
        <ShibuiLogo />
        <nav class="header-nav">
          <router-link to="/offers" class="nav-link">Tableau de bord</router-link>
          <router-link to="/profile" class="nav-link">Profil</router-link>
          <BaseButton variant="ghost" @click="logout">Déconnexion</BaseButton>
        </nav>
      </div>
    </header>

    <main class="view-main">
      <div class="main-content">
        <div class="section-header">
          <h1 class="view-title">Mes Offres</h1>
          <BaseButton @click="showCreateModal = true">Créer une offre</BaseButton>
        </div>

        <div v-if="loading" class="loading-state">
          Chargement des offres...
        </div>

        <div v-else-if="offers.length === 0" class="empty-state">
          <p>Vous n'avez pas encore créé d'offres.</p>
          <BaseButton variant="outline" @click="showCreateModal = true">Créer ma première offre</BaseButton>
        </div>

        <div v-else class="offers-grid">
          <BaseCard v-for="offer in offers" :key="offer.id" padding="md" class="offer-card">
            <div class="offer-card-header">
              <h3 class="offer-title">{{ offer.title }}</h3>
              <span :class="['status-badge', offer.status.toLowerCase()]">{{ offer.status }}</span>
            </div>
            <p class="offer-location">{{ offer.location }}</p>
            <p class="offer-description">{{ truncate(offer.description, 100) }}</p>
            
            <div class="offer-actions">
              <BaseButton size="sm" variant="outline" @click="viewApplications(offer.id)">
                Candidatures
              </BaseButton>
              <BaseButton size="sm" variant="ghost" @click="editOffer(offer)">
                Modifier
              </BaseButton>
              <BaseButton v-if="offer.status === 'DRAFT'" size="sm" variant="ghost" color="primary" @click="publishOffer(offer.id)">
                Publier
              </BaseButton>
              <BaseButton v-if="offer.status === 'PUBLISHED'" size="sm" variant="ghost" color="warning" @click="closeOffer(offer.id)">
                Fermer
              </BaseButton>
              <BaseButton size="sm" variant="ghost" color="danger" @click="handleDeleteOffer(offer.id)">
                Supprimer
              </BaseButton>
            </div>
          </BaseCard>
        </div>
      </div>
    </main>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingOffer" class="modal-overlay">
      <BaseCard padding="lg" class="modal-card">
        <h2 class="modal-title">{{ editingOffer ? 'Modifier l\'offre' : 'Nouvelle offre' }}</h2>
        <form @submit.prevent="saveOffer" class="offer-form">
          <div class="form-group">
            <label>Titre</label>
            <input v-model="form.title" type="text" required class="form-input" />
          </div>
          <div class="form-group">
            <label>Lieu</label>
            <input v-model="form.location" type="text" required class="form-input" />
          </div>
          <div class="form-group">
            <label>Secteur d'étude</label>
            <select v-model="form.fieldOfStudy" required class="form-input">
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
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" required class="form-input" rows="5"></textarea>
          </div>
          <div class="modal-actions">
            <BaseButton variant="ghost" @click="closeModal">Annuler</BaseButton>
            <BaseButton type="submit" :loading="saving">Enregistrer</BaseButton>
          </div>
        </form>
      </BaseCard>
    </div>

    <!-- Applications Modal -->
    <div v-if="showApplicationsModal" class="modal-overlay">
      <BaseCard padding="lg" class="modal-card wide">
        <div class="modal-header">
          <h2 class="modal-title">Candidatures pour {{ selectedOfferTitle }}</h2>
          <BaseButton variant="ghost" size="sm" @click="showApplicationsModal = false">Fermer</BaseButton>
        </div>
        
        <div v-if="loadingApplications" class="loading-state">
          Chargement des candidatures...
        </div>
        <div v-else-if="applications.length === 0" class="empty-state">
          Aucune candidature reçue pour le moment.
        </div>
        <div v-else class="applications-list">
          <div v-for="app in applications" :key="app.id" class="application-item">
            <div class="app-info">
              <p class="app-student">Étudiant #{{ app.studentId }}</p>
              <p class="app-date">Postulé le {{ formatDate(app.appliedAt) }}</p>
            </div>
            <div class="app-actions">
              <a :href="app.cvUrl" target="_blank" class="cv-link">Voir CV</a>
              <span :class="['status-badge', app.status.toLowerCase()]">{{ app.status }}</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useAuth } from '../composables/useAuth';
import { 
  offerControllerGetOffersByCompanyId, 
  offerControllerCreateOffer, 
  offerControllerUpdateOffer, 
  offerControllerDeleteOffer,
  offerControllerPublishOffer,
  offerControllerCloseOffer,
  offerApplicationControllerGetApplicationByOfferId
} from '../openApi';
import ShibuiLogo from '../components/ui/ShibuiLogo.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';

const { user, logout } = useAuth();

const offers = ref<any[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const editingOffer = ref<any>(null);
const saving = ref(false);

const form = reactive({
  title: '',
  description: '',
  location: '',
  fieldOfStudy: 'COMPUTER_SCIENCE' as any
});

async function fetchOffers() {
  if (!user.value) return;
  loading.value = true;
  try {
    const { data } = await offerControllerGetOffersByCompanyId({
      path: { id: user.value.id }
    });
    offers.value = data as any[];
  } catch (err) {
    console.error('Failed to fetch offers:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchOffers);

function editOffer(offer: any) {
  editingOffer.value = offer;
  form.title = offer.title;
  form.description = offer.description;
  form.location = offer.location;
  form.fieldOfStudy = offer.fieldOfStudy;
  showCreateModal.value = true;
}

function closeModal() {
  showCreateModal.value = false;
  editingOffer.value = null;
  form.title = '';
  form.description = '';
  form.location = '';
  form.fieldOfStudy = 'COMPUTER_SCIENCE';
}

async function saveOffer() {
  if (!user.value) return;
  saving.value = true;
  try {
    if (editingOffer.value) {
      await offerControllerUpdateOffer({
        path: { id: editingOffer.value.id },
        body: form
      });
    } else {
      await offerControllerCreateOffer({
        path: { id: user.value.id },
        body: { ...form, status: 'DRAFT' }
      });
    }
    await fetchOffers();
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
    await offerControllerDeleteOffer({ path: { offerId: id } });
    await fetchOffers();
  } catch (err) {
    console.error('Failed to delete offer:', err);
    alert('Erreur lors de la suppression.');
  }
}

async function publishOffer(id: number) {
  try {
    await offerControllerPublishOffer({ path: { offerId: id } });
    await fetchOffers();
  } catch (err) {
    console.error('Failed to publish offer:', err);
  }
}

async function closeOffer(id: number) {
  try {
    await offerControllerCloseOffer({ path: { offerId: id } });
    await fetchOffers();
  } catch (err) {
    console.error('Failed to close offer:', err);
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
    const { data } = await offerApplicationControllerGetApplicationByOfferId({
      path: { offerId }
    });
    applications.value = data as any[];
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
  return new Date(dateStr).toLocaleDateString();
}
</script>

<style scoped>
.company-offers-view {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.view-header {
  background-color: white;
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: var(--color-text-light);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover, .router-link-active {
  color: var(--color-primary);
}

.view-main {
  padding: 2rem 0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.view-title {
  font-size: 1.875rem;
  font-weight: 700;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.offer-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.offer-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.draft { background-color: #f3f4f6; color: #374151; }
.status-badge.published { background-color: #d1fae5; color: #065f46; }

.offer-location {
  color: var(--color-text-light);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.offer-description {
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
  line-height: 1.5;
}

.offer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 500px;
}

.modal-card.wide {
  max-width: 800px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.offer-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.form-input {
  padding: 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
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
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}

.cv-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.cv-link:hover {
  text-decoration: underline;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-light);
}
</style>
