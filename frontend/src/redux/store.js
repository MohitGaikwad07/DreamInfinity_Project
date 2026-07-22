import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import dashboardReducer from './slices/dashboardSlice.js';
import chatReducer from './slices/chatSlice.js';
import resumeReducer from './slices/resumeSlice.js';
import skillGapReducer from './slices/skillGapSlice.js';
import interviewReducer from './slices/interviewSlice.js';
import codingReducer from './slices/codingSlice.js';
import videoInterviewReducer from './slices/videoInterviewSlice.js';
import communityReducer from './slices/communitySlice.js';
import companyReducer from './slices/companySlice.js';
import gamificationReducer from './slices/gamificationSlice.js';
import analyticsReducer from './slices/analyticsSlice.js';
import profileReducer from './slices/profileSlice.js';
import notificationReducer from './slices/notificationSlice.js';
import settingsReducer from './slices/settingsSlice.js';

export const store = configureStore({
  reducer: { 
    auth: authReducer, 
    dashboard: dashboardReducer, 
    chat: chatReducer, 
    resume: resumeReducer, 
    skillGap: skillGapReducer, 
    interview: interviewReducer, 
    coding: codingReducer, 
    videoInterview: videoInterviewReducer, 
    community: communityReducer, 
    company: companyReducer, 
    gamification: gamificationReducer, 
    analytics: analyticsReducer, 
    profile: profileReducer,
    notifications: notificationReducer,
    settings: settingsReducer
  },
  devTools: import.meta.env.DEV,
});
