import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on login endpoints
      const isLoginEndpoint = error.config?.url?.includes('/auth/') && 
                              (error.config?.url?.includes('login') || error.config?.url?.includes('register'));
      
      if (!isLoginEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/student-login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
