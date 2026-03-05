<template>
  <div class="login-view">
    <!-- Logo -->
    <div class="logo-wrapper">
      <ShibuiLogo size="lg" @click="$router.push('/')" class="clickable-logo" />
    </div>

    <!-- Login Card -->
    <BaseCard class="login-card" padding="lg">
      <h2 class="login-title">Préparez-vous pour l'étape suivante</h2>
      <p class="login-subtitle">Créez un compte ou connectez-vous.</p>

      <form @submit.prevent="handleLogin" class="login-form">
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
          Continuer
        </BaseButton>
      </form>


      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-text">
        </div>
      </div>

      <div class="login-footer">
        <p class="terms-text">
          En créant un compte ou en vous connectant, vous comprenez et acceptez les
          <a href="https://canardsdulacbrome.com/trouver-une-recette/" class="shibui-link" target="_blank" rel="noopener noreferrer">conditions d'utilisation</a>
          de shibui.
        </p>
        <p class="register-link-text">
          Nouveau sur Shibui ?
          <router-link to="/register" class="shibui-link font-bold">S'enregistrer</router-link>
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

const { login, loading, error } = useAuth();
const email = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await login({ email: email.value, password: password.value });
  } catch (err) {
    // Error is handled in the composable and shown via `error` computed property
  }
}
</script>

<style scoped>
.login-view {
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

.login-card {
  width: 100%;
  max-width: 448px;
}

.login-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--shibui-dark-gray);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #6b7280;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.forgot-password-link {
  margin-top: 1rem;
  text-align: right;
}

.error-banner {
  background-color: #fef2f2;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.divider {
  position: relative;
  margin: 2rem 0;
}

.divider-line {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
}

.divider-line::after {
  content: "";
  width: 100%;
  border-top: 1px solid #e5e7eb;
}

.divider-text {
  position: relative;
  display: flex;
  justify-content: center;
  font-size: 0.875rem;
}

.divider-text span {
  background-color: white;
  padding: 0 0.5rem;
  color: #6b7280;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
}

.terms-text {
  color: #6b7280;
}

.register-link-text {
  margin-top: 1.5rem;
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
