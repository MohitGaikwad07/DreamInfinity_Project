import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { resumeService } from '../../services/resumeService.js';

const message = (error) => error?.errors?.[0]?.msg || error?.message || 'Something went wrong with your resume.';
export const loadResumes = createAsyncThunk('resume/load', async (_, { rejectWithValue }) => { try { return await resumeService.getAll(); } catch (error) { return rejectWithValue(message(error)); } });
export const uploadResume = createAsyncThunk('resume/upload', async ({ file, targetRole }, { dispatch, rejectWithValue }) => { try { return await resumeService.upload(file, targetRole, (event) => dispatch(setUploadProgress(Math.round((event.loaded * 100) / event.total)))); } catch (error) { return rejectWithValue(message(error)); } });
export const deleteResume = createAsyncThunk('resume/delete', async (id, { rejectWithValue }) => { try { await resumeService.remove(id); return id; } catch (error) { return rejectWithValue(message(error)); } });
export const analyzeResume = createAsyncThunk('resume/analyze', async (payload, { rejectWithValue }) => { try { return await resumeService.analyze(payload); } catch (error) { return rejectWithValue(message(error)); } });

const resumeSlice = createSlice({ name: 'resume', initialState: { resumes: [], currentResume: null, loading: false, uploading: false, uploadProgress: 0, error: null }, reducers: { setUploadProgress: (state, action) => { state.uploadProgress = action.payload; }, selectResume: (state, action) => { state.currentResume = state.resumes.find((resume) => resume._id === action.payload) || null; }, clearResumeError: (state) => { state.error = null; } }, extraReducers: (builder) => builder
  .addCase(loadResumes.pending, (state) => { state.loading = true; })
  .addCase(loadResumes.fulfilled, (state, action) => { state.loading = false; state.resumes = action.payload.resumes; state.currentResume ??= action.payload.resumes[0] || null; })
  .addCase(uploadResume.pending, (state) => { state.uploading = true; state.uploadProgress = 0; state.error = null; })
  .addCase(uploadResume.fulfilled, (state, action) => { state.uploading = false; state.uploadProgress = 100; state.resumes.unshift(action.payload.resume); state.currentResume = action.payload.resume; })
  .addCase(deleteResume.fulfilled, (state, action) => { state.resumes = state.resumes.filter((resume) => resume._id !== action.payload); if (state.currentResume?._id === action.payload) state.currentResume = state.resumes[0] || null; })
  .addCase(analyzeResume.fulfilled, (state, action) => { state.currentResume = action.payload.resume; const index = state.resumes.findIndex((resume) => resume._id === action.payload.resume._id); if (index >= 0) state.resumes[index] = action.payload.resume; })
  .addMatcher((action) => action.type.startsWith('resume/') && action.type.endsWith('/rejected'), (state, action) => { state.loading = false; state.uploading = false; state.error = action.payload; }), });

export const { setUploadProgress, selectResume, clearResumeError } = resumeSlice.actions;
export default resumeSlice.reducer;
