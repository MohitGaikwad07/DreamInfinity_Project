import { apiClient } from './apiClient.js';

export const notificationService = {
  getNotifications: () =>
    apiClient.get('/notifications').then(({ data }) => data),

  markAsRead: (id) =>
    apiClient.put(`/notifications/${id}/read`).then(({ data }) => data),

  deleteNotification: (id) =>
    apiClient.delete(`/notifications/${id}`).then(({ data }) => data),

  clearAll: () =>
    apiClient.delete('/notifications').then(({ data }) => data),
};
