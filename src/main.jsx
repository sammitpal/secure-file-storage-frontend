import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AuthWrapper from './components/AuthWrapper.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';

const ThemedApp = () => {
  const { theme } = useTheme();
  
  return (
    <StyledThemeProvider theme={theme}>
      <AuthWrapper>
        <App />
      </AuthWrapper>
    </StyledThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
); 