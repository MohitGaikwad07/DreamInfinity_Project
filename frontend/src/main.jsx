import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { App } from './App.jsx';
import { store } from './redux/store.js';
import './styles/index.css';
import './styles/resume.css';
import './styles/skillgap.css';
import './styles/profile.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </Provider>
  </StrictMode>,
);
