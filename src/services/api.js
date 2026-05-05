import axios from "axios";

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
  } catch (error) {
    // Fall back to current host if the provided URL is invalid.
  }

  return `${currentOrigin}:8000`;
};

const backendURL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const globalURL = resolveApiBaseUrl(
  import.meta.env.VITE_GLOBAL_API_URL || import.meta.env.VITE_API_BASE_URL,
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
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

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

export default api;