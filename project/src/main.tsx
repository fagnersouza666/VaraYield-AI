// Load polyfills first for browser compatibility
import './polyfills';

// Apply Raydium SDK patches immediately (before any imports)
import { raydiumSDKPatch } from './utils/raydium-sdk-patch';
raydiumSDKPatch.applyPatches();

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);