import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import 'lenis/dist/lenis.css';
import './index.css';
import SmoothScroll from './components/SmoothScroll';
import App from './App';

// Always start at the top so the preloader → hero sequence plays correctly.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SmoothScroll>
        <App />
      </SmoothScroll>
    </BrowserRouter>
  </StrictMode>,
);
