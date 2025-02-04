import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './app.js';

const root = document.getElementById('root');

if (!root) {
  throw new Error('no root element found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
