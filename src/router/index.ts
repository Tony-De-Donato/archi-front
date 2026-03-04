import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import JobBoardView from '../views/JobBoardView.vue';
import ProfileView from '../views/ProfileView.vue';
import { useAuth } from '../composables/useAuth';
import ForgotPasswordView from "../views/ForgotPasswordView.vue";
import CompanyOffersView from "../views/CompanyOffersView.vue";

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
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView
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
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuth();
  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    next('/login');
  } else if (to.meta.role && auth.user.value?.role !== to.meta.role) {
    next('/offers');
  } else if ((to.name === 'login' || to.name === 'register' || to.name === 'home') && auth.isAuthenticated.value) {
    next('/offers');
  } else {
    next();
  }
});

export default router;
