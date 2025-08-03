import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiUser, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight, FiMail } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { toast } from 'react-toastify';

// Animations
const shimmerGlow = keyframes`
  0% {
    background-position: -100% 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    background-position: 100% 0;
    opacity: 0;
  }
`;

const floatIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

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
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(26, 26, 26, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(26, 26, 26, 0.03) 0%, transparent 50%),
      linear-gradient(45deg, transparent 49%, rgba(255, 255, 255, 0.1) 50%, transparent 51%);
    background-size: 100% 100%, 100% 100%, 20px 20px;
    pointer-events: none;
  }
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  position: relative;
  overflow: hidden;
  animation: ${floatIn} 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

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
      rgba(255, 255, 255, 0.8),
      transparent
    );
    transition: left 0.8s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 32px 64px rgba(0, 0, 0, 0.15),
      0 1px 3px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);

    &::before {
      left: 100%;
    }
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

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  animation: ${shimmerGlow} 3s ease-in-out infinite;
  background-size: 200% 100%;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  font-size: 1rem;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: ${props => props.theme.colors.gray[500]};
  font-size: 1.1rem;
  z-index: 2;
  pointer-events: none;
  transition: all 0.3s ease;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid ${props => props.hasError ? props.theme.colors.danger : 'rgba(226, 232, 240, 0.8)'};
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  color: ${props => props.theme.colors.primary};
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);

  &::placeholder {
    color: ${props => props.theme.colors.gray[400]};
    font-weight: 400;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.1),
      0 0 0 4px rgba(26, 26, 26, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
    transform: translateY(-1px);
  }

  &:hover:not(:focus) {
    border-color: ${props => props.theme.colors.gray[400]};
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }

  ${InputContainer}:focus-within ${InputIcon} {
    color: ${props => props.theme.colors.primary};
    transform: scale(1.1);
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
  padding: 1rem 2rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin-top: 1rem;
  box-shadow: 
    0 8px 16px rgba(26, 26, 26, 0.2),
    0 2px 4px rgba(26, 26, 26, 0.1);
  letter-spacing: 0.025em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

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
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 24px rgba(26, 26, 26, 0.3),
      0 4px 8px rgba(26, 26, 26, 0.15);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 8px rgba(26, 26, 26, 0.1);

    &::before {
      display: none;
    }
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

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputContainer>
              <InputIcon>
                <FiMail />
              </InputIcon>
              <Input
                type="text"
                name="identifier"
                placeholder="Email or username"
                value={formData.identifier}
                onChange={handleChange}
                hasError={!!errors.identifier}
                autoComplete="username"
              />
            </InputContainer>
            {errors.identifier && <ErrorMessage>{errors.identifier}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputContainer>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                hasError={!!errors.password}
                autoComplete="current-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </InputContainer>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>

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
        </Form>

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