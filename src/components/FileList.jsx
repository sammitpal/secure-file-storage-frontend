import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiFile, FiDownload, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import { fileApi, formatFileSize, getFileIcon, downloadFile } from '../services/api.js';
import { folderApi } from '../services/api.js'; // Added folderApi import
import { theme, Button } from '../styles/GlobalStyles.js';
import { toast } from 'react-toastify';

const ListContainer = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.gray[50]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  font-weight: 600;
  font-size: 0.875rem;
  color: ${theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr auto;
    .desktop-only {
      display: none;
    }
  }
`;

const ListItem = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.gray[100]};
  transition: all 0.2s ease;
  cursor: ${props => props.isFolder ? 'pointer' : 'default'};
  position: relative;

  &:hover {
    background: ${theme.colors.gray[50]};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr auto;
    .desktop-only {
      display: none;
    }
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  min-width: 0; // Allow text truncation
`;

const ItemIcon = styled.div`
  font-size: 1.5rem;
  color: ${props => props.isFolder ? theme.colors.warning : theme.colors.primary};
  flex-shrink: 0;
`;

const ItemDetails = styled.div`
  min-width: 0; // Allow text truncation
  
  .item-name {
    font-weight: 500;
    color: ${theme.colors.gray[800]};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }
  
  .item-meta {
    font-size: 0.75rem;
    color: ${theme.colors.gray[500]};
    display: flex;
    gap: ${theme.spacing.sm};
    flex-wrap: wrap;
  }
`;

const ItemSize = styled.div`
  font-size: 0.875rem;
  color: ${theme.colors.gray[600]};
  font-weight: 500;
`;

const ItemDate = styled.div`
  font-size: 0.875rem;
  color: ${theme.colors.gray[500]};
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
`;

const ActionButton = styled.button`
  background: ${props => 
    props.variant === 'danger' ? theme.colors.danger + '10' :
    props.variant === 'primary' ? theme.colors.primary + '10' :
    theme.colors.gray[100]
  };
  color: ${props => 
    props.variant === 'danger' ? theme.colors.danger :
    props.variant === 'primary' ? theme.colors.primary :
    theme.colors.gray[600]
  };
  border: none;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => 
      props.variant === 'danger' ? theme.colors.danger + '20' :
      props.variant === 'primary' ? theme.colors.primary + '20' :
      theme.colors.gray[200]
    };
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.lg};
  z-index: 10;
  min-width: 150px;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 0.875rem;
  color: ${props => props.variant === 'danger' ? theme.colors.danger : theme.colors.gray[700]};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.variant === 'danger' ? theme.colors.danger + '10' : theme.colors.gray[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:first-child {
    border-radius: ${theme.borderRadius.md} ${theme.borderRadius.md} 0 0;
  }

  &:last-child {
    border-radius: 0 0 ${theme.borderRadius.md} ${theme.borderRadius.md};
  }
`;

const EmptyState = styled.div`
  padding: ${theme.spacing['2xl']};
  text-align: center;
  color: ${theme.colors.gray[500]};

  .icon {
    font-size: 3rem;
    margin-bottom: ${theme.spacing.lg};
    opacity: 0.5;
  }

  h3 {
    font-size: 1.125rem;
    margin-bottom: ${theme.spacing.sm};
    color: ${theme.colors.gray[700]};
  }

  p {
    font-size: 0.875rem;
  }
`;

export const FileList = ({
  files,
  loading,
  currentPath,
  onFolderClick,
  onFileDeleted
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [downloadingItems, setDownloadingItems] = useState(new Set());

  const handleDownload = async (item) => {
    setDownloadingItems(prev => new Set(prev).add(item.path));
    
    try {
      console.log('Starting download for:', item.name, 'at path:', item.path);
      
      const response = await fileApi.getDownloadUrl(item.path);
      console.log('Download URL response:', response);
      
      if (response.success && response.data) {
        console.log('Generated download URL:', response.data.downloadUrl);
        
        // Use the simplified downloadFile function
        try {
          await downloadFile(response.data.downloadUrl, item.name);
          console.log('Download function completed successfully');
          toast.success('Download started');
        } catch (downloadError) {
          // This should rarely happen now with simplified function
          console.warn('Download failed:', downloadError);
          toast.error('Download failed');
        }
      } else {
        throw new Error(response.message || 'Failed to get download URL');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to prepare download: ${error.message}`);
    } finally {
      setDownloadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.path);
        return newSet;
      });
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    setDeletingItems(prev => new Set(prev).add(item.path));
    
    try {
      let response;
      
      // Use different API endpoints for files vs folders
      if (item.type === 'folder') {
        console.log('Deleting folder:', item.path);
        response = await folderApi.delete(item.path);
      } else {
        console.log('Deleting file:', item.path);
        response = await fileApi.delete(item.path);
      }
      
      if (response.success) {
        toast.success(`${item.name} deleted successfully`);
        onFileDeleted(); // Call the new prop
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete ${item.name}: ${error.message}`);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.path);
        return newSet;
      });
    }
  };

  const handleFolderClick = (item) => {
    if (item.type === 'folder') {
      onFolderClick(item.path);
    }
  };

  const formatLastModified = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return '';
    }
  };

  const isDeleting = (path) => deletingItems.has(path);
  const isDownloading = (path) => downloadingItems.has(path);

  if (loading) {
    return (
      <ListContainer>
        <EmptyState>
          <div className="icon">⏳</div>
          <h3>Loading...</h3>
          <p>Fetching your files and folders</p>
        </EmptyState>
      </ListContainer>
    );
  }

  if (files.length === 0) {
    return (
      <ListContainer>
        <EmptyState>
          <div className="icon">📁</div>
          <h3>No files yet</h3>
          <p>Upload some files to get started</p>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <ListHeader>
        <div>Name</div>
        <div className="desktop-only">Size</div>
        <div className="desktop-only">Modified</div>
        <div>Actions</div>
      </ListHeader>

      <AnimatePresence>
        {files.map((item, index) => (
          <ListItem
            key={item.path}
            isFolder={item.type === 'folder'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => handleFolderClick(item)}
          >
            <ItemInfo>
              <ItemIcon isFolder={item.type === 'folder'}>
                {item.type === 'folder' ? <FiFolder /> : getFileIcon(item.name)}
              </ItemIcon>
              <ItemDetails>
                <div className="item-name" title={item.name}>
                  {item.name}
                </div>
                <div className="item-meta">
                  <span>{item.type === 'folder' ? 'Folder' : 'File'}</span>
                  {item.size && (
                    <span className="desktop-hidden">
                      {formatFileSize(item.size)}
                    </span>
                  )}
                  {item.lastModified && (
                    <span className="desktop-hidden">
                      {formatLastModified(item.lastModified)}
                    </span>
                  )}
                </div>
              </ItemDetails>
            </ItemInfo>

            <ItemSize className="desktop-only">
              {item.size ? formatFileSize(item.size) : item.type === 'folder' ? '—' : ''}
            </ItemSize>

            <ItemDate className="desktop-only">
              {formatLastModified(item.lastModified)}
            </ItemDate>

            <ActionsContainer onClick={e => e.stopPropagation()}>
              {item.type === 'file' && (
                <ActionButton
                  variant="primary"
                  onClick={() => handleDownload(item)}
                  title="Download"
                  disabled={isDeleting(item.path) || isDownloading(item.path)}
                >
                  {isDownloading(item.path) ? '⏳' : <FiDownload size={16} />}
                </ActionButton>
              )}
              
              <ActionButton
                variant="danger"
                onClick={() => handleDelete(item)}
                title="Delete"
                disabled={isDeleting(item.path)}
              >
                {isDeleting(item.path) ? '⏳' : <FiTrash2 size={16} />}
              </ActionButton>

              <div style={{ position: 'relative' }}>
                <ActionButton
                  onClick={() => setActiveDropdown(
                    activeDropdown === item.path ? null : item.path
                  )}
                  title="More actions"
                >
                  <FiMoreVertical size={16} />
                </ActionButton>

                <DropdownMenu show={activeDropdown === item.path}>
                  {item.type === 'file' && (
                    <DropdownItem 
                      onClick={() => handleDownload(item)}
                      disabled={isDownloading(item.path)}
                    >
                      {isDownloading(item.path) ? '⏳' : <FiDownload size={14} />}
                      {isDownloading(item.path) ? 'Downloading...' : 'Download'}
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={() => console.log('View info', item)}>
                    <FiEye size={14} />
                    View Info
                  </DropdownItem>
                  <DropdownItem variant="danger" onClick={() => handleDelete(item)}>
                    <FiTrash2 size={14} />
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </div>
            </ActionsContainer>
          </ListItem>
        ))}
      </AnimatePresence>

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5
          }}
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </ListContainer>
  );
}; 