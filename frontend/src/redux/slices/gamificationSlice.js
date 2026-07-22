import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { gamificationService } from '../../services/gamificationService.js';

const msg = (e) => e?.response?.data?.message || e?.message || 'Gamification action failed.';

export const loadGamification = createAsyncThunk(
  'gamification/profile',
  async (_, { rejectWithValue }) => {
    try {
      return await gamificationService.profile();
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const loadLeaderboard = createAsyncThunk(
  'gamification/leaderboard',
  async ({ period, scope }, { rejectWithValue }) => {
    try {
      return await gamificationService.leaderboard(period, scope);
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const searchUsers = createAsyncThunk(
  'gamification/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      return await gamificationService.searchUsers(query);
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const addFriend = createAsyncThunk(
  'gamification/addFriend',
  async (friendId, { rejectWithValue, dispatch }) => {
    try {
      const response = await gamificationService.addFriend(friendId);
      // Reload profile to fetch updated friends/XP
      dispatch(loadGamification());
      return response;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const removeFriend = createAsyncThunk(
  'gamification/removeFriend',
  async (friendId, { rejectWithValue, dispatch }) => {
    try {
      const response = await gamificationService.removeFriend(friendId);
      dispatch(loadGamification());
      return response;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const redeemCosmetic = createAsyncThunk(
  'gamification/redeemCosmetic',
  async ({ itemId, itemType }, { rejectWithValue, dispatch }) => {
    try {
      const response = await gamificationService.redeemCosmetic(itemId, itemType);
      dispatch(loadGamification());
      return response;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const selectCosmetics = createAsyncThunk(
  'gamification/selectCosmetics',
  async ({ titleId, frameId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await gamificationService.selectCosmetics(titleId, frameId);
      dispatch(loadGamification());
      return response;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const updateProfileFields = createAsyncThunk(
  'gamification/updateProfileFields',
  async ({ college, company }, { rejectWithValue, dispatch }) => {
    try {
      const response = await gamificationService.updateProfileFields(college, company);
      dispatch(loadGamification());
      return response;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

const slice = createSlice({
  name: 'gamification',
  initialState: {
    data: null,
    leaderboard: [],
    searchResults: [],
    period: 'all',
    scope: 'global',
    loading: false,
    actionLoading: false,
    error: null,
    actionError: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.actionError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loadGamification
      .addCase(loadGamification.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadGamification.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(loadGamification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // loadLeaderboard
      .addCase(loadLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload.leaderboard;
        state.period = action.payload.period;
        state.scope = action.payload.scope;
      })
      
      // searchUsers
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload.users;
      })
      
      // generic pending/rejected for actions
      .addMatcher(
        (action) => action.type.endsWith('/pending') && !action.type.startsWith('gamification/profile/'),
        (state) => {
          state.actionLoading = true;
          state.actionError = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') && !action.type.startsWith('gamification/profile/'),
        (state) => {
          state.actionLoading = false;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && !action.type.startsWith('gamification/profile/'),
        (state, action) => {
          state.actionLoading = false;
          state.actionError = action.payload;
        }
      );
  }
});

export const { clearErrors } = slice.actions;
export default slice.reducer;
