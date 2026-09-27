import { api } from '@/shared/api/client';

export const authService = {
  login: (credentials) => api.post('/api/v1/accounts/login/', credentials),
  forgotPassword: (data) => api.post('/api/v1/accounts/forgot-password/', data),
  resetPassword: (uidb64, token, data) =>
    api.post(`/api/v1/accounts/reset-password/${uidb64}/${token}/`, data),
  logout: () => Promise.resolve(),
};
