import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { interviewService } from '../../services/interviewService.js';
const fail = (error) => error?.errors?.[0]?.msg || error?.message || 'The interview engine could not complete that action.';
export const startInterview = createAsyncThunk('interview/start', async (data, { rejectWithValue }) => { try { return await interviewService.start(data); } catch (error) { return rejectWithValue(fail(error)); } });
export const submitAnswer = createAsyncThunk('interview/answer', async (data, { rejectWithValue }) => { try { return await interviewService.answer(data); } catch (error) { return rejectWithValue(fail(error)); } });
export const getNextQuestion = createAsyncThunk('interview/question', async (id, { rejectWithValue }) => { try { return await interviewService.question(id); } catch (error) { return rejectWithValue(fail(error)); } });
export const finishInterview = createAsyncThunk('interview/finish', async (data, { rejectWithValue }) => { try { return await interviewService.finish(data); } catch (error) { return rejectWithValue(fail(error)); } });
export const loadInterviewHistory = createAsyncThunk('interview/history', async (_, { rejectWithValue }) => { try { return await interviewService.history(); } catch (error) { return rejectWithValue(fail(error)); } });
export const loadInterviewDashboard = createAsyncThunk('interview/dashboard', async (_, { rejectWithValue }) => { try { return await interviewService.dashboard(); } catch (error) { return rejectWithValue(fail(error)); } });
const slice = createSlice({ name: 'interview', initialState: { mode: 'setup', interview: null, currentQuestion: '', transcript: [], elapsedSeconds: 0, evaluation: null, history: [], dashboard: null, loading: false, error: null }, reducers: { tick: (state) => { state.elapsedSeconds += 1; }, setMode: (state, action) => { state.mode = action.payload; }, clearInterview: (state) => Object.assign(state, { mode: 'setup', interview: null, currentQuestion: '', transcript: [], elapsedSeconds: 0, evaluation: null, error: null }), clearInterviewError: (state) => { state.error = null; } }, extraReducers: (builder) => builder
  .addCase(startInterview.pending, (state) => { state.loading = true; state.error = null; })
  .addCase(startInterview.fulfilled, (state, action) => { state.loading = false; state.mode = 'room'; state.interview = action.payload.interview; state.currentQuestion = action.payload.question; state.transcript = []; state.elapsedSeconds = 0; })
  .addCase(submitAnswer.pending, (state) => { state.loading = true; })
  .addCase(submitAnswer.fulfilled, (state, action) => { state.loading = false; state.evaluation = action.payload.evaluation; state.transcript.push(action.payload.turn); })
  .addCase(getNextQuestion.pending, (state) => { state.loading = true; })
  .addCase(getNextQuestion.fulfilled, (state, action) => { state.loading = false; state.currentQuestion = action.payload.question; state.evaluation = null; })
  .addCase(finishInterview.pending, (state) => { state.loading = true; })
  .addCase(finishInterview.fulfilled, (state, action) => { state.loading = false; state.mode = 'result'; state.interview = action.payload.interview; state.currentQuestion = ''; })
  .addCase(loadInterviewHistory.fulfilled, (state, action) => { state.history = action.payload.interviews; })
  .addCase(loadInterviewDashboard.fulfilled, (state, action) => { state.dashboard = action.payload.metrics; })
  .addMatcher((action) => action.type.startsWith('interview/') && action.type.endsWith('/rejected'), (state, action) => { state.loading = false; state.error = action.payload; }) });
export const { tick, setMode, clearInterview, clearInterviewError } = slice.actions;
export default slice.reducer;
