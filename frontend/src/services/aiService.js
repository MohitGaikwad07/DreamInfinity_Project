import { apiClient } from './apiClient.js';

export const aiService = {
  chat: (payload) => apiClient.post('/ai/chat', payload).then(({ data }) => data),
  summarize: (payload) => apiClient.post('/ai/summarize', payload).then(({ data }) => data),
  explain: (payload) => apiClient.post('/ai/explain', payload).then(({ data }) => data),
  roadmap: (payload) => apiClient.post('/ai/roadmap', payload).then(({ data }) => data),
  interviewHint: (payload) => apiClient.post('/ai/interview-hint', payload).then(({ data }) => data),
};
