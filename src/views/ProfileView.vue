<template>
  <MainLayout
    :is-authenticated="!!user"
    :user-email="user?.email"
    :user-role="user?.role"
    @logout="logout"
  >
    <div class="profile-container">
      <BaseTypography variant="h2" bold class="page-title">Mon Profil</BaseTypography>
      
      <div class="profile-grid">
        <div class="main-content">
          <!-- Account Info -->
          <BaseCard class="profile-card">
            <BaseTypography variant="h3" bold class="card-title">Informations du compte</BaseTypography>
            
            <div class="info-grid">
              <div class="info-group">
                <BaseTypography variant="label">Email</BaseTypography>
                <BaseTypography variant="p">{{ user?.email }}</BaseTypography>
              </div>
              <div class="info-group">
                <BaseTypography variant="label">Rôle</BaseTypography>
                <BaseTypography variant="p">{{ user?.role }}</BaseTypography>
              </div>
            </div>

            <div class="profile-details-section">
              <template v-if="profile && !editingProfile">
                <div v-if="user?.role === 'STUDENT'" class="details-grid">
                  <div class="info-group">
                    <BaseTypography variant="label">Prénom</BaseTypography>
                    <BaseTypography variant="p">{{ profile.firstName }}</BaseTypography>
                  </div>
                  <div class="info-group">
                    <BaseTypography variant="label">Nom</BaseTypography>
                    <BaseTypography variant="p">{{ profile.lastName }}</BaseTypography>
                  </div>
                </div>
                <div v-else-if="user?.role === 'COMPANY'" class="details-grid">
                  <div class="info-group">
                    <BaseTypography variant="label">Nom de l'entreprise</BaseTypography>
                    <BaseTypography variant="p">{{ profile.legalName }}</BaseTypography>
                  </div>
                  <div class="info-group">
                    <BaseTypography variant="label">SIRET</BaseTypography>
                    <BaseTypography variant="p">{{ profile.siret || 'Non renseigné' }}</BaseTypography>
                  </div>
                  <div class="info-group">
                    <BaseTypography variant="label">Secteur</BaseTypography>
                    <BaseTypography variant="p">{{ formatIndustry(profile.industry) }}</BaseTypography>
                  </div>
                  <div class="info-group full-width">
                    <BaseTypography variant="label">Description</BaseTypography>
                    <BaseTypography variant="p" class="description-text">{{ profile.description || 'Aucune description' }}</BaseTypography>
                  </div>
                </div>
                <div class="card-actions">
                  <BaseButton variant="ghost" size="sm" @click="editingProfile = true">Modifier le profil</BaseButton>
                </div>
              </template>

              <!-- Edit Profile Form -->
              <form v-else-if="editingProfile" @submit.prevent="handleUpdateProfile" class="edit-form">
                <template v-if="user?.role === 'STUDENT'">
                  <div class="form-row">
                    <FormField label="Prénom" v-model="profileForm.firstName" required />
                    <FormField label="Nom" v-model="profileForm.lastName" required />
                  </div>
                </template>
                <template v-else-if="user?.role === 'COMPANY'">
                  <FormField label="Nom légal" v-model="profileForm.legalName" required />
                  <FormField label="SIRET" v-model="profileForm.siret" placeholder="14 chiffres" maxlength="14" />
                  <FormField label="Secteur">
                    <select v-model="profileForm.industry" class="ds-select">
                      <option value="AEROSPACE">Aéronautique</option>
                      <option value="AGRICULTURE">Agriculture</option>
                      <option value="AUTOMOTIVE">Automobile</option>
                      <option value="BANKING_INSURANCE">Banque & Assurance</option>
                      <option value="CONSTRUCTION">Construction</option>
                      <option value="EDUCATION">Éducation</option>
                      <option value="ENERGY">Énergie</option>
                      <option value="HEALTHCARE">Santé</option>
                      <option value="HOSPITALITY">Hôtellerie & Restauration</option>
                      <option value="IT_SERVICES">Services IT</option>
                      <option value="LUXURY">Luxe</option>
                      <option value="MANUFACTURING">Industrie</option>
                      <option value="MEDIA_ENTERTAINMENT">Médias & Divertissement</option>
                      <option value="RETAIL">Commerce de détail</option>
                      <option value="PUBLIC_SECTOR">Secteur public</option>
                      <option value="TRANSPORT_LOGISTICS">Transport & Logistique</option>
                    </select>
                  </FormField>
                  <FormField label="Description">
                    <textarea v-model="profileForm.description" class="ds-textarea" rows="4"></textarea>
                  </FormField>
                </template>
                <div class="form-actions">
                  <BaseButton variant="ghost" size="sm" @click="editingProfile = false">Annuler</BaseButton>
                  <BaseButton type="submit" size="sm" :loading="profileLoading">Enregistrer</BaseButton>
                </div>
              </form>
            </div>
          </BaseCard>

        </div>

        <aside class="sidebar-content">
          <BaseCard class="danger-card">
            <BaseTypography variant="h3" bold class="card-title danger">Zone de danger</BaseTypography>
            <BaseTypography variant="small" class="danger-text">La suppression de votre compte est définitive et toutes vos données seront effacées.</BaseTypography>
            <BaseButton variant="outline" size="sm" class="delete-btn" @click="handleDeleteAccount">Supprimer mon compte</BaseButton>
          </BaseCard>
        </aside>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { 
  studentControllerGetStudentProfile,
  companyControllerGetCompanyProfile,
  studentControllerUpdateCompanyProfile,
  companyControllerUpdateCompanyProfile,
  accountControllerDeleteAccount
} from '../openApi';
import MainLayout from '../components/templates/MainLayout.vue';
import BaseButton from '../components/atoms/BaseButton.vue';
import BaseCard from '../components/atoms/BaseCard.vue';
import BaseTypography from '../components/atoms/BaseTypography.vue';
import FormField from '../components/molecules/FormField.vue';
import type { Application } from '../types';

const { user, logout } = useAuth();
const router = useRouter();
const profile = ref<any>(null);
const profileLoading = ref(false);
const editingProfile = ref(false);
const savingProfile = ref(false);
const profileForm = ref<any>({});

function goHome() {
  if (user.value?.role === 'COMPANY') {
    router.push('/company/offers');
  } else {
    router.push('/offers');
  }
}

const industryLabels: Record<string, string> = {
  AEROSPACE: 'Aéronautique',
  AGRICULTURE: 'Agriculture',
  AUTOMOTIVE: 'Automobile',
  BANKING_INSURANCE: 'Banque & Assurance',
  CONSTRUCTION: 'Construction',
  EDUCATION: 'Éducation',
  ENERGY: 'Énergie',
  HEALTHCARE: 'Santé',
  HOSPITALITY: 'Hôtellerie & Restauration',
  IT_SERVICES: 'Services IT',
  LUXURY: 'Luxe',
  MANUFACTURING: 'Industrie',
  MEDIA_ENTERTAINMENT: 'Médias & Divertissement',
  RETAIL: 'Commerce de détail',
  PUBLIC_SECTOR: 'Secteur public',
  TRANSPORT_LOGISTICS: 'Transport & Logistique'
};

function formatIndustry(industry: string) {
  return industryLabels[industry] || industry;
}

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
        description: companyData.description,
        siret: companyData.siret
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
});

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
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card {
  padding: 2rem;
}

.card-title {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  border-top: 1px solid var(--color-border);
  padding-top: 2rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.full-width {
  grid-column: span 2;
}

.description-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

.card-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.edit-form {
  border-top: 1px solid var(--color-border);
  padding-top: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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
  border-radius: 8px;
  background-color: var(--shibui-gray);
}

.app-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.danger-card {
  padding: 1.5rem;
  border: 1px solid #fee2e2;
}

.card-title.danger {
  color: var(--color-danger);
  margin-bottom: 0.5rem;
}

.danger-text {
  color: #991b1b;
  margin-bottom: 1.5rem;
  display: block;
}

.delete-btn {
  border-color: #fee2e2;
  color: var(--color-danger);
}

.delete-btn:hover {
  background-color: #fef2f2;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid, .details-grid, .form-row {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: span 1;
  }
}
</style>
