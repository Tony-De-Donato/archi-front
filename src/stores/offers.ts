import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { 
  offerControllerGetOffers, 
  offerControllerGetOffer,
  offerControllerGetOffersByCompanyId,
  offerControllerCreateOffer,
  offerControllerUpdateOffer,
  offerControllerPublishOffer,
  offerControllerDeleteOffer
} from '../openApi';
import type { Offer } from '../types';
import { useCompanyStore } from './companies';

export const useOfferStore = defineStore('offers', () => {
  const offers = ref<Offer[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const companyStore = useCompanyStore();

  const publishedOffers = computed(() => 
    offers.value.filter(o => o.status === 'PUBLISHED')
  );

  async function fetchAllOffers() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await offerControllerGetOffers();
      offers.value = data as Offer[];
      
      // Récupérer les noms des entreprises pour chaque offre
      const companyIds = Array.from(new Set(offers.value.map(o => o.companyId)));
      await Promise.all(companyIds.map(id => companyStore.fetchCompanyById(id)));
      
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch offers';
      console.error('Error fetching offers:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchOffersByCompany(companyId: number) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await offerControllerGetOffersByCompanyId({
        path: { id: companyId }
      });
      // Merge with existing offers or replace? Usually for a company board, replacing is fine for current view.
      const companyOffers = data as Offer[];
      
      // Update our central offers list with these results (avoiding duplicates)
      companyOffers.forEach(newOffer => {
        const index = offers.value.findIndex(o => o.id === newOffer.id);
        if (index !== -1) {
          offers.value[index] = newOffer;
        } else {
          offers.value.push(newOffer);
        }
      });

      return companyOffers;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch company offers';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createOffer(companyId: number, offerData: Partial<Offer>, publish: boolean = false) {
    loading.value = true;
    try {
      const { data } = await offerControllerCreateOffer({
        path: { id: companyId },
        body: offerData as any
      });
      const newOffer = data as Offer;
      
      if (publish && newOffer.id) {
        const { data: publishedData } = await offerControllerPublishOffer({
          path: { offerId: newOffer.id }
        });
        Object.assign(newOffer, publishedData);
      }

      offers.value.push(newOffer);
      return newOffer;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create offer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateOffer(id: number, offerData: Partial<Offer>, publish: boolean = false) {
    loading.value = true;
    try {
      const { data } = await offerControllerUpdateOffer({
        path: { id },
        body: offerData as any
      });
      const updatedOffer = data as Offer;

      if (publish && updatedOffer.id) {
        const { data: publishedData } = await offerControllerPublishOffer({
          path: { offerId: updatedOffer.id }
        });
        Object.assign(updatedOffer, publishedData);
      }

      const index = offers.value.findIndex(o => o.id === id);
      if (index !== -1) {
        offers.value[index] = updatedOffer;
      }
      return updatedOffer;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update offer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteOffer(id: number) {
    loading.value = true;
    try {
      await offerControllerDeleteOffer({
        path: { offerId: id }
      });
      offers.value = offers.value.filter(o => o.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete offer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOfferById(id: number) {
    const existing = offers.value.find(o => o.id === id);
    if (existing) return existing;

    loading.value = true;
    error.value = null;
    try {
      const { data } = await offerControllerGetOffer({
        path: { offerId: id }
      });
      const offer = data as Offer;
      offers.value.push(offer);
      
      // Fetch company for this offer too
      if (offer.companyId) {
        await companyStore.fetchCompanyById(offer.companyId);
      }
      
      return offer;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch offer';
      console.error(`Error fetching offer ${id}:`, err);
    } finally {
      loading.value = false;
    }
    return null;
  }

  function getOfferById(id: number) {
    return offers.value.find(o => o.id === id);
  }

  return {
    offers,
    publishedOffers,
    loading,
    error,
    fetchAllOffers,
    fetchOffersByCompany,
    createOffer,
    updateOffer,
    deleteOffer,
    fetchOfferById,
    getOfferById
  };
});
