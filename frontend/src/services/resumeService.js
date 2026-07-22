import { apiClient } from './apiClient.js';

export const resumeService = {
  upload: (file, targetRole, onUploadProgress) => { const form = new FormData(); form.append('resume', file); form.append('targetRole', targetRole); return apiClient.post('/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress }).then(({ data }) => data); },
  getAll: () => apiClient.get('/resume').then(({ data }) => data),
  remove: (id) => apiClient.delete(`/resume/${id}`),
  analyze: (payload) => apiClient.post('/resume/analyze', payload).then(({ data }) => data),
};
