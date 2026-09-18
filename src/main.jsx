import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { temaGovTrace } from './tema/tema';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={temaGovTrace}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);