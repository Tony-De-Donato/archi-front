import { client } from '../openApi/client.gen';

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

client.interceptors.request.use((request) => {
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
});

export default client;
