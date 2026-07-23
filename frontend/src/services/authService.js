import { apiClient } from './apiClient.js';

export const authService = {
  register: (payload) => apiClient.post('/auth/register', payload).then(({ data }) => data),
  login: (payload) => apiClient.post('/auth/login', payload).then(({ data }) => data),
  logout: () => apiClient.post('/auth/logout').then(({ data }) => data),
  getCurrentUser: () => apiClient.get('/auth/me').then(({ data }) => data),
  updateProfile: (payload) => apiClient.patch('/auth/profile', payload).then(({ data }) => data),
  changePassword: (payload) => apiClient.patch('/auth/change-password', payload).then(({ data }) => data),
  googleLogin: (payload) => apiClient.post('/auth/google', payload).then(({ data }) => data),
  googleMockLogin: (payload) => apiClient.post('/auth/google-mock', payload).then(({ data }) => data),
};
