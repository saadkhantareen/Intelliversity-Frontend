/**
 * tenants.api.js — API calls related to tenants (universities).
 */

import apiClient from "./client";

/**
 * resolveTenant() — Given a slug like "nust", get the university's details.
 * If the slug doesn't exist, the backend returns 404.
 */
export async function resolveTenant(slug) {
  const response = await apiClient.get(`/api/v1/tenants/resolve/`, {
    params: { slug },
  });
  return response.data;
}

/**
 * listTenants() — Get ALL universities (Super Admin only).
 */
export async function listTenants() {
  const response = await apiClient.get("/api/v1/tenants/");
  return response.data;
}

/**
 * createTenant() — Register a new university (Super Admin only).
 */
export async function createTenant(data) {
  const response = await apiClient.post("/api/v1/tenants/", data);
  return response.data;
}
