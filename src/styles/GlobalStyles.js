import styled, { createGlobalStyle, keyframes } from 'styled-components';

// Keyframes for animations
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(0, 0, 0, 0.3); }
  50% { box-shadow: 0 0 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 0, 0, 0.4); }
`;

const floatUp = keyframes`
  0% { transform: translateY(0px) scale(1); }
  100% { transform: translateY(-8px) scale(1.02); }
`;

const slideInFromRight = keyframes`
  0% { transform: translateX(20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #ffffff;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.04) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.04) 0%, transparent 50%);
    min-height: 100vh;
    color: #1a1a1a;
    position: relative;
    
    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(45deg, transparent 48%, rgba(0, 0, 0, 0.01) 50%, transparent 52%),
        linear-gradient(-45deg, transparent 48%, rgba(0, 0, 0, 0.01) 50%, transparent 52%);
      background-size: 60px 60px;
      pointer-events: none;
      z-index: -1;
    }
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
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background: #f8f8f8;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #2a2a2a, #1a1a1a);
    border-radius: 10px;
    border: 2px solid #f8f8f8;
    
    &:hover {
      background: linear-gradient(45deg, #1a1a1a, #000000);
    }
  }
`;

export const theme = {
  colors: {
    primary: '#1a1a1a',
    secondary: '#2a2a2a',
    success: '#22c55e',
    danger: '#ef4444', 
    warning: '#f59e0b',
    info: '#3b82f6',
    light: '#ffffff',
    dark: '#000000',
    gray: {
      50: '#fafafa',
      100: '#f5f5f5', 
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    }
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  borderRadius: {
    sm: '6px',
    md: '8px', 
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem', 
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px', 
    xl: '1280px',
  },
  animations: {
    shimmer,
    glowPulse,
    floatUp,
    slideInFromRight,
  }
};

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  position: relative;
  
  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing.lg};
  }
`;

export const Card = styled.div`
  background: ${theme.colors.light};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  padding: ${props => props.padding || theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[200]};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: ${theme.animations.slideInFromRight} 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 0, 0, 0.04),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover {
    box-shadow: ${theme.shadows.xl};
    transform: translateY(-4px);
    border-color: ${theme.colors.primary};
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-2px);
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-weight: 600;
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  text-decoration: none;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  position: relative;
  overflow: hidden;
  letter-spacing: 0.025em;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover::before {
    left: 100%;
  }

  ${props => {
    switch (props.size) {
      case 'sm':
        return `
          padding: ${theme.spacing.xs} ${theme.spacing.md};
          font-size: 0.875rem;
          min-height: 36px;
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.lg} ${theme.spacing.xl};
          font-size: 1.125rem;
          min-height: 48px;
        `;
      default:
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
          font-size: 1rem;
          min-height: 40px;
        `;
    }
  }}

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
          color: white;
          box-shadow: ${theme.shadows.md};
          border: 2px solid transparent;
          
          &:hover {
            transform: translateY(-3px);
            box-shadow: ${theme.shadows.xl};
            background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.dark} 100%);
          }
          &:active {
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.lg};
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.primary};
          border: 2px solid ${theme.colors.gray[300]};
          box-shadow: ${theme.shadows.sm};
          
          &:hover {
            background: ${theme.colors.gray[200]};
            border-color: ${theme.colors.primary};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.md};
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, ${theme.colors.danger} 0%, #dc2626 100%);
          color: white;
          box-shadow: ${theme.shadows.md};
          border: 2px solid transparent;
          
          &:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            transform: translateY(-3px);
            box-shadow: ${theme.shadows.xl};
          }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, ${theme.colors.success} 0%, #16a34a 100%);
          color: white;
          box-shadow: ${theme.shadows.md};
          border: 2px solid transparent;
          
          &:hover {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            transform: translateY(-3px);
            box-shadow: ${theme.shadows.xl};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${theme.colors.primary};
          border: 2px solid ${theme.colors.primary};
          box-shadow: ${theme.shadows.sm};
          
          &::before {
            background: linear-gradient(
              90deg,
              transparent,
              rgba(26, 26, 26, 0.1),
              transparent
            );
          }
          
          &:hover {
            background: ${theme.colors.primary};
            color: white;
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.lg};
          }
        `;
      default:
        return `
          background: ${theme.colors.gray[600]};
          color: white;
          border: 2px solid transparent;
          box-shadow: ${theme.shadows.sm};
          
          &:hover {
            background: ${theme.colors.gray[700]};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.md};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
    
    &::before {
      display: none;
    }
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 2px solid ${props => props.error ? theme.colors.danger : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${theme.colors.light};
  color: ${theme.colors.primary};
  font-weight: 500;
  min-height: 48px;
  position: relative;
  box-shadow: ${theme.shadows.sm};

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.1), ${theme.shadows.md};
    transform: translateY(-1px);
    outline: none;
  }

  &:hover:not(:focus) {
    border-color: ${theme.colors.gray[400]};
    box-shadow: ${theme.shadows.md};
  }

  &::placeholder {
    color: ${theme.colors.gray[500]};
    font-weight: 400;
  }

  &:disabled {
    background: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[400]};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.primary};
  font-size: 1.125rem;
  font-weight: 500;
  position: relative;
  
  &::after {
    content: '';
    width: 20px;
    height: 20px;
    border: 2px solid ${theme.colors.gray[300]};
    border-top: 2px solid ${theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: ${theme.spacing.sm};
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['2xl']};
  text-align: center;
  color: ${theme.colors.gray[600]};
  animation: ${theme.animations.slideInFromRight} 0.8s ease-out;

  .icon {
    font-size: 5rem;
    margin-bottom: ${theme.spacing.xl};
    opacity: 0.3;
    color: ${theme.colors.gray[400]};
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: ${theme.spacing.md};
    color: ${theme.colors.primary};
    font-weight: 600;
    letter-spacing: -0.025em;
  }

  p {
    font-size: 1.125rem;
    margin-bottom: ${theme.spacing.xl};
    max-width: 400px;
    line-height: 1.6;
    color: ${theme.colors.gray[600]};
  }
`;

export const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 6px;
  background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
  width: ${props => props.progress || 0}%;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg};
  opacity: ${props => props.progress > 0 ? 1 : 0};
  box-shadow: ${theme.shadows.sm};
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: ${props => props.progress > 0 && props.progress < 100 ? theme.animations.shimmer : 'none'} 2s infinite;
    border-radius: inherit;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
    border-radius: inherit;
    z-index: -1;
    opacity: 0.3;
    filter: blur(4px);
  }
`; 