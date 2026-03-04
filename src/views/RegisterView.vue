<template>
  <div class="register-view">
    <!-- Logo -->
    <div class="logo-wrapper">
      <ShibuiLogo size="lg" @click="$router.push('/')" class="clickable-logo" />
    </div>

    <!-- Register Card -->
    <BaseCard class="register-card" padding="lg">
      <h2 class="register-title">Créer un compte</h2>
      <p class="register-subtitle">Choisissez votre profil pour commencer.</p>

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
            <BaseInput
              label="Prénom"
              placeholder="Prénom"
              v-model="firstName"
              required
            />
            <BaseInput
              label="Nom"
              placeholder="Nom"
              v-model="lastName"
              required
            />
          </div>
        </template>

        <!-- Company specific fields -->
        <template v-else>
          <BaseInput
            label="Nom de l'entreprise"
            placeholder="Legal Name"
            v-model="legalName"
            required
          />
        </template>

        <BaseInput
          label="Adresse email"
          type="email"
          placeholder="votre@email.com"
          v-model="email"
          required
        />
        <BaseInput
          label="Mot de passe"
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
      </form>

      <div class="register-footer">
        <p>
          Déjà inscrit(e) ?
          <router-link to="/login" class="shibui-link font-bold">S'identifier</router-link>
        </p>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import ShibuiLogo from '../components/ui/ShibuiLogo.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseButton from '../components/ui/BaseButton.vue';

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

.clickable-logo {
  cursor: pointer;
}

.register-card {
  width: 100%;
  max-width: 448px;
}

.register-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--shibui-dark-gray);
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #6b7280;
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
  border: 2px solid #e5e7eb;
  background-color: transparent;
  color: #6b7280;
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
  gap: 1.5rem;
}

.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.error-banner {
  background-color: #fef2f2;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.register-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
}

.shibui-link {
  color: var(--shibui-orange);
  text-decoration: none;
}

.shibui-link:hover {
  text-decoration: underline;
}

.font-bold {
  font-weight: 700;
}
</style>
