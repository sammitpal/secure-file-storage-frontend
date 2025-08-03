import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiShield, 
  FiLogOut, 
  FiUser,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { theme } from '../styles/GlobalStyles.js';
import { useAuth } from '../contexts/AuthContext.jsx';

// Animations
const shimmerGlow = keyframes`
  0% { 
    background-position: -200% center;
  }
  100% { 
    background-position: 200% center;
  }
`;

const NavbarContainer = styled(motion.nav)`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: ${theme.shadows.lg};
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${theme.colors.primary}, transparent);
    opacity: 0.6;
  }
`;

const NavbarContent = styled.div`
  padding: 0 ${theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
  width: 100%;
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: 0 ${theme.spacing.lg};
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: 1.5rem;
  font-weight: 800;
  color: ${theme.colors.primary};
  letter-spacing: -0.025em;
  flex-shrink: 0;
  
  .icon {
    font-size: 2rem;
    filter: drop-shadow(0 2px 8px rgba(26, 26, 26, 0.2));
    animation: ${shimmerGlow} 3s ease-in-out infinite;
    background: linear-gradient(
      45deg,
      ${theme.colors.primary} 0%,
      ${theme.colors.secondary} 50%,
      ${theme.colors.primary} 100%
    );
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .text {
    background: linear-gradient(
      45deg,
      ${theme.colors.primary} 0%,
      ${theme.colors.secondary} 50%,
      ${theme.colors.primary} 100%
    );
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmerGlow} 3s ease-in-out infinite;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing.sm};
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  flex-shrink: 0;
`;

// Quota-related styled components removed - moved to SidePanel in App.jsx

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(26, 26, 26, 0.05);
  border: 1px solid rgba(26, 26, 26, 0.1);
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.gray[700]};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
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
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: rgba(26, 26, 26, 0.08);
    color: ${theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
    border-color: ${theme.colors.primary}30;
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &.primary {
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
    color: white;
    border-color: transparent;
    
    &:hover {
      background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.dark} 100%);
      color: white;
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
  }
  
  &.danger {
    &:hover {
      background: rgba(239, 68, 68, 0.1);
      color: ${theme.colors.danger};
      border-color: ${theme.colors.danger}30;
    }
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    .text {
      display: none;
    }
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: block;
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(26, 26, 26, 0.05);
  border: 1px solid rgba(26, 26, 26, 0.1);
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(26, 26, 26, 0.08);
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  
  return (
    <NavbarContainer
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <NavbarContent>
        {/* Brand */}
        <Brand>
          <FiShield className="icon" />
          <span className="text">SecureVault</span>
        </Brand>
        
        {/* Desktop Navigation */}
        <NavActions>
          {/* User Actions - Right Side */}
          <UserActions>
            <ActionButton>
              <FiUser size={16} />
              <span className="text">Profile</span>
            </ActionButton>
            
            <ActionButton className="danger" onClick={logout}>
              <FiLogOut size={16} />
              <span className="text">Logout</span>
            </ActionButton>
            
            {/* Mobile Menu */}
            <MobileMenu>
              <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </MobileMenuButton>
            </MobileMenu>
          </UserActions>
        </NavActions>
      </NavbarContent>
    </NavbarContainer>
  );
}; 