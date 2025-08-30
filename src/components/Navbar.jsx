import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FiUser, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiShield } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${props => props.theme?.colors?.surface || '#ffffff'}dd;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  box-shadow: ${props => props.theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
  transition: var(--transition);
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  
  @media (max-width: 768px) {
    padding: 0 var(--space-4);
    height: 70px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  text-decoration: none;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-1px);
  }
  
  svg {
    width: 32px;
    height: 32px;
    color: var(--primary);
    filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
  }
  
  .logo-text {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }
  
  @media (max-width: 768px) {
    font-size: var(--font-size-lg);
    
    svg {
      width: 28px;
      height: 28px;
    }
  }
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-6);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius-lg);
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme?.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.theme?.colors?.border || '#d1d5db'};
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: var(--font-size-lg);
  box-shadow: var(--shadow);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 50%;
    z-index: -1;
    opacity: 0.3;
    filter: blur(4px);
  }
`;

const WelcomeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  
  .greeting {
    font-size: var(--font-size-sm);
    color: ${props => props.theme?.colors?.textSecondary || '#6b7280'};
    font-weight: 500;
  }
  
  .username {
    font-size: var(--font-size-base);
    color: ${props => props.theme?.colors?.text || '#1a1a1a'};
    font-weight: 600;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const IconButton = styled.button`
  width: 44px;
  height: 44px;
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme?.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.theme?.colors?.border || '#d1d5db'};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const LogoutButton = styled(IconButton)`
  background: linear-gradient(135deg, var(--danger), #dc2626);
  border-color: var(--danger);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
`;

const MobileMenuButton = styled(IconButton)`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: ${props => props.theme?.colors?.surface || '#ffffff'}dd;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  box-shadow: ${props => props.theme?.shadows?.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1)'};
  transform: translateY(${props => props.$isOpen ? '0' : '-100%'});
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileMenuContent = styled.div`
  padding: var(--space-6) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
`;

const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius-md);
`;

const MobileActions = styled.div`
  display: flex;
  gap: var(--space-3);
`;

const MobileActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: ${props => props.$variant === 'danger' 
    ? 'linear-gradient(135deg, var(--danger), #dc2626)' 
    : props.theme?.colors?.surface || '#ffffff'};
  color: ${props => props.$variant === 'danger' ? 'white' : props.theme?.colors?.text || '#1a1a1a'};
  border: 1px solid ${props => props.$variant === 'danger' 
    ? 'var(--danger)' 
    : props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius);
  font-weight: 500;
  font-size: var(--font-size-sm);
  transition: var(--transition);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$variant === 'danger' 
      ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
      : props.theme?.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Navbar = React.memo(() => {
  const { currentUser, logout } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const getInitials = useCallback((name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  return (
    <>
      <NavbarContainer>
        <NavContent>
          <Logo>
            <FiShield />
            <span className="logo-text">SecureVault</span>
          </Logo>

          <DesktopNav>
            <UserInfo>
              <Avatar>
                {getInitials(currentUser?.username)}
              </Avatar>
              <WelcomeText>
                <span className="greeting">Welcome back</span>
                <span className="username">{currentUser?.username}</span>
              </WelcomeText>
            </UserInfo>

            <ActionButtons>
              <IconButton onClick={toggleTheme} title={`Switch to ${isDarkTheme ? 'light' : 'dark'} mode`}>
                {isDarkTheme ? <FiSun /> : <FiMoon />}
              </IconButton>
              <LogoutButton onClick={handleLogout} title="Logout">
                <FiLogOut />
              </LogoutButton>
            </ActionButtons>
          </DesktopNav>

          <MobileMenuButton onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </NavContent>
      </NavbarContainer>

      <MobileMenu $isOpen={mobileMenuOpen}>
        <MobileMenuContent>
          <MobileUserInfo>
            <Avatar>
              {getInitials(currentUser?.username)}
            </Avatar>
            <WelcomeText>
              <span className="greeting">Welcome back</span>
              <span className="username">{currentUser?.username}</span>
            </WelcomeText>
          </MobileUserInfo>

          <MobileActions>
            <MobileActionButton onClick={() => { toggleTheme(); closeMobileMenu(); }}>
              {isDarkTheme ? <FiSun /> : <FiMoon />}
              {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
            </MobileActionButton>
            <MobileActionButton $variant="danger" onClick={() => { handleLogout(); closeMobileMenu(); }}>
              <FiLogOut />
              Logout
            </MobileActionButton>
          </MobileActions>
        </MobileMenuContent>
      </MobileMenu>
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar; 