import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './composables/useApi' // Initialize API client configuration and interceptors
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Persist auth state on reload
const authStore = useAuthStore()
if (authStore.token) {
  authStore.fetchCurrentUser()
}

app.mount('#app')
