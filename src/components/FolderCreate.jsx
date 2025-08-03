import React, { useState } from 'react';
import styled from 'styled-components';
import { FiFolder, FiX, FiPlus } from 'react-icons/fi';
import { folderApi } from '../services/api.js';
import { toast } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing.md};
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  .icon {
    color: ${props => props.theme.colors.primary};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.text};
    background: ${props => props.theme.colors.gray[100]};
  }
`;

const ModalBody = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: 0.875rem;
`;

const CurrentPathInfo = styled.div`
  background: ${props => props.theme.colors.gray[100]};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.md};

  .path {
    font-family: monospace;
    background: ${props => props.theme.colors.surface};
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
    color: ${props => props.theme.colors.text};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.gray[50]};
  border-radius: 0 0 ${props => props.theme.borderRadius.lg} ${props => props.theme.borderRadius.lg};
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  font-size: 0.875rem;
  margin-top: ${props => props.theme.spacing.xs};
`;

const TipsSection = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  
  ul {
    margin-top: ${props => props.theme.spacing.xs};
    padding-left: 1.2em;
  }
`;

const ThemedInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.875rem;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.gray[100]};
    border-color: ${props => props.theme.colors.gray[300]};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CreateButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: ${props => props.theme.colors.gray[400]};
    box-shadow: none;
  }
`;

export const FolderCreate = ({
  isOpen,
  currentPath,
  onClose,
  onFolderCreated
}) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }

    // Validate folder name
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(folderName)) {
      setError('Folder name contains invalid characters');
      return;
    }

    if (folderName.length > 255) {
      setError('Folder name is too long (max 255 characters)');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await folderApi.create(
        folderName.trim(),
        currentPath || undefined
      );

      if (response.success) {
        toast.success(`Folder "${folderName}" created successfully`);
        onFolderCreated();
        handleClose();
      } else {
        throw new Error(response.message || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Create folder error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create folder';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    setIsCreating(false);
    onClose();
  };

  const handleInputChange = (e) => {
    setFolderName(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  const displayPath = currentPath || '/';

  return (
    <React.Fragment>
      <Overlay
        onClick={handleClose}
      >
        <Modal
          onClick={e => e.stopPropagation()}
        >
          <ModalHeader>
            <ModalTitle>
              <FiFolder className="icon" />
              Create New Folder
            </ModalTitle>
            <CloseButton onClick={handleClose} title="Close">
              <FiX size={20} />
            </CloseButton>
          </ModalHeader>

          <form onSubmit={handleSubmit}>
            <ModalBody>
              <CurrentPathInfo>
                Create folder in: <span className="path">{displayPath}</span>
              </CurrentPathInfo>

              <FormGroup>
                <Label htmlFor="folderName">Folder Name</Label>
                <ThemedInput
                  id="folderName"
                  type="text"
                  value={folderName}
                  onChange={handleInputChange}
                  placeholder="Enter folder name"
                  error={!!error}
                  disabled={isCreating}
                  autoFocus
                  maxLength={255}
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </FormGroup>

              <TipsSection>
                <strong>Tips:</strong>
                <ul>
                  <li>Use descriptive names for easy organization</li>
                  <li>Avoid special characters: {'< > : " / \\ | ? *'}</li>
                  <li>Maximum length: 255 characters</li>
                </ul>
              </TipsSection>
            </ModalBody>

            <ModalFooter>
              <CancelButton
                type="button"
                onClick={handleClose}
                disabled={isCreating}
              >
                Cancel
              </CancelButton>
              <CreateButton
                type="submit"
                disabled={!folderName.trim() || isCreating}
              >
                {isCreating ? (
                  <>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    Create Folder
                  </>
                )}
              </CreateButton>
            </ModalFooter>
          </form>
        </Modal>
      </Overlay>
    </React.Fragment>
  );
}; 