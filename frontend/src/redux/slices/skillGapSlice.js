import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { skillGapService } from '../../services/skillGapService.js';
const errorMessage = (error) => error?.errors?.[0]?.msg || error?.message || 'Could not generate your readiness assessment.';
export const analyzeSkillGap = createAsyncThunk('skillGap/analyze', async (payload, { rejectWithValue }) => { try { return await skillGapService.analyze(payload); } catch (error) { return rejectWithValue(errorMessage(error)); } });
export const loadSkillGapHistory = createAsyncThunk('skillGap/history', async (_, { rejectWithValue }) => { try { return await skillGapService.history(); } catch (error) { return rejectWithValue(errorMessage(error)); } });
export const refreshRoadmap = createAsyncThunk('skillGap/roadmap', async (id, { rejectWithValue }) => { try { return await skillGapService.roadmap(id); } catch (error) { return rejectWithValue(errorMessage(error)); } });
const slice = createSlice({ name: 'skillGap', initialState: { assessments: [], currentAssessment: null, loading: false, error: null }, reducers: { selectAssessment: (state, action) => { state.currentAssessment = state.assessments.find((item) => item._id === action.payload) || null; }, clearSkillGapError: (state) => { state.error = null; } }, extraReducers: (builder) => builder
  .addCase(loadSkillGapHistory.fulfilled, (state, action) => { state.assessments = action.payload.assessments; state.currentAssessment ??= action.payload.assessments[0] || null; })
  .addCase(analyzeSkillGap.pending, (state) => { state.loading = true; state.error = null; })
  .addCase(analyzeSkillGap.fulfilled, (state, action) => { state.loading = false; state.assessments.unshift(action.payload.assessment); state.currentAssessment = action.payload.assessment; })
  .addCase(refreshRoadmap.pending, (state) => { state.loading = true; })
  .addCase(refreshRoadmap.fulfilled, (state, action) => { state.loading = false; state.currentAssessment = action.payload.assessment; const index = state.assessments.findIndex((item) => item._id === action.payload.assessment._id); if (index >= 0) state.assessments[index] = action.payload.assessment; })
  .addMatcher((action) => action.type.startsWith('skillGap/') && action.type.endsWith('/rejected'), (state, action) => { state.loading = false; state.error = action.payload; }) });
export const { selectAssessment, clearSkillGapError } = slice.actions;
export default slice.reducer;
