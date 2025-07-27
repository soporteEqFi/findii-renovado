import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  // Comentado temporalmente para evitar doble montaje en desarrollo
  // <StrictMode>
    <App />
  // </StrictMode>
);
 