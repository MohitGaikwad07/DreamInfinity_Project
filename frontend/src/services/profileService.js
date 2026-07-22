import { apiClient } from './apiClient.js';

export const profileService = {
  getProfile: () => apiClient.get('/profile').then(({ data }) => data),
  updateProfile: (payload) => apiClient.put('/profile', payload).then(({ data }) => data),
  addProject: (payload) => apiClient.post('/profile/project', payload).then(({ data }) => data),
  updateProject: (id, payload) => apiClient.put(`/profile/project/${id}`, payload).then(({ data }) => data),
  deleteProject: (id) => apiClient.delete(`/profile/project/${id}`).then(({ data }) => data),
  addCertificate: (payload) => apiClient.post('/profile/certificate', payload).then(({ data }) => data),
  deleteCertificate: (id) => apiClient.delete(`/profile/certificate/${id}`).then(({ data }) => data),
  generateAiSummary: () => apiClient.post('/profile/ai-summary').then(({ data }) => data),
  generateAiReview: () => apiClient.post('/profile/ai-review').then(({ data }) => data),
  getPublicProfile: (username) => apiClient.get(`/profile/public/${username}`).then(({ data }) => data)
};
