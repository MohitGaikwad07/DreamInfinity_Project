import { apiClient } from './apiClient.js';

export const analyticsService = {
  overview: (params) =>
    apiClient.get('/analytics/overview', { params }).then(({ data }) => data),

  interviews: (params) =>
    apiClient.get('/analytics/interviews', { params }).then(({ data }) => data),

  coding: (params) =>
    apiClient.get('/analytics/coding', { params }).then(({ data }) => data),

  resume: () =>
    apiClient.get('/analytics/resume').then(({ data }) => data),

  skills: () =>
    apiClient.get('/analytics/skills').then(({ data }) => data),

  companyReadiness: () =>
    apiClient.get('/analytics/company-readiness').then(({ data }) => data),

  learning: () =>
    apiClient.get('/analytics/learning').then(({ data }) => data),

  completeRoadmapWeek: (week) =>
    apiClient.post('/analytics/learning/complete-week', { week }).then(({ data }) => data),

  community: () =>
    apiClient.get('/analytics/community').then(({ data }) => data),

  weeklyReport: () =>
    apiClient.get('/analytics/weekly-report').then(({ data }) => data),

  aiInsights: () =>
    apiClient.get('/analytics/ai-insights').then(({ data }) => data),
};
