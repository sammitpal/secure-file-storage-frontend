import styled, { createGlobalStyle } from 'styled-components';

// Simple spin animation only
const spin = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${props => props.theme.colors.background};
    min-height: 100vh;
    color: ${props => props.theme.colors.text};
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  button {
    border: none;
    outline: none;
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea {
    border: none;
    outline: none;
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.gray[100]};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.gray[300]};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.theme.colors.gray[400]};
    }
  }
`;

// Keep the original theme export for backward compatibility
export const theme = {
  colors: {
    primary: '#1a1a1a',
    primaryDark: '#000000',
    secondary: '#6b7280',
    light: '#ffffff',
    dark: '#1a1a1a',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    xxl: '2rem'
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.lg};
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: white;
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primaryDark};
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.gray[200]};
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: ${theme.colors.danger};
          color: white;
          
          &:hover:not(:disabled) {
            background: #dc2626;
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${theme.colors.primary};
          border: 1px solid ${theme.colors.gray[300]};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.gray[50]};
            border-color: ${theme.colors.primary};
          }
        `;
      default:
        return `
          background: ${theme.colors.primary};
          color: white;
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primaryDark};
            transform: translateY(-1px);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
  
  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${theme.colors.gray[200]};
  border-top-color: ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  ${spin}
`; 