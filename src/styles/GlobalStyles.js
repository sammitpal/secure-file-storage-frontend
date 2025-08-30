import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    /* Modern Color Palette */
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --primary-light: #818cf8;
    --secondary: #8b5cf6;
    --accent: #06b6d4;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    
    /* Neutral Colors */
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;
    
    /* Glass Effects */
    --glass-bg: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 10px 15px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 20px 25px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.25);
    
    /* Border Radius */
    --radius-sm: 8px;
    --radius: 12px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --radius-xl: 32px;
    
    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;
    --space-16: 4rem;
    
    /* Typography */
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    
    /* Transitions */
    --transition-fast: all 0.15s ease;
    --transition: all 0.2s ease;
    --transition-slow: all 0.3s ease;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    font-size: var(--font-size-base);
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* Modern Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.surface};
    border-radius: var(--radius-sm);
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: var(--radius-sm);
    transition: var(--transition);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.textSecondary};
  }

  /* Selection */
  ::selection {
    background: var(--primary);
    color: white;
  }

  /* Focus styles */
  *:focus {
    outline: none;
  }

  *:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Modern button reset */
  button {
    font-family: inherit;
    font-size: inherit;
    border: none;
    background: none;
    cursor: pointer;
    transition: var(--transition);
  }

  /* Modern input styles */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    border: none;
    background: none;
    outline: none;
  }

  /* Links */
  a {
    color: var(--primary);
    text-decoration: none;
    transition: var(--transition);
  }

  a:hover {
    color: var(--primary-dark);
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.025em;
  }

  h1 { font-size: var(--font-size-4xl); }
  h2 { font-size: var(--font-size-3xl); }
  h3 { font-size: var(--font-size-2xl); }
  h4 { font-size: var(--font-size-xl); }
  h5 { font-size: var(--font-size-lg); }
  h6 { font-size: var(--font-size-base); }

  /* Utilities */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Modern animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }

  /* Glass morphism utility */
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
  }

  /* Modern card */
  .card {
    background: ${props => props.theme.colors.surface};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    transition: var(--transition);
  }

  .card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  /* Button variants */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius);
    font-weight: 500;
    font-size: var(--font-size-sm);
    transition: var(--transition);
    cursor: pointer;
    border: none;
    text-decoration: none;
    white-space: nowrap;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    box-shadow: var(--shadow);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-secondary {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
    border: 1px solid ${props => props.theme.colors.border};
  }

  .btn-secondary:hover {
    background: ${props => props.theme.colors.hover};
    border-color: ${props => props.theme.colors.textSecondary};
  }

  .btn-ghost {
    background: transparent;
    color: ${props => props.theme.colors.textSecondary};
  }

  .btn-ghost:hover {
    background: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.text};
  }

  /* Loading states */
  .loading {
    position: relative;
    overflow: hidden;
  }

  .loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }

  /* Responsive utilities */
  @media (max-width: 768px) {
    body {
      font-size: var(--font-size-sm);
    }
    
    h1 { font-size: var(--font-size-3xl); }
    h2 { font-size: var(--font-size-2xl); }
    h3 { font-size: var(--font-size-xl); }
  }
`;

// Modern theme definitions
export const lightTheme = {
  colors: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    surface: '#ffffff',
    surfaceHover: '#f8fafc',
    hover: 'rgba(99, 102, 241, 0.05)',
    
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    
    glass: {
      background: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(255, 255, 255, 0.9)',
    }
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  }
};

export const darkTheme = {
  colors: {
    primary: '#818cf8',
    primaryHover: '#6366f1',
    secondary: '#a78bfa',
    accent: '#22d3ee',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    surface: '#1e293b',
    surfaceHover: '#334155',
    hover: 'rgba(129, 140, 248, 0.1)',
    
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    
    border: '#334155',
    borderHover: '#475569',
    
    glass: {
      background: 'rgba(30, 41, 59, 0.8)',
      border: 'rgba(51, 65, 85, 0.9)',
    }
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  }
}; 