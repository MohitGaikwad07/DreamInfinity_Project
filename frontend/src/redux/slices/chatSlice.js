import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';
import { aiService } from '../../services/aiService.js';

const welcome = { id: 'welcome', role: 'assistant', content: "Hi! I’m Dream Infinity, your career mentor. I can help you prepare for interviews, understand technical topics, improve your resume, and build a focused learning plan.", createdAt: new Date().toISOString() };
const errorMessage = (error) => error?.errors?.[0]?.msg || error?.message || 'The AI assistant could not respond. Please try again.';

export const sendChatMessage = createAsyncThunk('chat/send', async ({ prompt, context }, { getState, rejectWithValue }) => {
  try {
    const history = getState().chat.messages.slice(-12).filter((message) => message.id !== 'welcome').map(({ role, content }) => ({ role, content }));
    return await aiService.chat({ prompt, history, context });
  } catch (error) { return rejectWithValue(errorMessage(error)); }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: { messages: [welcome], conversations: [{ id: 'current', title: 'New conversation', active: true }], loading: false, error: null },
  reducers: {
    clearConversation: (state) => { state.messages = [{ ...welcome, id: nanoid(), createdAt: new Date().toISOString() }]; state.error = null; },
    clearChatError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => builder
    .addCase(sendChatMessage.pending, (state, action) => { state.loading = true; state.error = null; state.messages.push({ id: action.meta.arg.id, role: 'user', content: action.meta.arg.prompt, createdAt: new Date().toISOString() }); })
    .addCase(sendChatMessage.fulfilled, (state, action) => { state.loading = false; state.messages.push({ id: nanoid(), ...action.payload.message, createdAt: new Date().toISOString() }); if (state.conversations[0]?.title === 'New conversation') state.conversations[0].title = action.meta.arg.prompt.slice(0, 32); })
    .addCase(sendChatMessage.rejected, (state, action) => { state.loading = false; state.error = action.payload; }),
});

export const { clearConversation, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
