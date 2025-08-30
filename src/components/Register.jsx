import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiUser, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight, FiMail, FiUserPlus, FiCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

// Animations (same as Login)
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

const checkmark = keyframes`
  0% {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(45deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(45deg);
    opacity: 1;
  }
`;

// Styled Components (reusing from Login with modifications)
const RegisterContainer = styled.div`
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

const RegisterCard = styled.div`
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
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const LogoIcon = styled(FiShield)`
  font-size: 2.5rem;
  color: ${props => props.theme.colors.primary};
  filter: drop-shadow(0 2px 4px rgba(26, 26, 26, 0.1));
  animation: ${pulseGlow} 3s ease-in-out infinite;
`;

const RegisterForm = styled.form`
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

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
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
  right: 0.75rem;
  color: ${props => props.theme.colors.gray[500]};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
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
  font-size: 0.8rem;
  margin-top: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const PasswordStrength = styled.div`
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  backdrop-filter: blur(10px);
`;

const StrengthBar = styled.div`
  height: 4px;
  background: rgba(226, 232, 240, 0.5);
  border-radius: 2px;
  margin-bottom: 0.5rem;
  overflow: hidden;
`;

const StrengthFill = styled.div`
  height: 100%;
  width: ${props => props.strength}%;
  background: ${props => {
    if (props.strength < 30) return props.theme.colors.danger;
    if (props.strength < 60) return '#f59e0b';
    if (props.strength < 80) return '#3b82f6';
    return props.theme.colors.success;
  }};
  transition: all 0.3s ease;
  border-radius: 2px;
`;

const StrengthText = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: 0.5rem;
`;

const Requirements = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  font-size: 0.7rem;
`;

const Requirement = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: ${props => props.met ? props.theme.colors.success : props.theme.colors.gray[500]};
  transition: all 0.3s ease;
`;

const CheckIcon = styled(FiCheck)`
  width: 12px;
  height: 12px;
  opacity: ${props => props.met ? 1 : 0.3};
  animation: ${props => props.met ? checkmark : 'none'} 0.3s ease;
`;

const RegisterButton = styled.button`
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

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  backdrop-filter: blur(10px);
`;

const LoginText = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
`;

const LoginButton = styled.button`
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
  font-size: 0.9rem;

  &:hover {
    background: rgba(26, 26, 26, 0.05);
    transform: translateX(-4px);
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

const Register = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getPasswordRequirements = (password) => {
    return {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    };
  };

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

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        // Clear form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setErrors({});
        
        // Switch to login view after successful registration
        setTimeout(() => {
          onSwitchToLogin();
        }, 1500);
      } else {
        if (result.error && typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          setErrors({ general: result.error || 'Registration failed' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const passwordRequirements = getPasswordRequirements(formData.password);

  return (
    <RegisterContainer>
      <RegisterCard>
        <Header>
          <Logo>
            <LogoIcon />
          </Logo>
          <Title>Create Account</Title>
          <Subtitle>Join Secure File Storage with 500MB free storage</Subtitle>
        </Header>

        <RegisterForm onSubmit={handleSubmit}>
          <InputRow>
            <InputGroup>
              <InputContainer>
                <InputIcon>
                  <FiUser />
                </InputIcon>
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  $hasError={!!errors.username}
                  autoComplete="username"
                />
              </InputContainer>
              {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
            </InputGroup>

            <InputGroup>
              <InputContainer>
                <InputIcon>
                  <FiMail />
                </InputIcon>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  $hasError={!!errors.email}
                  autoComplete="email"
                />
              </InputContainer>
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </InputGroup>
          </InputRow>

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
                $hasError={!!errors.password}
                autoComplete="new-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </InputContainer>
            {formData.password && (
              <PasswordStrength>
                <StrengthBar>
                  <StrengthFill strength={passwordStrength} />
                </StrengthBar>
                <StrengthText>
                  Password strength: {
                    passwordStrength < 30 ? 'Weak' :
                    passwordStrength < 60 ? 'Fair' :
                    passwordStrength < 80 ? 'Good' : 'Strong'
                  }
                </StrengthText>
                <Requirements>
                  <Requirement met={passwordRequirements.length}>
                    <CheckIcon met={passwordRequirements.length} />
                    6+ characters
                  </Requirement>
                  <Requirement met={passwordRequirements.uppercase}>
                    <CheckIcon met={passwordRequirements.uppercase} />
                    Uppercase
                  </Requirement>
                  <Requirement met={passwordRequirements.lowercase}>
                    <CheckIcon met={passwordRequirements.lowercase} />
                    Lowercase
                  </Requirement>
                  <Requirement met={passwordRequirements.number}>
                    <CheckIcon met={passwordRequirements.number} />
                    Number
                  </Requirement>
                </Requirements>
              </PasswordStrength>
            )}
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputContainer>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                $hasError={!!errors.confirmPassword}
                autoComplete="new-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </InputContainer>
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
          </InputGroup>

          <RegisterButton type="submit" disabled={loading}>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <FiUserPlus />
                Create Account
              </>
            )}
          </RegisterButton>
        </RegisterForm>

        <LoginLink>
          <LoginText>Already have an account?</LoginText>
          <LoginButton onClick={onSwitchToLogin}>
            <FiArrowRight style={{ transform: 'rotate(180deg)' }} />
            Sign In
          </LoginButton>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register; 