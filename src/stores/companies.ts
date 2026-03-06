import { ref } from 'vue';
import { defineStore } from 'pinia';
import { companyControllerGetCompanyProfile } from '../openApi';
import type { CompanyProfile } from '../types';

export const useCompanyStore = defineStore('companies', () => {
  const companies = ref<Record<number, CompanyProfile>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCompanyById(id: number) {
    if (companies.value[id]) return companies.value[id];

    loading.value = true;
    error.value = null;
    try {
      const { data } = await companyControllerGetCompanyProfile({
        path: { id }
      });
      if (data) {
        companies.value[id] = data as CompanyProfile;
        return companies.value[id];
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch company profile';
      console.error(`Error fetching company ${id}:`, err);
    } finally {
      loading.value = false;
    }
    return null;
  }

  function getCompanyName(id: number): string {
    return companies.value[id]?.legalName || 'Entreprise inconnue';
  }

  return {
    companies,
    loading,
    error,
    fetchCompanyById,
    getCompanyName
  };
});
