import { apiClient } from './apiClient.js';

export const gamificationService = {
  profile: () =>
    apiClient.get('/gamification/profile').then(({ data }) => data),
    
  leaderboard: (period, scope = 'global') =>
    apiClient
      .get('/gamification/leaderboard', { params: { period, scope } })
      .then(({ data }) => data),
      
  searchUsers: (query) =>
    apiClient
      .get('/gamification/users/search', { params: { q: query } })
      .then(({ data }) => data),
      
  addFriend: (friendId) =>
    apiClient
      .post('/gamification/friends/add', { friendId })
      .then(({ data }) => data),
      
  removeFriend: (friendId) =>
    apiClient
      .post('/gamification/friends/remove', { friendId })
      .then(({ data }) => data),
      
  redeemCosmetic: (itemId, itemType) =>
    apiClient
      .post('/gamification/redeem-cosmetic', { itemId, itemType })
      .then(({ data }) => data),
      
  selectCosmetics: (titleId, frameId) =>
    apiClient
      .post('/gamification/select-cosmetics', { titleId, frameId })
      .then(({ data }) => data),
      
  updateProfileFields: (college, company) =>
    apiClient
      .post('/gamification/update-profile-fields', { college, company })
      .then(({ data }) => data),
};
