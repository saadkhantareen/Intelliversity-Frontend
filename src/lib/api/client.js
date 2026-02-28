/**
 * client.js — The central API client (Axios instance).
 *
 * Every time your app needs to talk to the Django backend, it goes through
 * this file. It:
 *   1. Knows the backend's address (base URL)
 *   2. Always attaches your JWT token to every request
 *   3. Always writes which university you're from (X-Tenant-Slug header)
 *   4. If your token expires, automatically refreshes it
 */

import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR — Runs BEFORE every API call is sent.
 * Attaches JWT token and tenant slug.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantSlug = localStorage.getItem("tenantSlug");
    if (tenantSlug) {
      config.headers["X-Tenant-Slug"] = tenantSlug;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR — Runs AFTER every API response arrives.
 * If 401 Unauthorized, tries to refresh the token automatically.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
