import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Transparently adapt API fetches if VITE_API_URL is configured (helpful for Netlify, Vercel, etc.)
let apiBase = (import.meta as any).env?.VITE_API_URL;

if (!apiBase) {
  apiBase = '';
}

if (typeof window !== 'undefined') {
  (window as any).__apiBase = apiBase;
}

// Universal zero-config fetch indicator for progress overlays and transitions
let activeFetchesCount = 0;
const updateProgress = () => {
  if (typeof document === 'undefined') return;
  const bar = document.getElementById('global-progress-bar');
  if (bar) {
    if (activeFetchesCount > 0) {
      bar.style.opacity = '1';
      const progress = Math.min(40 + activeFetchesCount * 15, 85);
      bar.style.width = `${progress}%`;
    } else {
      bar.style.width = '100%';
      setTimeout(() => {
        if (activeFetchesCount === 0) {
          bar.style.opacity = '0';
          setTimeout(() => {
            if (activeFetchesCount === 0) {
               bar.style.width = '0%';
            }
          }, 300);
        }
      }, 200);
    }
  }
};

const originalFetch = window.fetch;
if (typeof window !== 'undefined') {
  (window as any).__originalFetch = originalFetch;
}
const customFetch = async function (input: any, init?: any) {
  activeFetchesCount++;
  updateProgress();
  try {
    let targetInput = input;
    if (apiBase && typeof input === 'string' && input.startsWith('/api/')) {
      targetInput = `${apiBase.replace(/\/$/, '')}${input}`;
    }
    const response = await originalFetch(targetInput, init);

    // Safeguard response.json() from failing on HTML/DOCTYPE responses, fallback to safe JSON objects
    const originalJson = response.json;
    response.json = async function () {
      try {
        const cloned = response.clone();
        const text = await cloned.text();
        if (text.trim().startsWith('<')) {
          return {
            success: false,
            message: 'সার্ভার যোগাযোগে ত্রুটি ঘটেছে অথবা ব্যাকএন্ড সচল হতে সময় নিচ্ছে। অনুগ্রহ করে ৫-১০ সেকেন্ড পর আবার চেষ্টা করুন।',
            isHtmlFallback: true
          };
        }
        return JSON.parse(text);
      } catch (err) {
        try {
          return await originalJson.call(response);
        } catch (origErr: any) {
          return {
            success: false,
            message: origErr?.message || 'সিস্টেম রেসপন্স পার্স করতে ব্যর্থ হয়েছে।'
          };
        }
      }
    };

    return response;
  } finally {
    activeFetchesCount--;
    updateProgress();
  }
};

try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    configurable: true,
    writable: true,
    enumerable: true
  });
} catch (e) {
  console.warn('Failed to define window.fetch with Object.defineProperty, falling back to direct property assignment.', e);
  try {
    (window as any).fetch = customFetch;
  } catch (errorAssignment) {
    console.error('Failed to override window.fetch:', errorAssignment);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
