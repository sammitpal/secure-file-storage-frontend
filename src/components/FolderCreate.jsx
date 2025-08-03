import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiX, FiPlus } from 'react-icons/fi';
import { folderApi } from '../services/api.js';
import { theme, Button, Input } from '../styles/GlobalStyles.js';
import { toast } from 'react-toastify';

const Overlay = styled(motion.div)`
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
  padding: ${theme.spacing.md};
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.gray[800]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  .icon {
    color: ${theme.colors.primary};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.gray[400]};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.colors.gray[600]};
    background: ${theme.colors.gray[100]};
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${theme.colors.gray[700]};
  margin-bottom: ${theme.spacing.sm};
  font-size: 0.875rem;
`;

const CurrentPathInfo = styled.div`
  background: ${theme.colors.gray[50]};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: 0.875rem;
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.md};

  .path {
    font-family: monospace;
    background: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.gray[200]};
  background: ${theme.colors.gray[50]};
  border-radius: 0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg};
`;

const CreateFolderButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.danger};
  font-size: 0.875rem;
  margin-top: ${theme.spacing.xs};
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
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <Modal
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
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
                  <Input
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

                <div style={{ fontSize: '0.875rem', color: theme.colors.gray[500] }}>
                  <strong>Tips:</strong>
                  <ul style={{ marginTop: theme.spacing.xs, paddingLeft: '1.2em' }}>
                    <li>Use descriptive names for easy organization</li>
                    <li>Avoid special characters: {'< > : " / \\ | ? *'}</li>
                    <li>Maximum length: 255 characters</li>
                  </ul>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <CreateFolderButton
                  type="submit"
                  variant="primary"
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
                </CreateFolderButton>
              </ModalFooter>
            </form>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
}; 