<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <ShibuiLogo class="logo" />
        </router-link>
      </div>
      
      <nav class="nav-section">
        <template v-if="userRole === 'COMPANY'">
          <router-link to="/company/offers" class="nav-link">Mes Offres</router-link>
        </template>
        <template v-else-if="userRole === 'STUDENT'">
          <router-link to="/offers" class="nav-link">Offres</router-link>
          <router-link to="/student/applications" class="nav-link">Mes Candidatures</router-link>
        </template>
        <template v-else>
          <router-link to="/" class="nav-link" @click="onNavClick">Accueil</router-link>
        </template>
      </nav>

      <div class="user-section">
        <template v-if="isAuthenticated">
          <router-link to="/profile" class="profile-link">
            <BaseIcon name="user" />
            <span>{{ userEmail }}</span>
          </router-link>
          <BaseButton variant="ghost" size="sm" @click="onLogout">Déconnexion</BaseButton>
        </template>
        <template v-else>
          <BaseButton variant="ghost" size="sm" @click="onLoginClick">Connexion</BaseButton>
          <BaseButton variant="primary" size="sm" @click="onRegisterClick">S'inscrire</BaseButton>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import ShibuiLogo from '../atoms/ShibuiLogo.vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import BaseButton from '../atoms/BaseButton.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps<{
  isAuthenticated: boolean;
  userEmail?: string;
  userRole?: string;
}>();

const emit = defineEmits(['logout']);

const onLogout = () => {
  emit('logout');
};

const onLoginClick = () => {
  emit('logout'); // Vider le store
  router.push('/login');
};

const onRegisterClick = () => {
  emit('logout'); // Vider le store
  router.push('/register');
};

const onNavClick = () => {
  // Si on est déjà authentifié et qu'on clique sur le logo/accueil,
  // on ne vide pas nécessairement le store sauf si c'est explicitement demandé.
  // L'utilisateur demande spécifiquement pour Connexion/Inscription.
};
</script>

<style scoped>
.app-header {
  height: 80px;
  background: white;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
}

.header-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-link {
  text-decoration: none;
  display: flex;
}

.logo {
  height: 40px;
}

.nav-section {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-light);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--shibui-orange);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--shibui-dark-gray);
  font-weight: 600;
}
</style>
