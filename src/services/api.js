import axios from "axios";
const backendURL = `${window.location.protocol}//${window.location.hostname}:8000`;

const globalURL = import.meta.env.VITE_GLOBAL_API_URL;

// 1. GLOBAL API (No Auth, Used for fetching tenant branding, global configs, etc.
export const globalApi = axios.create({
  baseURL: globalURL,
});

export const api = axios.create({
  baseURL: backendURL,
});

// Attach auth token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — clear stale session and redirect to login
// Request interceptor — attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle expired token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api
