import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight, FiMail } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';


const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(26, 26, 26, 0.2);
  }
  50% {
    box-shadow: 0 0 40px rgba(26, 26, 26, 0.4), 0 0 60px rgba(26, 26, 26, 0.1);
  }
`;

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme?.colors?.background || 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
    border-radius: 20px;
    max-width: calc(100vw - 2rem);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const LogoIcon = styled(FiShield)`
  font-size: 2.5rem;
  color: ${props => props.theme.colors.primary};
  filter: drop-shadow(0 2px 4px rgba(26, 26, 26, 0.1));
  animation: ${pulseGlow} 3s ease-in-out infinite;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  text-align: center;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #1a1a1a, #4a5568);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#64748b'};
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme?.colors?.textSecondary || '#64748b'};
  font-size: 1rem;
  z-index: 2;
  
  @media (max-width: 768px) {
    left: 0.75rem;
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  border: 2px solid ${props => props.$hasError ? props.theme?.colors?.danger || '#ef4444' : 'rgba(226, 232, 240, 0.8)'};
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  font-weight: 500;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? props.theme?.colors?.danger || '#ef4444' : props.theme?.colors?.primary || '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
    background: rgba(255, 255, 255, 1);
  }

  &::placeholder {
    color: ${props => props.theme?.colors?.textSecondary || '#94a3b8'};
    font-weight: 400;
  }

  &:hover:not(:focus) {
    border-color: ${props => props.$hasError ? props.theme?.colors?.danger || '#ef4444' : 'rgba(59, 130, 246, 0.3)'};
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  color: ${props => props.theme.colors.gray[500]};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  z-index: 2;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background: rgba(26, 26, 26, 0.05);
    transform: scale(1.1);
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#3b82f6'}, ${props => props.theme?.colors?.primaryDark || '#2563eb'});
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  backdrop-filter: blur(10px);
`;

const RegisterText = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: 1rem;
`;

const RegisterButton = styled.button`
  color: ${props => props.theme.colors.primary};
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(26, 26, 26, 0.05);
    transform: translateX(4px);
  }
`;

const SwitchText = styled.p`
  text-align: center;
  margin-top: 2rem;
  color: ${props => props.theme?.colors?.textSecondary || '#64748b'};
  font-size: 0.9rem;
`;

const SwitchLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme?.colors?.primary || '#3b82f6'};
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme?.colors?.primaryDark || '#2563eb'};
    text-decoration: underline;
  }
`;

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Call the login function and check the result
      if (onLoginSuccess) {
        const result = await onLoginSuccess(formData);
        
        // If login failed, the error toast is already shown by AuthContext
        // We don't need to do anything else as the AuthContext handles success/failure
        console.log('Login attempt result:', result);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Header>
          <Logo>
            <LogoIcon />
          </Logo>
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to your secure file storage account</Subtitle>
        </Header>

        <LoginForm onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FiMail />
            </InputIcon>
            <Input
              type="text"
              name="identifier"
              placeholder="Email or username"
              value={formData.identifier}
              onChange={handleChange}
              $hasError={!!errors.identifier}
              autoComplete="username"
            />
          </InputGroup>
          {errors.identifier && <ErrorMessage>{errors.identifier}</ErrorMessage>}

          <InputGroup>
            <InputIcon>
              <FiLock />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              $hasError={!!errors.password}
              autoComplete="current-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </PasswordToggle>
          </InputGroup>
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}

          <LoginButton type="submit" disabled={loading}>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                Sign In
                <FiArrowRight />
              </>
            )}
          </LoginButton>
        </LoginForm>

        <RegisterLink>
          <RegisterText>Don't have an account?</RegisterText>
          <RegisterButton onClick={onSwitchToRegister}>
            Create Account
            <FiArrowRight />
          </RegisterButton>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login; 