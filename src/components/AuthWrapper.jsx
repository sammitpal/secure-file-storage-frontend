import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Register from './Register';

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const LoadingCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${props => props.theme.colors.gray[200]};
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  font-size: 1rem;
  margin: 0;
`;

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, loading, login, register } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Debug logging to track authentication state
  console.log('🔍 AuthWrapper render:', {
    isAuthenticated,
    loading,
    authMode,
    timestamp: new Date().toISOString()
  });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('📋 AuthWrapper: Showing loading screen');
    return (
      <LoadingContainer>
        <LoadingCard>
          <LoadingSpinner />
          <LoadingText>Loading...</LoadingText>
        </LoadingCard>
      </LoadingContainer>
    );
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    console.log('🔐 AuthWrapper: User not authenticated, showing auth forms');
    const handleSwitchToRegister = () => setAuthMode('register');
    const handleSwitchToLogin = () => setAuthMode('login');

    if (authMode === 'login') {
      return (
        <Login
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={login}
        />
      );
    } else {
      return (
        <Register
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={register}
        />
      );
    }
  }

  // Show main app if authenticated
  console.log('✅ AuthWrapper: User authenticated, showing main app');
  return children;
};

export default AuthWrapper; 