/**
 * queryClient.js — Configuration for TanStack Query (React Query).
 *
 * Provides automatic caching, background refetching, retries,
 * and deduplication of API requests.
 */

import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default queryClient;
