import axios from 'axios';

const currentHost = window.location.hostname;
const currentOrigin = `${window.location.protocol}//${currentHost}`;

const resolveApiBaseUrl = (explicitUrl) => {
  if (!explicitUrl) {
    return `${currentOrigin}:8000`;
  }

  try {
    const parsed = new URL(explicitUrl);
    if (parsed.hostname === currentHost) {
      return explicitUrl;
    }
  } catch {
    // Fall back to current host if the provided URL is invalid.
  }

  return `${currentOrigin}:8000`;
};

const backendURL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const globalURL = resolveApiBaseUrl(
  import.meta.env.VITE_GLOBAL_API_URL || import.meta.env.VITE_API_BASE_URL
);

export const globalApi = axios.create({
  baseURL: globalURL,
});

export const api = axios.create({
  baseURL: backendURL,
});

// Request interceptor — attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Endpoints whose own 401/400 responses must never trigger a session redirect.
// A failed login attempt belongs on /login with a visible error, not on a
// forced reload that swallows the message (or creates a redirect loop).
const PUBLIC_AUTH_ENDPOINTS = [
  '/api/v1/accounts/login/',
  '/api/v1/accounts/forgot-password/',
  '/api/v1/accounts/reset-password/',
];

const isPublicAuthRequest = (url = '') =>
  PUBLIC_AUTH_ENDPOINTS.some((endpoint) => String(url).includes(endpoint));

// Response interceptor — handle expired token on authenticated requests only
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';
    const hasSession = Boolean(
      localStorage.getItem('access_token') || localStorage.getItem('refresh_token')
    );

    if (status === 401 && hasSession && !isPublicAuthRequest(requestUrl)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
