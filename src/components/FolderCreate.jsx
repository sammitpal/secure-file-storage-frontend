import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiFolder, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { fileApi } from '../services/api';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
  
  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background: ${props => props.theme?.colors?.surface || '#ffffff'}dd;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius-xl);
  box-shadow: ${props => props.theme?.shadows?.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1)'};
  padding: var(--space-8);
  width: 100%;
  max-width: 480px;
  position: relative;
  transform: translateY(20px) scale(0.95);
  animation: slideIn 0.3s ease forwards;
  
  @keyframes slideIn {
    to {
      transform: translateY(0) scale(1);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  margin: 0;
  
  &::before {
    content: '';
    width: 4px;
    height: 28px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 2px;
  }
  
  svg {
    width: 24px;
    height: 24px;
    color: var(--primary);
  }
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme?.colors?.textSecondary || '#6b7280'};
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--danger);
    border-color: var(--danger);
    color: white;
    transform: scale(1.05);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: var(--space-2);
  
  svg {
    width: 16px;
    height: 16px;
    color: var(--primary);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: var(--space-4);
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 2px solid ${props => props.hasError 
    ? 'var(--danger)' 
    : props.isFocused 
      ? 'var(--primary)' 
      : props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  transition: var(--transition);
  outline: none;
  
  &::placeholder {
    color: ${props => props.theme?.colors?.textSecondary || '#6b7280'};
  }
  
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &:hover:not(:focus) {
    border-color: ${props => props.theme?.colors?.borderHover || '#d1d5db'};
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius);
  color: var(--danger);
  font-size: var(--font-size-sm);
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-4);
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius);
  font-weight: 500;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition);
  min-width: 100px;
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
  
  &:hover::before {
    left: 100%;
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

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  box-shadow: var(--shadow);
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme?.colors?.hover || 'rgba(99, 102, 241, 0.05)'};
    border-color: ${props => props.theme?.colors?.borderHover || '#d1d5db'};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme?.shadows?.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const FolderCreate = ({ currentFolderPath, onClose, onFolderCreated }) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validateFolderName = useCallback((name) => {
    const trimmed = name.trim();
    
    if (!trimmed) {
      return 'Folder name is required';
    }
    
    if (trimmed.length < 1) {
      return 'Folder name must be at least 1 character';
    }
    
    if (trimmed.length > 100) {
      return 'Folder name must be less than 100 characters';
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/g;
    if (invalidChars.test(trimmed)) {
      return 'Folder name cannot contain: < > : " / \\ | ? *';
    }
    
    // Check for reserved names
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    if (reservedNames.includes(trimmed.toUpperCase())) {
      return 'This folder name is reserved and cannot be used';
    }
    
    // Check if starts/ends with spaces or dots
    if (trimmed !== name) {
      return 'Folder name cannot start or end with spaces';
    }
    
    if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
      return 'Folder name cannot start or end with dots';
    }
    
    return null;
  }, []);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setFolderName(value);
    
    // Real-time validation
    const validationError = validateFolderName(value);
    setError(validationError || '');
  }, [validateFolderName]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Final validation
    const validationError = validateFolderName(folderName);
    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmedName = folderName.trim();

    try {
      setIsCreating(true);
      setError('');

      const response = await fileApi.createFolder({
        name: trimmedName,
        path: currentFolderPath || ''
      });

      if (response.success) {
        onFolderCreated?.();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Create folder error:', error);
      setError(error.message || 'Failed to create folder');
    } finally {
      setIsCreating(false);
    }
  }, [folderName, currentFolderPath, onFolderCreated, onClose, validateFolderName]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <Title>
            <FiFolder />
            Create New Folder
          </Title>
          <CloseButton onClick={onClose} type="button">
            <FiX />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="folderName">
              <FiFolder />
              Folder Name
            </Label>
            <Input
              ref={inputRef}
              id="folderName"
              type="text"
              value={folderName}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter folder name..."
              hasError={!!error}
              isFocused={isFocused}
              disabled={isCreating}
              maxLength={100}
            />
          </InputGroup>

          {error && (
            <ErrorMessage>
              <FiAlertCircle />
              {error}
            </ErrorMessage>
          )}

          <ButtonGroup>
            <SecondaryButton 
              type="button" 
              onClick={onClose}
              disabled={isCreating}
            >
              <FiX />
              Cancel
            </SecondaryButton>
            <PrimaryButton 
              type="submit"
              disabled={isCreating || !folderName.trim()}
            >
              {isCreating ? (
                <>
                  <LoadingSpinner />
                  Creating...
                </>
              ) : (
                <>
                  <FiCheck />
                  Create Folder
                </>
              )}
            </PrimaryButton>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default FolderCreate; 