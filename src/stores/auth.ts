import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { 
  authControllerLogin, 
  accountControllerRegisterStudent, 
  accountControllerRegisterCompany,
  testControllerGetUser
} from '../openApi';
import type { 
  LoginDto, 
  RegisterStudentDto, 
  RegisterCompanyDto 
} from '../openApi/types.gen';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials: LoginDto) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await authControllerLogin({ body: credentials });
      const session = (data as any)?.session;
      if (session?.accessToken) {
        token.value = session.accessToken;
        localStorage.setItem('token', token.value!);

        await fetchCurrentUser();
        return true;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function registerStudent(data: RegisterStudentDto) {
    loading.value = true;
    error.value = null;
    try {
      await accountControllerRegisterStudent({ body: data });
      return await login({ email: data.email, password: data.password });
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function registerCompany(data: RegisterCompanyDto) {
    loading.value = true;
    error.value = null;
    try {
      await accountControllerRegisterCompany({ body: data });
      return await login({ email: data.email, password: data.password });
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  async function fetchCurrentUser() {
    if (!token.value) return null;
    try {
      const { data } = await testControllerGetUser();
      user.value = data as User;
      return user.value;
    } catch (err) {
      logout();
      return null;
    }
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
    fetchCurrentUser
  };
});
