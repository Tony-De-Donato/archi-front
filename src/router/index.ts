import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import JobBoardView from '../views/JobBoardView.vue';
import ProfileView from '../views/ProfileView.vue';
import { useAuth } from '../composables/useAuth';
import CompanyOffersView from "../views/CompanyOffersView.vue";
import StudentApplicationsView from "../views/StudentApplicationsView.vue";

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/offers',
    name: 'offers',
    component: JobBoardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/company/offers',
    name: 'company-offers',
    component: CompanyOffersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/student/applications',
    name: 'student-applications',
    component: StudentApplicationsView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuth();
  
  // Wait for user to be fetched if token exists but user doesn't
  if (auth.token.value && !auth.user.value) {
    await auth.fetchCurrentUser();
  }
  
  const isAuthenticated = auth.isAuthenticated.value;
  const userRole = auth.user.value?.role;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // Role-based access control
  if (isAuthenticated) {
    // If trying to access student-only /offers but user is COMPANY
    if (to.name === 'offers' && userRole === 'COMPANY') {
      next('/company/offers');
      return;
    }
    // If trying to access company-only /company/offers but user is STUDENT
    if (to.name === 'company-offers' && userRole === 'STUDENT') {
      next('/offers');
      return;
    }

    // If trying to access student-only /student/applications but user is COMPANY
    if (to.name === 'student-applications' && userRole === 'COMPANY') {
      next('/company/offers');
      return;
    }

    // Redirection after login or from home if already authenticated
    if (to.name === 'login' || to.name === 'register' || to.name === 'home') {
      if (userRole === 'COMPANY') {
        next('/company/offers');
      } else {
        next('/offers');
      }
      return;
    }
  }

  next();
});

export default router;
