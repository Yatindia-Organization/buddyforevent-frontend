import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// global styles
import './index.css';
import './styles/theme.css';

// context providers
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { GlobalProvider } from './contexts/globalContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </ThemeProvider>
  </StrictMode>
);
