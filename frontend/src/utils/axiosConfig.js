import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add auth token if available
axiosInstance.interceptors.request.use((config) => {
  const requestUrl = (config?.url || '').toString();
  const isAuthEndpoint = requestUrl.startsWith('/auth/') || requestUrl.startsWith('/login') || requestUrl.startsWith('/register');

  if (isAuthEndpoint) {
    return config;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
