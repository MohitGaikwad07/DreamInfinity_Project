import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  metrics: [
    ['Total Interviews', '24', '+4 this month'], ['AI Interviews', '18', '+3 this week'], ['Coding Problems', '147', '+21 this week'],
    ['Resume Score', '82%', '+6 points'], ['Community Contributions', '32', '+8 this month'], ['Average Score', '78%', '+5 points'],
  ],
  interviewProgress: [{ day: 'Mon', value: 2 }, { day: 'Tue', value: 4 }, { day: 'Wed', value: 3 }, { day: 'Thu', value: 5 }, { day: 'Fri', value: 6 }, { day: 'Sat', value: 3 }, { day: 'Sun', value: 4 }],
  codingProgress: [{ name: 'Arrays', value: 84 }, { name: 'Trees', value: 62 }, { name: 'DP', value: 41 }, { name: 'Graphs', value: 55 }],
  resumeTrend: [{ name: 'V1', value: 58 }, { name: 'V2', value: 67 }, { name: 'V3', value: 76 }, { name: 'Now', value: 82 }],
};

const dashboardSlice = createSlice({ name: 'dashboard', initialState, reducers: {} });
export default dashboardSlice.reducer;
