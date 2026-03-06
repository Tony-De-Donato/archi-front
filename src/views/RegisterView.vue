<template>
  <div class="register-view">
    <!-- Logo -->
    <div class="logo-wrapper">
      <router-link to="/" class="logo-link">
        <ShibuiLogo class="logo" />
      </router-link>
    </div>

    <!-- Register Card -->
    <BaseCard class="register-card">
      <BaseTypography variant="h3" bold class="register-title">Créer un compte</BaseTypography>
      <BaseTypography variant="p" class="register-subtitle">Choisissez votre profil pour commencer.</BaseTypography>

      <div class="role-selector">
        <button
          @click="role = 'STUDENT'"
          class="role-button"
          :class="{ active: role === 'STUDENT' }"
        >
          Étudiant
        </button>
        <button
          @click="role = 'COMPANY'"
          class="role-button"
          :class="{ active: role === 'COMPANY' }"
        >
          Entreprise
        </button>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Student specific fields -->
        <template v-if="role === 'STUDENT'">
          <div class="name-grid">
            <FormField
              label="Prénom"
              id="firstName"
              placeholder="Prénom"
              v-model="firstName"
              required
            />
            <FormField
              label="Nom"
              id="lastName"
              placeholder="Nom"
              v-model="lastName"
              required
            />
          </div>
        </template>

        <!-- Company specific fields -->
        <template v-else>
          <FormField
            label="Nom de l'entreprise"
            id="legalName"
            placeholder="Nom légal"
            v-model="legalName"
            required
          />
        </template>

        <FormField
          label="Adresse email"
          id="email"
          type="email"
          placeholder="votre@email.com"
          v-model="email"
          required
        />
        <FormField
          label="Mot de passe"
          id="password"
          type="password"
          placeholder="Votre mot de passe"
          v-model="password"
          required
        />

        <div v-if="error" class="error-banner">
          {{ error }}
        </div>

        <BaseButton type="submit" full-width :loading="loading" size="lg">
          Créer mon compte
        </BaseButton>

        <BaseTypography variant="caption" class="terms-text">
          <span>
            Si c'est votre première visite du site il va falloir attendre environ 1 minute le temps que l'hébergeur lance l'api.
          </span>
      </BaseTypography>
      </form>



      <BaseTypography variant="caption" class="terms-text">
        En créant un compte ou en vous connectant, vous comprenez et acceptez les
        <a href="https://canardsdulacbrome.com/trouver-une-recette/" class="shibui-link" target="_blank" rel="noopener noreferrer">conditions d'utilisation</a>
        de shibui.
      </BaseTypography>

      <div class="register-footer">
        <BaseTypography variant="p">
          Déjà inscrit(e) ?
          <router-link to="/login" class="shibui-link font-bold">S'identifier</router-link>
        </BaseTypography>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import ShibuiLogo from '../components/atoms/ShibuiLogo.vue';
import BaseCard from '../components/atoms/BaseCard.vue';
import BaseButton from '../components/atoms/BaseButton.vue';
import BaseTypography from '../components/atoms/BaseTypography.vue';
import FormField from '../components/molecules/FormField.vue';

const { registerStudent, registerCompany, loading, error } = useAuth();
const email = ref('');
const password = ref('');
const role = ref<'STUDENT' | 'COMPANY'>('STUDENT');

// Profile fields
const firstName = ref('');
const lastName = ref('');
const legalName = ref('');

async function handleRegister() {
  try {
    if (role.value === 'STUDENT') {
      await registerStudent({
        email: email.value,
        password: password.value,
        profile: {
          firstName: firstName.value,
          lastName: lastName.value
        }
      });
    } else {
      await registerCompany({
        email: email.value,
        password: password.value,
        profile: {
          legalName: legalName.value
        }
      });
    }
  } catch (err) {
    // Error is handled in the composable
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  background-color: var(--shibui-gray);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.logo-wrapper {
  margin-bottom: 3rem;
}

.logo-link {
  text-decoration: none;
  display: flex;
}

.logo {
  height: 48px;
}

.register-card {
  width: 100%;
  max-width: 448px;
  padding: 2.5rem;
}

.register-title {
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: var(--color-text-light);
  margin-bottom: 2rem;
}

.role-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.role-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid var(--color-border);
  background-color: transparent;
  color: var(--color-text-light);
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}

.role-button.active {
  border-color: var(--shibui-orange);
  background-color: var(--shibui-light-orange);
  color: var(--shibui-orange);
}

.role-button:hover:not(.active) {
  border-color: #d1d5db;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.error-banner {
  background-color: #fef2f2;
  color: var(--color-danger);
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.register-footer {
  margin-top: 2rem;
  text-align: center;
}

.shibui-link {
  color: var(--shibui-orange);
  text-decoration: none;
  font-weight: 600;
}

.shibui-link:hover {
  text-decoration: underline;
}

.font-bold {
  font-weight: 700;
}

.terms-text {
  color: var(--color-text-light);
  margin-top: 1rem !important;
}
</style>
