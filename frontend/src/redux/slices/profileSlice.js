import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { profileService } from '../../services/profileService.js';
import { logoutUser } from './authSlice.js';

const getErrorMessage = (error) => error?.errors?.[0]?.msg || error?.message || 'Something went wrong.';

export const fetchProfile = createAsyncThunk('profile/fetch', async (_, { rejectWithValue }) => {
  try { return await profileService.getProfile(); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const updateProfileDetails = createAsyncThunk('profile/update', async (payload, { rejectWithValue }) => {
  try { return await profileService.updateProfile(payload); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const createUserProject = createAsyncThunk('profile/addProject', async (payload, { rejectWithValue }) => {
  try { return await profileService.addProject(payload); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const updateUserProject = createAsyncThunk('profile/updateProject', async ({ id, payload }, { rejectWithValue }) => {
  try { return await profileService.updateProject(id, payload); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const deleteUserProject = createAsyncThunk('profile/deleteProject', async (id, { rejectWithValue }) => {
  try { return await profileService.deleteProject(id); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const createUserCertificate = createAsyncThunk('profile/addCertificate', async (payload, { rejectWithValue }) => {
  try { return await profileService.addCertificate(payload); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const deleteUserCertificate = createAsyncThunk('profile/deleteCertificate', async (id, { rejectWithValue }) => {
  try { return await profileService.deleteCertificate(id); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const triggerAiSummary = createAsyncThunk('profile/aiSummary', async (_, { rejectWithValue }) => {
  try { return await profileService.generateAiSummary(); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const triggerAiReview = createAsyncThunk('profile/aiReview', async (_, { rejectWithValue }) => {
  try { return await profileService.generateAiReview(); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const fetchPublicProfile = createAsyncThunk('profile/fetchPublic', async (username, { rejectWithValue }) => {
  try { return await profileService.getPublicProfile(username); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

const initialState = {
  profile: null,
  activity: null,
  publicProfile: null,
  publicActivity: null,
  loading: false,
  error: null,
  aiSummaryLoading: false,
  aiReviewLoading: false
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => { state.error = null; },
    resetPublicProfile: (state) => {
      state.publicProfile = null;
      state.publicActivity = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.activity = action.payload.activity;
      })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Update Profile Details
      .addCase(updateProfileDetails.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfileDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.activity = action.payload.activity;
      })
      .addCase(updateProfileDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(logoutUser.fulfilled, (state) => {
        state.profile = null;
        state.activity = null;
      })

      // Project Thunks
      .addCase(createUserProject.fulfilled, (state, action) => {
        if (state.profile) state.profile.projects = action.payload.projects;
      })
      .addCase(updateUserProject.fulfilled, (state, action) => {
        if (state.profile) state.profile.projects = action.payload.projects;
      })
      .addCase(deleteUserProject.fulfilled, (state, action) => {
        if (state.profile) state.profile.projects = action.payload.projects;
      })

      // Certificate Thunks
      .addCase(createUserCertificate.fulfilled, (state, action) => {
        if (state.profile) state.profile.certificates = action.payload.certificates;
      })
      .addCase(deleteUserCertificate.fulfilled, (state, action) => {
        if (state.profile) state.profile.certificates = action.payload.certificates;
      })

      // AI summary
      .addCase(triggerAiSummary.pending, (state) => { state.aiSummaryLoading = true; })
      .addCase(triggerAiSummary.fulfilled, (state, action) => {
        state.aiSummaryLoading = false;
        if (state.profile) state.profile.aiCareerSummary = action.payload.aiCareerSummary;
      })
      .addCase(triggerAiSummary.rejected, (state) => { state.aiSummaryLoading = false; })

      // AI review
      .addCase(triggerAiReview.pending, (state) => { state.aiReviewLoading = true; })
      .addCase(triggerAiReview.fulfilled, (state, action) => {
        state.aiReviewLoading = false;
        if (state.profile) state.profile.aiPortfolioReview = action.payload.aiPortfolioReview;
      })
      .addCase(triggerAiReview.rejected, (state) => { state.aiReviewLoading = false; })

      // Public profile
      .addCase(fetchPublicProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.publicProfile = action.payload.profile;
        state.publicActivity = action.payload.activity;
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { clearProfileError, resetPublicProfile } = profileSlice.actions;
export default profileSlice.reducer;
