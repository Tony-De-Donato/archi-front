<template>
  <div class="home-view">
    <!-- Background Gradient -->
    <div class="bg-gradient"></div>

    <!-- Logo at top left -->
    <div class="logo-position">
      <ShibuiLogo size="lg" />
    </div>

    <!-- Hero Content -->
    <div class="hero-content">
      <h1 class="hero-title">
        Notre Taff,<br />
        <span class="highlight">Rendre la recherche agréable</span>
      </h1>
      <p class="copyright-text">
        ©2025 Shibui - Cookies, confidentialité et conditions d'utilisation
      </p>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <BaseButton variant="outline" size="xl" @click="$router.push('/login')">
          Me connecter
        </BaseButton>
        <BaseButton variant="secondary" size="xl" class="dark-gray-text" @click="$router.push('/register')">
          Commencer
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShibuiLogo from '../components/ui/ShibuiLogo.vue';
import BaseButton from '../components/ui/BaseButton.vue';
</script>

<style scoped>
.home-view {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background-color: var(--shibui-orange);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem;
}

@media (min-width: 768px) {
  .home-view {
    padding: 4rem;
  }
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, #FFD194, #D1913C);
  opacity: 0.3;
}

.logo-position {
  position: absolute;
  top: 2rem;
  left: 2rem;
}

@media (min-width: 768px) {
  .logo-position {
    top: 3rem;
    left: 3rem;
  }
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 42rem;
}

.hero-title {
  color: white;
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 4.5rem;
  }
}

.highlight {
  color: white;
}

.copyright-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin-bottom: 3rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .action-buttons {
    flex-direction: row;
  }
}

.dark-gray-text {
  color: var(--shibui-dark-gray) !important;
}
</style>
