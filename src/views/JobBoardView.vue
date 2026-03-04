<template>
  <div class="job-board">
    <!-- Header -->
    <header class="job-header">
      <ShibuiLogo size="md" @click="$router.push('/')" class="clickable-logo" />

      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-input-group border-right">
          <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" placeholder="Rechercher" class="search-input" />
        </div>
        <div class="search-input-group padding-left">
          <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <input type="text" placeholder="Martigues (13)" class="search-input" />
        </div>
      </div>

      <div class="header-actions">
        <button @click="$router.push('/profile')" class="profile-icon-button">
          <svg class="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </button>
        <BaseButton size="sm" variant="ghost" @click="logout">Déconnexion</BaseButton>
      </div>
    </header>

    <main class="job-main">
      <!-- Offers List -->
      <div class="offers-sidebar">
        <h2 class="sidebar-title">Offres d'emplois</h2>

        <div
          v-for="offer in offers"
          :key="offer.id"
          @click="selectedOffer = offer"
          class="offer-card"
          :class="{ active: selectedOffer?.id === offer.id }"
        >
          <div class="offer-card-header">
            <h3 class="offer-card-title">{{ offer.title }}</h3>
            <button class="save-button">
              <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            </button>
          </div>
          <p class="offer-company">Entreprise "{{ offer.companyName || '#' + offer.companyId }}"</p>
          <p class="offer-location">{{ offer.location }}</p>

          <div class="offer-tags">
            {{offer}}
          </div>
          <p class="offer-label">Annonce</p>
        </div>
      </div>

      <!-- Offer Detail -->
      <div class="offer-detail">
        <template v-if="selectedOffer">
          <BaseCard padding="lg" class="detail-header-card">
            <h1 class="detail-title">{{ selectedOffer.title }}</h1>
            <div class="detail-info">
              <p class="detail-company">Entreprise "{{ selectedOffer.companyName || '#' + selectedOffer.companyId }}"</p>
              <p class="detail-location">{{ selectedOffer.location }}</p>
              <p class="detail-type">{{ selectedOffer.type }}</p>
            </div>
            <BaseButton size="lg" :loading="applying" @click="handleApply">Postuler maintenant</BaseButton>
          </BaseCard>

          <BaseCard padding="lg">
            <h2 class="section-title">Informations sur le profil</h2>
            <div class="detail-description">
              <p>{{ selectedOffer.description }}</p>
            </div>
          </BaseCard>
        </template>
        <div v-else class="empty-detail">
          <svg class="icon-xl opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          <p>Sélectionnez une offre pour voir les détails</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { offerApplicationControllerApply, offerControllerGetOffers } from '../openApi';
import ShibuiLogo from '../components/ui/ShibuiLogo.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import type { Offer } from '../types';

const { user, logout } = useAuth();

const offers = ref<Offer[]>([]);
const selectedOffer = ref<Offer | null>(null);
const loading = ref(false);
const applying = ref(false);

async function fetchOffers() {
  loading.value = true;
  try {
    const { data } = await offerControllerGetOffers();
    offers.value = data as Offer[];
    if (offers.value.length > 0) {
      selectedOffer.value = offers.value[0] || null;
    }
  } catch (err) {
    console.error('Failed to fetch offers:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchOffers();
});

async function handleApply() {
  if (!selectedOffer.value || !user.value) return;
  applying.value = true;
  try {
    await offerApplicationControllerApply({ 
      path: { offerId: selectedOffer.value.id },
      body: { 
        studentId: user.value.id,
        cvUrl: 'https://example.com/cv.pdf' // Mock for now
      }
    });
    alert('Candidature envoyée avec succès !');
  } catch (err) {
    alert('Erreur lors de l\'envoi de la candidature.');
  } finally {
    applying.value = false;
  }
}
</script>

<style scoped>
.job-board {
  min-height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.job-header {
  border-bottom: 1px solid #f3f4f6;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.clickable-logo {
  cursor: pointer;
}

.search-container {
  display: none;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  max-width: 42rem;
  width: 100%;
  margin: 0 2rem;
}

@media (min-width: 768px) {
  .search-container {
    display: flex;
  }
}

.search-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.border-right {
  border-right: 1px solid #e5e7eb;
}

.padding-left {
  padding-left: 1.5rem;
}

.search-input {
  width: 100%;
  border: none;
  outline: none;
  color: var(--shibui-dark-gray);
  font-size: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-icon-button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.profile-icon-button:hover {
  color: var(--shibui-orange);
}

.job-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.offers-sidebar {
  width: 100%;
  border-right: 1px solid #f3f4f6;
  overflow-y: auto;
  background-color: rgba(249, 250, 251, 0.3);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .offers-sidebar {
    width: 450px;
  }
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--shibui-dark-gray);
  margin-bottom: 1.5rem;
}

.offer-card {
  background-color: white;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.offer-card:hover {
  box-shadow: var(--shadow-medium);
}

.offer-card.active {
  border-color: var(--shibui-orange);
  box-shadow: 0 0 0 1px var(--shibui-orange);
}

.offer-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.offer-card-title {
  font-weight: 700;
  color: var(--shibui-dark-gray);
  line-height: 1.25;
}

.save-button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
}

.save-button:hover {
  color: var(--shibui-orange);
}

.offer-company {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.offer-location {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.offer-tags {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tag-response {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #ffedd5;
  color: #9a3412;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-green {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #059669;
  font-size: 0.75rem;
  font-weight: 600;
}

.tag-orange {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--shibui-orange);
  font-size: 0.75rem;
  font-weight: 700;
}

.offer-label {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.offer-detail {
  flex: 1;
  overflow-y: auto;
  padding: 3rem;
  background-color: white;
}

.detail-header-card {
  margin-bottom: 2rem;
}

.detail-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--shibui-dark-gray);
  margin-bottom: 1rem;
}

.detail-info {
  margin-bottom: 2rem;
}

.detail-company {
  color: var(--shibui-dark-gray);
}

.detail-location, .detail-type {
  color: #6b7280;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--shibui-dark-gray);
  margin-bottom: 1.5rem;
}

.detail-description {
  color: #4b5563;
  line-height: 1.6;
}

.empty-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.icon-xs { width: 1rem; height: 1rem; }
.icon-md { width: 1.25rem; height: 1.25rem; }
.icon-lg { width: 1.5rem; height: 1.5rem; }
.icon-xl { width: 4rem; height: 4rem; }

.opacity-20 { opacity: 0.2; }
</style>
