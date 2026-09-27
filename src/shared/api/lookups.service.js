import api from "./client";
import { toList } from "@/features/attendance/utils/attendanceMappers";

const TERM_URLS = [
  "/api/v1/academics/terms/",
  "/api/v1/terms/",
  "/api/v1/academics/academic-terms/",
];

const OFFERING_ALL_URLS = [
  "/api/v1/enrollments/course-offerings/",
  "/api/v1/course-offerings/",
  "/api/v1/academics/course-offerings/",
];

const OFFERING_MY_URLS = [
  "/api/v1/enrollments/course-offerings/me/faculty/",
  "/api/v1/enrollments/course-offerings/my/",
  "/api/v1/course-offerings/my/",
  "/api/v1/faculty/course-offerings/",
];

async function tryEndpoints(urls, params = {}) {
  let lastErr = null;
  for (const url of urls) {
    try {
      const res = await api.get(url, { params });
      return toList(res.data);
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 403) {
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

export const lookupsService = {
  listTerms: (params) => tryEndpoints(TERM_URLS, params),
  listAllCourseOfferings: (params) => tryEndpoints(OFFERING_ALL_URLS, params),
  listMyCourseOfferings: async (params) => {
    try {
      const res = await tryEndpoints(OFFERING_MY_URLS, params);
      if (res.length > 0) return res;
      return await tryEndpoints(OFFERING_ALL_URLS, params);
    } catch {
      return await tryEndpoints(OFFERING_ALL_URLS, params);
    }
  },
};

export default lookupsService;