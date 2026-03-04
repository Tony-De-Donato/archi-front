<template>
  <div class="profile-view">
    <header class="profile-header">
      <ShibuiLogo size="md" @click="$router.push('/offers')" class="clickable-logo" />
      <BaseButton size="sm" variant="ghost" @click="$router.push('/offers')">Retour aux offres</BaseButton>
    </header>

    <main class="profile-main">
      <h1 class="profile-title">Mon Profil</h1>
      <div class="profile-grid">
        <div class="profile-content">
          <!-- Account Info -->
          <BaseCard>
            <template #header>
              <h2 class="card-title">Informations du compte</h2>
            </template>
            <div class="info-list">
              <div class="info-item">
                <label class="info-label">Email</label>
                <p class="info-value">{{ user?.email }}</p>
              </div>
              <div class="info-item">
                <label class="info-label">Rôle</label>
                <p class="info-value">{{ user?.role }}</p>
              </div>
              <!-- Profile details -->
              <template v-if="profile && !editingProfile">
                <div v-if="user?.role === 'STUDENT'" class="profile-details-group">
                  <div class="info-item">
                    <label class="info-label">Prénom</label>
                    <p class="info-value">{{ profile.firstName }}</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Nom</label>
                    <p class="info-value">{{ profile.lastName }}</p>
                  </div>
                  <div v-if="profile.fieldOfStudy" class="info-item">
                    <label class="info-label">Secteur d'étude</label>
                    <p class="info-value">{{ profile.fieldOfStudy }}</p>
                  </div>
                </div>
                <div v-else-if="user?.role === 'COMPANY'" class="profile-details-group">
                  <div class="info-item">
                    <label class="info-label">Nom de l'entreprise</label>
                    <p class="info-value">{{ profile.legalName }}</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Secteur</label>
                    <p class="info-value">{{ profile.industry }}</p>
                  </div>
                </div>
                <BaseButton variant="ghost" size="sm" @click="editingProfile = true">Modifier le profil</BaseButton>
              </template>

              <!-- Edit Profile Form -->
              <form v-else-if="editingProfile" @submit.prevent="handleUpdateProfile" class="edit-profile-form">
                <template v-if="user?.role === 'STUDENT'">
                  <div class="form-group">
                    <label>Prénom</label>
                    <input v-model="profileForm.firstName" class="form-input" required />
                  </div>
                  <div class="form-group">
                    <label>Nom</label>
                    <input v-model="profileForm.lastName" class="form-input" required />
                  </div>
                </template>
                <template v-else-if="user?.role === 'COMPANY'">
                  <div class="form-group">
                    <label>Nom légal</label>
                    <input v-model="profileForm.legalName" class="form-input" required />
                  </div>
                  <div class="form-group">
                    <label>Secteur</label>
                    <input v-model="profileForm.industry" class="form-input" required />
                  </div>
                </template>
                <div class="form-actions">
                  <BaseButton variant="ghost" size="sm" @click="editingProfile = false">Annuler</BaseButton>
                  <BaseButton type="submit" size="sm" :loading="savingProfile">Enregistrer</BaseButton>
                </div>
              </form>
              <div v-if="user?.role === 'COMPANY'" class="profile-actions">
                <router-link to="/company/offers">
                  <BaseButton variant="outline">Gérer mes offres</BaseButton>
                </router-link>
              </div>
              <div v-else-if="profileLoading" class="profile-loading">
                Chargement du profil...
              </div>
            </div>
          </BaseCard>

          <!-- Applications (If student) -->
          <BaseCard v-if="user?.role === 'STUDENT'">
            <template #header>
              <h2 class="card-title">Mes candidatures</h2>
            </template>
            <div v-if="applications.length > 0" class="applications-list">
              <div v-for="app in applications" :key="app.id" class="application-item">
                <div class="app-info">
                  <h3 class="app-title">Offre #{{ app.offerId }}</h3>
                  <p class="app-date">Postulé le {{ new Date(app.appliedAt).toLocaleDateString() }}</p>
                </div>
                <div class="app-actions">
                  <span class="status-badge">
                    {{ app.status }}
                  </span>
                  <button @click="handleCancel(app.id)" class="cancel-button">
                    <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="empty-text">Aucune candidature pour le moment.</p>
          </BaseCard>
        </div>

        <div class="profile-sidebar">
          <!-- Actions -->
          <BaseCard class="danger-card">
            <h3 class="danger-title">Zone de danger</h3>
            <p class="danger-description">La suppression de votre compte est définitive.</p>
            <BaseButton variant="secondary" full-width class="danger-button" @click="handleDelete">
              Supprimer mon compte
            </BaseButton>
          </BaseCard>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { 
  offerApplicationControllerGetApplicationsByStudentId, 
  offerApplicationControllerCancelApplication,
  accountControllerDeleteAccount,
  studentControllerGetStudentProfile,
  companyControllerGetCompanyProfile,
  studentControllerUpdateCompanyProfile,
  companyControllerUpdateCompanyProfile
} from '../openApi';
import ShibuiLogo from '../components/ui/ShibuiLogo.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import type { Application } from '../types';

const { user, logout } = useAuth();
const applications = ref<Application[]>([]);
const profile = ref<any>(null);
const profileLoading = ref(false);
const editingProfile = ref(false);
const savingProfile = ref(false);
const profileForm = ref<any>({});

async function fetchProfile() {
  if (!user.value) return;
  profileLoading.value = true;
  try {
    if (user.value.role === 'STUDENT') {
      const { data } = await studentControllerGetStudentProfile({ 
        path: { userId: user.value.id } 
      });
      const studentData = data as any;
      profile.value = studentData;
      profileForm.value = { 
        firstName: studentData.firstName, 
        lastName: studentData.lastName,
        fieldOfStudy: studentData.fieldOfStudy
      };
    } else if (user.value.role === 'COMPANY') {
      const { data } = await companyControllerGetCompanyProfile({ 
        path: { id: user.value.id } 
      });
      const companyData = data as any;
      profile.value = companyData;
      profileForm.value = {
        legalName: companyData.legalName,
        industry: companyData.industry,
        description: companyData.description
      };
    }
  } catch (err) {
    console.error('Failed to fetch profile:', err);
  } finally {
    profileLoading.value = false;
  }
}

async function handleUpdateProfile() {
  if (!user.value) return;
  savingProfile.value = true;
  try {
    if (user.value.role === 'STUDENT') {
      await studentControllerUpdateCompanyProfile({
        path: { userId: user.value.id },
        body: profileForm.value
      });
    } else if (user.value.role === 'COMPANY') {
      await companyControllerUpdateCompanyProfile({
        path: { id: user.value.id },
        body: profileForm.value
      });
    }
    await fetchProfile();
    editingProfile.value = false;
  } catch (err) {
    alert('Erreur lors de la mise à jour du profil.');
  } finally {
    savingProfile.value = false;
  }
}

onMounted(async () => {
  fetchProfile();
  if (user.value?.role === 'STUDENT') {
    try {
      const { data } = await offerApplicationControllerGetApplicationsByStudentId({ 
        path: { studentId: user.value.id } 
      });
      applications.value = data as Application[];
    } catch (err) {
      console.error('Failed to fetch applications');
    }
  }
});

async function handleCancel(id: number) {
  if (!confirm('Voulez-vous vraiment annuler cette candidature ?')) return;
  try {
    await offerApplicationControllerCancelApplication({ 
      path: { applicationId: id } 
    });
    applications.value = applications.value.filter(a => a.id !== id);
  } catch (err) {
    alert('Erreur lors de l\'annulation.');
  }
}

async function handleDelete() {
  if (!user.value) return;
  if (!confirm('Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.')) return;
  try {
    await accountControllerDeleteAccount({ 
      path: { id: user.value.id } 
    });
    logout();
  } catch (err) {
    alert('Erreur lors de la suppression du compte.');
  }
}
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background-color: var(--shibui-gray);
}

.profile-header {
  background-color: white;
  border-bottom: 1px solid #f3f4f6;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.clickable-logo {
  cursor: pointer;
}

.profile-main {
  max-width: 56rem;
  margin: 0 auto;
  padding: 2rem;
}

.profile-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--shibui-dark-gray);
  margin-bottom: 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .profile-grid {
    grid-template-columns: 2fr 1fr;
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  color: var(--shibui-dark-gray);
  font-weight: 500;
}

.edit-profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.form-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.applications-list {
  display: flex;
  flex-direction: column;
}

.application-item {
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f9fafb;
}

.application-item:last-child {
  border-bottom: none;
}

.app-title {
  font-weight: 700;
}

.app-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.app-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  background-color: var(--shibui-light-orange);
  color: var(--shibui-orange);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
}

.cancel-button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.cancel-button:hover {
  color: #ef4444;
}

.icon-sm {
  width: 1.25rem;
  height: 1.25rem;
}

.empty-text {
  color: #6b7280;
  font-style: italic;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.danger-card {
  background-color: #fef2f2 !important;
  border-color: #fee2e2 !important;
}

.danger-title {
  color: #b91c1c;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.danger-description {
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.danger-button {
  color: #dc2626 !important;
  border-color: #fecaca !important;
}

.danger-button:hover {
  background-color: #fee2e2 !important;
}
</style>
