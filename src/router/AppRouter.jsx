/**
 * AppRouter.jsx — THE ROOT OF THE ENTIRE APPLICATION.
 *
 * Asks one question: "Is there a subdomain in the URL?"
 *   YES → Show the University Portal (TenantApp)
 *   NO  → Show the Super Admin Portal (PlatformApp)
 */

import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "../lib/queryClient";
import { extractSubdomain } from "../lib/utils";
import { TenantApp } from "../apps/tenant/TenantApp";
import { PlatformApp } from "../apps/platform/PlatformApp";

export function AppRouter() {
  const subdomain = extractSubdomain();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {subdomain ? <TenantApp /> : <PlatformApp />}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
