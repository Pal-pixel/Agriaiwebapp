import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Home from './pages/Home';
import Results from './pages/Results';
import History from './pages/History';
import { LanguageProvider } from './lib/i18n';
import './index.css';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/results', element: <Results /> },
  { path: '/history', element: <History /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  </StrictMode>
);
