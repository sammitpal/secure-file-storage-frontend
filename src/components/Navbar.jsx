import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FiShield, FiUser, FiHardDrive, FiSettings, FiMenu, FiX, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 ${props => props.theme.spacing.xl};
  transition: all 0.3s ease;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 0 ${props => props.theme.spacing.lg};
  }
`;

const NavContent = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  
  .icon {
    font-size: 2rem;
    color: ${props => props.theme.colors.primary};
  }
  
  .text {
    @media (max-width: ${props => props.theme.breakpoints.sm}) {
      display: none;
    }
  }
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const QuotaDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gray[50]};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.full};
  border: 1px solid ${props => props.theme.colors.gray[200]};
  min-width: 200px;
`;

const QuotaInfo = styled.div`
  flex: 1;
  
  .usage {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${props => props.theme.colors.dark};
    margin-bottom: 2px;
  }
  
  .percentage {
    font-size: 0.75rem;
    color: ${props => props.theme.colors.gray[500]};
  }
`;

const QuotaBar = styled.div`
  width: 60px;
  height: 6px;
  background: ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
`;

const QuotaFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${props => props.theme.colors.success}, ${props => props.theme.colors.primary});
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  
  .avatar {
    width: 32px;
    height: 32px;
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.light};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border: 2px solid ${props => props.theme.colors.border};
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  span {
    color: ${props => props.theme.colors.text};
    font-weight: 500;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.danger};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.gray[100]};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* Mobile layout adjustments */
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: auto;
    height: auto;
    border-radius: ${props => props.theme.borderRadius.md};
    padding: ${props => props.theme.spacing.md};
    justify-content: flex-start;
    gap: ${props => props.theme.spacing.sm};
  }
  
  &:hover {
    background: ${props => props.theme.colors.gray[200]};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 18px;
  }
  
  span {
    color: ${props => props.theme.colors.text};
    font-weight: 500;
    
    @media (min-width: ${props => props.theme.breakpoints.md}) {
      display: none;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: 1.5rem;
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
  transform: translateY(${props => props.isOpen ? '0' : '-100%'});
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 999;
  backdrop-filter: blur(20px);
  box-shadow: ${props => props.theme.shadows.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileMenuItem = styled.div`
  padding: ${props => props.theme.spacing.lg} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
  
  /* Ensure all child elements have proper theming */
  * {
    color: ${props => props.theme.colors.text};
  }
`;

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, getQuotaInfo } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();
  
  const handleLogout = useCallback(() => {
    logout();
    setMobileMenuOpen(false);
  }, [logout]);
  
  const quotaInfo = getQuotaInfo();
  
  return (
    <NavbarContainer>
      <NavContent>
        {/* Brand */}
        <Logo>
          <FiShield className="icon" />
          <span className="text">SecureVault</span>
        </Logo>
        
        {/* Desktop Navigation */}
        <NavItems>
          <QuotaDisplay>
            <FiHardDrive style={{ color: 'currentColor', fontSize: '1.25rem' }} />
            <QuotaInfo>
              <div className="usage">{quotaInfo.usagePercentage.toFixed(1)}% Used</div>
              <div className="percentage">{formatFileSize(quotaInfo.totalSize)} / {formatFileSize(quotaInfo.quota)}</div>
            </QuotaInfo>
            <QuotaBar>
              <QuotaFill percentage={quotaInfo.usagePercentage} />
            </QuotaBar>
          </QuotaDisplay>
          
          <UserInfo>
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span>{user?.username || 'User'}</span>
          </UserInfo>
          
          <ThemeToggle onClick={toggleTheme} title={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDarkTheme ? <FiSun /> : <FiMoon />}
            <span>
              {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
            </span>
          </ThemeToggle>
          
          <LogoutButton onClick={handleLogout}>
            <FiLogOut />
            Logout
          </LogoutButton>
        </NavItems>

        {/* Mobile Menu Button */}
        <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </MobileMenuButton>
      </NavContent>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen}>
                 <MobileMenuItem>
          <QuotaDisplay style={{ minWidth: 'auto', width: '100%' }}>
            <FiHardDrive style={{ color: 'currentColor', fontSize: '1.25rem' }} />
            <QuotaInfo>
              <div className="usage" style={{ color: 'inherit' }}>{quotaInfo.usagePercentage.toFixed(1)}% Used</div>
              <div className="percentage" style={{ color: 'inherit' }}>{formatFileSize(quotaInfo.totalSize)} / {formatFileSize(quotaInfo.quota)}</div>
            </QuotaInfo>
            <QuotaBar>
              <QuotaFill percentage={quotaInfo.usagePercentage} />
            </QuotaBar>
          </QuotaDisplay>
        </MobileMenuItem>
        
        <MobileMenuItem>
          <UserInfo style={{ justifyContent: 'flex-start' }}>
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span style={{ color: 'inherit' }}>{user?.username || 'User'}</span>
          </UserInfo>
        </MobileMenuItem>
        
        <MobileMenuItem>
          <ThemeToggle onClick={toggleTheme} title={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDarkTheme ? <FiSun /> : <FiMoon />}
            <span>
              {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
            </span>
          </ThemeToggle>
        </MobileMenuItem>
        
        <MobileMenuItem>
          <LogoutButton onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
            <FiLogOut />
            Logout
          </LogoutButton>
        </MobileMenuItem>
      </MobileMenu>
    </NavbarContainer>
  );
};

Navbar.displayName = 'Navbar';

// Helper function for file size formatting
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export { Navbar }; 