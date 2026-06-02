import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Transparently adapt API fetches if VITE_API_URL is configured (helpful for Netlify, Vercel, etc.)
const apiBase = (import.meta as any).env?.VITE_API_URL;
if (apiBase) {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      const targetUrl = `${apiBase.replace(/\/$/, '')}${input}`;
      return originalFetch(targetUrl, init);
    }
    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
