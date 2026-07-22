import { apiClient } from './apiClient.js';

export const uploadService = {
  upload: (file, folder = 'favour-ai/general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(({ data }) => data);
  },

  delete: (publicId) =>
    apiClient.post('/upload/delete', { publicId }).then(({ data }) => data),
};
