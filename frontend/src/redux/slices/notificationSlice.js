import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService.js';

const getMsg = (error) => error?.response?.data?.message || error?.message || 'Operation failed.';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationService.getNotifications();
      return data.notifications;
    } catch (error) {
      return rejectWithValue(getMsg(error));
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const data = await notificationService.markAsRead(id);
      return data.notification;
    } catch (error) {
      return rejectWithValue(getMsg(error));
    }
  }
);

export const removeNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id);
      return id;
    } catch (error) {
      return rejectWithValue(getMsg(error));
    }
  }
);

export const clearNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.clearAll();
      return [];
    } catch (error) {
      return rejectWithValue(getMsg(error));
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    loading: false,
    error: null,
  },
  reducers: {
    addNotificationDirectly: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearNotificationErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter((n) => n._id !== action.payload);
      })
      .addCase(clearNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      });
  },
});

export const { addNotificationDirectly, clearNotificationErrors } = notificationSlice.actions;
export default notificationSlice.reducer;
