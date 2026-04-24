import axios from 'axios';

function resolveApiBaseUrl() {
  const configuredBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
  const fallbackBaseUrl = 'http://localhost:8080/api';
  const rawBaseUrl = configuredBaseUrl || fallbackBaseUrl;

  if (typeof window === 'undefined') {
    return rawBaseUrl;
  }

  if (rawBaseUrl.startsWith('/')) {
    return rawBaseUrl;
  }

  try {
    const url = new URL(rawBaseUrl);
    const isLoopbackHost = ['localhost', '127.0.0.1'].includes(url.hostname);
    const isRemoteBrowser = !['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (isLoopbackHost && isRemoteBrowser) {
      url.hostname = window.location.hostname;
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    return rawBaseUrl;
  }
}

const API_BASE_URL = resolveApiBaseUrl();

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
