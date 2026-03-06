import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

export function useAuth() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { user, token, loading, error, isAuthenticated } = storeToRefs(authStore);

  async function login(credentials: any) {
    const success = await authStore.login(credentials);
    if (success) {
      router.push('/offers');
    }
  }

  async function registerStudent(data: any) {
    const success = await authStore.registerStudent(data);
    if (success) {
      router.push('/offers');
    }
  }

  async function registerCompany(data: any) {
    const success = await authStore.registerCompany(data);
    if (success) {
      router.push('/offers');
    }
  }

  function logout() {
    authStore.logout();
    router.push('/login');
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    registerStudent,
    registerCompany,
    logout,
    fetchCurrentUser: authStore.fetchCurrentUser
  };
}
