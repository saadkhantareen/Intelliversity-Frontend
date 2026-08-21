// src/services/lookups.service.js
import api from "./api";
import { toList } from "../utils/attendanceMappers";

/**
 * Dropdown data (course offerings + terms).
 * Uses exact endpoints exposed by apps.enrollments and apps.academics.
 */

const OFFERING_MINE_URLS = [
  "/api/v1/enrollments/course-offerings/me/faculty/",
  "/api/v1/enrollments/course-offerings/me/student/",
  "/api/v1/enrollments/course-offerings/",
];

const OFFERING_ALL_URLS = [
  "/api/v1/enrollments/course-offerings/",
];

const TERM_URLS = [
  "/api/v1/academics/terms/",
];

const cache = new Map();

async function firstWorking(urls, params = {}, cacheKey = null) {
  if (cacheKey && cache.has(cacheKey)) {
    const url = cache.get(cacheKey);
    try {
      const res = await api.get(url, { params });
      return toList(res.data);
    } catch {
      cache.delete(cacheKey); // clear stale cache if failed
    }
  }

  let lastError;
  for (const url of urls) {
    try {
      const res = await api.get(url, { params });
      if (cacheKey) cache.set(cacheKey, url);
      return toList(res.data);
    } catch (error) {
      lastError = error;
      const code = error?.response?.status;
      if (code !== 404 && code !== 405 && code !== 403) throw error;
    }
  }
  return []; // Fallback to empty array if no endpoint matches
}

/** Offerings the logged-in teacher/student is attached to. */
export async function listMyCourseOfferings(params = {}) {
  return firstWorking(OFFERING_MINE_URLS, params, "offerings:mine");
}

/** Every offering in the tenant (admin dropdowns). */
export async function listAllCourseOfferings(params = {}) {
  return firstWorking(OFFERING_ALL_URLS, params, "offerings:all");
}

/** Academic terms — required by the compliance report. */
export async function listTerms(params = {}) {
  return firstWorking(TERM_URLS, params, "terms");
}

const lookupsService = {
  listMyCourseOfferings,
  listAllCourseOfferings,
  listTerms,
};

export default lookupsService;
