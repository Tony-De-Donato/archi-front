import { ref } from 'vue';
import { defineStore } from 'pinia';
import { 
  offerApplicationControllerGetApplicationsByStudentId,
  offerApplicationControllerGetApplicationByOfferId,
  offerApplicationControllerApply,
  offerApplicationControllerCancelApplication
} from '../openApi';
import type { Application } from '../types';
import { useOfferStore } from './offers';

export const useApplicationStore = defineStore('applications', () => {
  const applications = ref<Application[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchStudentApplications(studentId: number) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await offerApplicationControllerGetApplicationsByStudentId({
        path: { studentId }
      });
      applications.value = data as Application[];
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch student applications';
      console.error('Error fetching student applications:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchOfferApplications(offerId: number) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await offerApplicationControllerGetApplicationByOfferId({
        path: { offerId }
      });
      // Pour les entreprises, on remplace peut-être par les candidatures de cette offre spécifique
      // ou on les merge. Gardons une liste locale pour le store si besoin, 
      // ou retournons les simplement.
      return data as Application[];
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch offer applications';
      console.error('Error fetching offer applications:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function applyToOffer(offerId: number, studentId: number, description: string = '') {
    loading.value = true;
    try {
      const { data } = await offerApplicationControllerApply({
        path: { offerId },
        body: { description } as any
      });
      const newApplication = data as Application;
      applications.value.push(newApplication);
      return newApplication;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to apply';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function cancelApplication(applicationId: number) {
    loading.value = true;
    try {
      await offerApplicationControllerCancelApplication({
        path: { applicationId }
      });
      applications.value = applications.value.filter(a => a.id !== applicationId);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to cancel application';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function hasAppliedTo(offerId: number) {
    return applications.value.some(a => a.offerId === offerId);
  }

  return {
    applications,
    loading,
    error,
    fetchStudentApplications,
    fetchOfferApplications,
    applyToOffer,
    cancelApplication,
    hasAppliedTo
  };
});
