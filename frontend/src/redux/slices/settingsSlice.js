import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const stored = localStorage.getItem('favour_theme');
  if (stored) return stored;
  return 'dark'; // default
};

const getInitialSettings = () => {
  const defaults = {
    theme: getInitialTheme(),
    editorFontSize: Number(localStorage.getItem('favour_editor_fs')) || 14,
    soundEnabled: localStorage.getItem('favour_sound') !== 'false',
    emailAlerts: localStorage.getItem('favour_email_alerts') !== 'false'
  };
  return defaults;
};

// Auto-sync body class on initialization
const initialSettings = getInitialSettings();
if (initialSettings.theme === 'light') {
  document.documentElement.classList.add('light-theme');
} else {
  document.documentElement.classList.remove('light-theme');
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettings,
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      localStorage.setItem('favour_theme', nextTheme);
      if (nextTheme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('favour_theme', action.payload);
      if (action.payload === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
    },
    setEditorFontSize: (state, action) => {
      state.editorFontSize = action.payload;
      localStorage.setItem('favour_editor_fs', String(action.payload));
    },
    setSoundEnabled: (state, action) => {
      state.soundEnabled = action.payload;
      localStorage.setItem('favour_sound', String(action.payload));
    },
    setEmailAlerts: (state, action) => {
      state.emailAlerts = action.payload;
      localStorage.setItem('favour_email_alerts', String(action.payload));
    }
  }
});

export const { toggleTheme, setTheme, setEditorFontSize, setSoundEnabled, setEmailAlerts } = settingsSlice.actions;
export default settingsSlice.reducer;
