import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/analyticsService.js';

const msg = (e) => e?.response?.data?.message || e?.message || 'Analytics operation failed.';

export const loadAnalyticsOverview = createAsyncThunk(
  'analytics/overview',
  async (params, { rejectWithValue }) => {
    try {
      return await analyticsService.overview(params);
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const loadInterviewAnalytics = createAsyncThunk(
  'analytics/interviews',
  async (params, { rejectWithValue }) => {
    try {
      return await analyticsService.interviews(params);
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const loadCodingAnalytics = createAsyncThunk(
  'analytics/coding',
  async (params, { rejectWithValue }) => {
    try {
      return await analyticsService.coding(params);
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const loadResumeAnalytics = createAsyncThunk(
  'analytics/resume',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.resume();
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const loadSkillAnalytics = createAsyncThunk(
  'analytics/skills',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.skills();
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const loadCompanyReadiness = createAsyncThunk(
  'analytics/companyReadiness',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.companyReadiness();
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const loadLearningAnalytics = createAsyncThunk(
  'analytics/learning',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.learning();
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const completeWeek = createAsyncThunk(
  'analytics/completeWeek',
  async (week, { rejectWithValue, dispatch }) => {
    try {
      const response = await analyticsService.completeRoadmapWeek(week);
      dispatch(loadLearningAnalytics());
      return response;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const loadCommunityAnalytics = createAsyncThunk(
  'analytics/community',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.community();
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const loadWeeklyReport = createAsyncThunk(
  'analytics/weeklyReport',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.weeklyReport();
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

export const loadAIInsights = createAsyncThunk(
  'analytics/aiInsights',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.aiInsights();
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  }
);

const slice = createSlice({
  name: 'analytics',
  initialState: {
    overview: null,
    interviews: null,
    coding: null,
    resume: null,
    skills: null,
    readiness: null,
    learning: null,
    community: null,
    weeklyReport: null,
    aiInsights: null,
    selectedRange: '30d',
    customDateRange: { startDate: '', endDate: '' },
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedRange: (state, action) => {
      state.selectedRange = action.payload;
    },
    setCustomDateRange: (state, action) => {
      state.customDateRange = action.payload;
    },
    clearAnalyticsErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fulfilled actions mappings
      .addCase(loadAnalyticsOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(loadInterviewAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = action.payload.interviews;
      })
      .addCase(loadCodingAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.coding = action.payload.coding;
      })
      .addCase(loadResumeAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.resume = action.payload.resume;
      })
      .addCase(loadSkillAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload.skills;
      })
      .addCase(loadCompanyReadiness.fulfilled, (state, action) => {
        state.loading = false;
        state.readiness = action.payload.readiness;
      })
      .addCase(loadLearningAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.learning = action.payload.learning;
      })
      .addCase(loadCommunityAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.community = action.payload.community;
      })
      .addCase(loadWeeklyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklyReport = action.payload.report;
      })
      .addCase(loadAIInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.aiInsights = action.payload.insights;
      })
      
      // pending/rejected handlers for load actions
      .addMatcher(
        (action) => action.type.startsWith('analytics/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('analytics/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { setSelectedRange, setCustomDateRange, clearAnalyticsErrors } = slice.actions;
export default slice.reducer;
