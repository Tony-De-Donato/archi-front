<template>
  <div class="forgot-password-view">
    <div class="logo-wrapper">
      <ShibuiLogo size="lg" @click="$router.push('/')" class="clickable-logo" />
    </div>

    <BaseCard class="auth-card" padding="lg">
      <template v-if="!submitted">
        <h2 class="auth-title">Réinitialiser votre mot de passe</h2>
        <p class="auth-subtitle">Saisissez l'adresse email associée à votre compte.</p>

        <form @submit.prevent="handleRequest" class="auth-form">
          <BaseInput
            label="Adresse email"
            type="email"
            v-model="email"
            required
            placeholder="votre@email.com"
          />
          <div v-if="error" class="error-banner">{{ error }}</div>
          <BaseButton type="submit" full-width :loading="loading" size="lg">
            Envoyer le lien
          </BaseButton>
        </form>
      </template>

      <template v-else-if="submitted && !resetting">
        <h2 class="auth-title">Vérifiez vos emails</h2>
        <p class="auth-subtitle">Si un compte existe pour {{ email }}, vous recevrez un code de réinitialisation.</p>
        
        <form @submit.prevent="handleReset" class="auth-form">
          <BaseInput
            label="Code de réinitialisation (OTP)"
            type="text"
            v-model="otp"
            required
            placeholder="Saisissez le code reçu"
          />
          <BaseInput
            label="Nouveau mot de passe"
            type="password"
            v-model="newPassword"
            required
            placeholder="Minimum 8 caractères"
          />
          <div v-if="error" class="error-banner">{{ error }}</div>
          <BaseButton type="submit" full-width :loading="loading" size="lg">
            Réinitialiser le mot de passe
          </BaseButton>
        </form>
      </template>

      <template v-else>
        <div class="success-state">
          <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <h2 class="auth-title">Mot de passe réinitialisé !</h2>
          <p class="auth-subtitle">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
          <router-link to="/login">
            <BaseButton full-width size="lg">Retour à la connexion</BaseButton>
          </router-link>
        </div>
      </template>

      <div class="auth-footer">
        <router-link to="/login" class="shibui-link">Retour à la connexion</router-link>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { authControllerRequestPasswordRest, authControllerResetPassword } from '../openApi';
import ShibuiLogo from '../components/atoms/ShibuiLogo.vue';
import BaseCard from '../components/atoms/BaseCard.vue';
import BaseInput from '../components/atoms/BaseInput.vue';
import BaseButton from '../components/atoms/BaseButton.vue';

const email = ref('');
const otp = ref('');
const newPassword = ref('');
const loading = ref(false);
const submitted = ref(false);
const resetting = ref(false);
const error = ref<string | null>(null);

async function handleRequest() {
  loading.value = true;
  error.value = null;
  try {
    // Note: The SDK has a typo 'RequestPasswordRest' from the backend
    await (authControllerRequestPasswordRest as any)({
      query: { email: email.value }
    });
    submitted.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Une erreur est survenue.';
  } finally {
    loading.value = false;
  }
}

async function handleReset() {
  loading.value = true;
  error.value = null;
  try {
    await authControllerResetPassword({
      query: { otp: otp.value },
      body: { 
        email: email.value,
        password: newPassword.value 
      }
    });
    resetting.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Code invalide ou erreur serveur.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.forgot-password-view {
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

.auth-card {
  width: 100%;
  max-width: 448px;
}

.auth-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-banner {
  background-color: #fef2f2;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
}

.shibui-link {
  color: var(--shibui-orange);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
}

.shibui-link:hover {
  text-decoration: underline;
}

.success-state {
  text-align: center;
}

.success-icon {
  width: 3rem;
  height: 3rem;
  color: #10b981;
  margin: 0 auto 1.5rem;
}
</style>
