import { globalApi } from "./api";

export const globalService = {
  getTenantBranding: (domain) =>
    globalApi.get("/api/v1/tenants/branding/", { 
      params: { 
        domain
      } 
    }),
};
