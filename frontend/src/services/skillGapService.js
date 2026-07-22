import { apiClient } from './apiClient.js';
export const skillGapService = { analyze: (payload) => apiClient.post('/skill-gap/analyze', payload).then(({ data }) => data), history: () => apiClient.get('/skill-gap/history').then(({ data }) => data), roadmap: (assessmentId) => apiClient.post('/skill-gap/roadmap', { assessmentId }).then(({ data }) => data) };
