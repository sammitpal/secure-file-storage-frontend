import React from 'react';
import styled from 'styled-components';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import { theme } from '../styles/GlobalStyles.js';

const BreadcrumbContainer = styled.nav`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  margin-bottom: ${theme.spacing.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
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
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.8s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  list-style: none;
  flex-wrap: wrap;
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 1rem;
  font-weight: 500;
  
  &:not(:last-child) {
    color: ${theme.colors.gray[600]};
  }
  
  &:last-child {
    color: ${theme.colors.primary};
    font-weight: 600;
  }
`;

const BreadcrumbLink = styled.button`
  background: rgba(26, 26, 26, 0.05);
  border: 1px solid rgba(26, 26, 26, 0.1);
  color: inherit;
  cursor: pointer;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-weight: inherit;
  min-height: 36px;
  
  &:hover {
    background: rgba(26, 26, 26, 0.08);
    color: ${theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
    border-color: ${theme.colors.primary}30;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    cursor: default;
    background: rgba(26, 26, 26, 0.02);
    
    &:hover {
      background: rgba(26, 26, 26, 0.02);
      color: inherit;
      transform: none;
      box-shadow: none;
      border-color: rgba(26, 26, 26, 0.1);
    }
  }
`;

const Separator = styled(FiChevronRight)`
  color: ${theme.colors.gray[500]};
  font-size: 1.125rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`;

const HomeIcon = styled(FiHome)`
  font-size: 1.125rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`;

const PathText = styled.span`
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    max-width: 100px;
  }
`;

export const Breadcrumb = ({ currentPath, onNavigate }) => {
  const pathSegments = currentPath
    .split('/')
    .filter(segment => segment.length > 0);

  const buildPath = (index) => {
    return pathSegments.slice(0, index + 1).join('/');
  };

  return (
    <BreadcrumbContainer>
      <BreadcrumbList>
        {/* Root/Home */}
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => onNavigate('')}
            disabled={currentPath === ''}
            title="Go to root folder"
          >
            <HomeIcon />
            <span>Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Path segments */}
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const path = buildPath(index);
          
          return (
            <React.Fragment key={path}>
              <Separator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => !isLast && onNavigate(path)}
                  disabled={isLast}
                  title={isLast ? 'Current folder' : `Go to ${segment}`}
                >
                  <PathText>{decodeURIComponent(segment)}</PathText>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbContainer>
  );
}; 