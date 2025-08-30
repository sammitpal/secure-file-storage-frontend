import React from 'react';
import styled from 'styled-components';
import { FiHome, FiChevronRight } from 'react-icons/fi';

const BreadcrumbContainer = styled.nav`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: var(--radius-md);
  box-shadow: ${props => props.theme.shadows.sm};
  transition: var(--transition);
  overflow: hidden;
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  padding: var(--space-3) var(--space-4);
  flex-wrap: wrap;
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: ${props => props.theme.colors.textSecondary};
  
  &:last-child {
    color: ${props => props.theme.colors.text};
    font-weight: 600;
  }
`;

const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
    transition: left 0.3s ease;
  }
  
  &:hover {
    background: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.text};
    transform: translateY(-1px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &::before {
      display: none;
    }
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  opacity: 0.6;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const CurrentPath = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  padding: var(--space-2) var(--space-3);
  background: ${props => props.theme.colors.hover};
  border-radius: var(--radius);
  font-size: var(--font-size-sm);
  border: 1px solid ${props => props.theme.colors.border};
`;

const Breadcrumb = ({ currentPath, onNavigate }) => {
  // Handle array-based currentPath (new format) or string-based (legacy)
  const pathSegments = Array.isArray(currentPath) 
    ? currentPath 
    : (currentPath || '').split('/').filter(segment => segment.length > 0);

  const handleNavigate = (index) => {
    if (typeof onNavigate === 'function') {
      onNavigate(index);
    }
  };

  return (
    <BreadcrumbContainer>
      <BreadcrumbList>
        {/* Root/Home */}
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => handleNavigate(-1)}
            disabled={pathSegments.length === 0}
            title="Go to root folder"
          >
            <FiHome />
            <span>Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Path segments */}
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const displayName = typeof segment === 'object' ? segment.name : segment;
          
          return (
            <React.Fragment key={index}>
              <BreadcrumbSeparator>
                <FiChevronRight />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <CurrentPath>{displayName}</CurrentPath>
                ) : (
                  <BreadcrumbLink
                    onClick={() => handleNavigate(index)}
                    title={`Go to ${displayName}`}
                  >
                    {displayName}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbContainer>
  );
};

export default Breadcrumb; 