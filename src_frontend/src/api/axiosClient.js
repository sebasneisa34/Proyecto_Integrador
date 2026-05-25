import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    const isAuthPublicRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/security-question');

    if (status === 401 && !isAuthPublicRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

export default axiosClient;