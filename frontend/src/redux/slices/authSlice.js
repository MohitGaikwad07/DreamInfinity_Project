import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '../../services/authService.js';
import { clearStoredToken, getStoredToken, setStoredToken } from '../../services/apiClient.js';

const getErrorMessage = (error) => error?.errors?.[0]?.msg || error?.message || 'Something went wrong.';

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try { return await authService.register(payload); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try { return await authService.login(payload); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const loginWithGoogle = createAsyncThunk('auth/googleLogin', async ({ credential, mock }, { rejectWithValue }) => {
  try {
    if (mock) {
      return await authService.googleMockLogin(mock);
    } else {
      return await authService.googleLogin({ credential });
    }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});


export const loadCurrentUser = createAsyncThunk('auth/loadCurrentUser', async (_, { rejectWithValue }) => {
  try { return await authService.getCurrentUser(); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try { await authService.logout(); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const updateCurrentProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try { return await authService.updateProfile(payload); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

const fulfilledAuth = (state, action) => {
  state.loading = false;
  state.error = null;
  state.user = action.payload.user;
  state.token = action.payload.token;
  state.isAuthenticated = true;
  setStoredToken(action.payload.token);
};

const initialToken = getStoredToken();
const initialState = { user: null, token: initialToken, isAuthenticated: Boolean(initialToken), loading: false, initialized: false, error: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { 
    clearAuthError: (state) => { state.error = null; },
    updateUserDirectly: (state, action) => { state.user = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, fulfilledAuth)
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, fulfilledAuth)
      .addCase(loginWithGoogle.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithGoogle.fulfilled, fulfilledAuth)
      .addCase(loadCurrentUser.pending, (state) => { state.loading = true; })
      .addCase(loadCurrentUser.fulfilled, (state, action) => { state.loading = false; state.initialized = true; state.user = action.payload.user; state.isAuthenticated = true; })
      .addCase(loadCurrentUser.rejected, (state, action) => { state.loading = false; state.initialized = true; state.user = null; state.token = null; state.isAuthenticated = false; state.error = action.payload; clearStoredToken(); })
      .addCase(logoutUser.fulfilled, (state) => { Object.assign(state, { user: null, token: null, isAuthenticated: false, error: null }); clearStoredToken(); })
      .addCase(logoutUser.rejected, (state) => { Object.assign(state, { user: null, token: null, isAuthenticated: false }); clearStoredToken(); })
      .addCase(updateCurrentProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateCurrentProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; })
      .addMatcher((action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected') && action.type !== loadCurrentUser.rejected.type && action.type !== logoutUser.rejected.type, (state, action) => { state.loading = false; state.error = action.payload || 'Something went wrong.'; });
  },
});

export const { clearAuthError, updateUserDirectly } = authSlice.actions;
export default authSlice.reducer;
