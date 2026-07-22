import { apiClient } from './apiClient.js';

export const getFeed = (params) => apiClient.get('/community/feed', { params });
export const createPost = (data) => apiClient.post('/community/post', data);
export const updatePost = (id, data) => apiClient.put(`/community/post/${id}`, data);
export const deletePost = (id) => apiClient.delete(`/community/post/${id}`);
export const vote = (data) => apiClient.post('/community/vote', data);
export const bookmark = (data) => apiClient.post('/community/bookmark', data);
export const getInsights = () => apiClient.get('/community/insights');
export const getComments = (postId) => apiClient.get(`/community/comments/${postId}`);
export const createComment = (data) => apiClient.post('/community/comment', data);
export const updateComment = (id, data) => apiClient.put(`/community/comment/${id}`, data);
export const deleteComment = (id) => apiClient.delete(`/community/comment/${id}`);
export const getBookmarks = () => apiClient.get('/community/bookmarks');
