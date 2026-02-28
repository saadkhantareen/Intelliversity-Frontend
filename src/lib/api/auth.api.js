/**
 * auth.api.js — All authentication-related API calls.
 */

import apiClient from "./client";

/**
 * login() — Send email + password to the backend, get JWT tokens back.
 * Backend response includes: access, refresh, user: { id, name, email, roles: [...] }
 */
export async function login(email, password) {
  const response = await apiClient.post("/api/v1/auth/login/", {
    email,
    password,
  });
  return response.data;
}

/**
 * logout() — Tell the backend to blacklist the refresh token.
 */
export async function logout(refreshToken) {
  const response = await apiClient.post("/api/v1/auth/logout/", {
    refresh: refreshToken,
  });
  return response.data;
}

/**
 * getMe() — Get the currently logged-in user's profile.
 * Called on app startup to check if the stored token is still valid.
 */
export async function getMe() {
  const response = await apiClient.get("/api/v1/auth/me/");
  return response.data;
}
