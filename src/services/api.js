import axios from "axios";

const backendURL = `${window.location.protocol}//${window.location.hostname}:8000`;
const globalURL = import.meta.env.VITE_GLOBAL_API_URL
  || `${window.location.protocol}//${window.location.hostname}:8000`;

export const globalApi = axios.create({
  baseURL: globalURL,
});

export const api = axios.create({
  baseURL: backendURL,
});

// Request interceptor – attach JWT to every request
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

// Response interceptor – handle expired token / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
