import React from 'react';
import styled from 'styled-components';
import { FiHome, FiChevronRight } from 'react-icons/fi';

const BreadcrumbContainer = styled.nav`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  list-style: none;
  flex-wrap: wrap;
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: 0.875rem;
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
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${props => props.theme.colors.gray[400]};
  font-size: 0.75rem;
  display: flex;
  align-items: center;
`;

const CurrentPath = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.gray[100]};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.875rem;
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
            <FiHome />
            <span>Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Path segments */}
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const path = buildPath(index);
          
          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator>
                <FiChevronRight />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <CurrentPath>{decodeURIComponent(segment)}</CurrentPath>
                ) : (
                  <BreadcrumbLink
                    onClick={() => onNavigate(path)}
                    title={`Go to ${segment}`}
                  >
                    {decodeURIComponent(segment)}
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