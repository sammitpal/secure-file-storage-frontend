import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--space-8);
  text-align: center;
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius-lg);
  margin: var(--space-4);
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  margin-bottom: var(--space-6);
`;

const ErrorTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  margin-bottom: var(--space-4);
`;

const ErrorMessage = styled.p`
  font-size: var(--font-size-base);
  color: ${props => props.theme?.colors?.textSecondary || '#6b7280'};
  margin-bottom: var(--space-6);
  max-width: 500px;
`;

const ErrorDetails = styled.details`
  margin-bottom: var(--space-6);
  
  summary {
    cursor: pointer;
    color: ${props => props.theme?.colors?.textSecondary || '#6b7280'};
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-2);
  }
  
  pre {
    background: ${props => props.theme?.colors?.surface || '#f8fafc'};
    border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
    border-radius: var(--radius);
    padding: var(--space-4);
    font-size: var(--font-size-sm);
    color: ${props => props.theme?.colors?.text || '#1a1a1a'};
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            We encountered an unexpected error. This has been logged and we'll look into it.
            You can try refreshing the page or clicking the retry button below.
          </ErrorMessage>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <ErrorDetails>
              <summary>Error Details (Development Only)</summary>
              <pre>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </ErrorDetails>
          )}
          
          <RetryButton onClick={this.handleRetry}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            Try Again
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 