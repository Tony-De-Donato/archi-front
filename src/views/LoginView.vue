<template>
  <div class="login-view">
    <!-- Logo -->
    <div class="logo-wrapper">
      <router-link to="/" class="logo-link">
        <ShibuiLogo class="logo" />
      </router-link>
    </div>

    <!-- Login Card -->
    <BaseCard class="login-card">
      <BaseTypography variant="h3" bold class="login-title">Connexion</BaseTypography>
      <BaseTypography variant="p" class="login-subtitle">Créez un compte ou connectez-vous.</BaseTypography>

      <form @submit.prevent="handleLogin" class="login-form">
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
          Continuer
        </BaseButton>
        <BaseTypography variant="caption" class="terms-text">
          <span>
            Si c'est votre première visite du site il va falloir attendre environ 1 minute le temps que l'hébergeur lance l'api.
          </span>
        </BaseTypography>
      </form>

      <div class="login-footer">
        <BaseTypography variant="caption" class="terms-text">
          En créant un compte ou en vous connectant, vous comprenez et acceptez les
          <a href="https://canardsdulacbrome.com/trouver-une-recette/" class="shibui-link" target="_blank" rel="noopener noreferrer">conditions d'utilisation</a>
          de shibui.
        </BaseTypography>
        
        <div class="register-section">
          <BaseTypography variant="p">
            Nouveau sur Shibui ?
            <router-link to="/register" class="shibui-link font-bold">S'enregistrer</router-link>
          </BaseTypography>
        </div>
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

const { login, loading, error } = useAuth();
const email = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await login({ email: email.value, password: password.value });
  } catch (err) {
    // Error is handled in the composable
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

.logo-link {
  text-decoration: none;
  display: flex;
}

.logo {
  height: 48px;
}

.login-card {
  width: 100%;
  max-width: 448px;
  padding: 2.5rem;
}

.login-title {
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: var(--color-text-light);
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-banner {
  background-color: #fef2f2;
  color: var(--color-danger);
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
}

.terms-text {
  color: var(--color-text-light);
}

.register-section {
  margin-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
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
</style>
