import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { 
  FiFolder, 
  FiFile, 
  FiDownload, 
  FiTrash2, 
  FiMoreVertical, 
  FiEye,
  FiImage,
  FiFileText,
  FiMusic,
  FiVideo,
  FiArchive,
  FiCode,
  FiDatabase
} from 'react-icons/fi';
import { format } from 'date-fns';
import { fileApi, formatFileSize, getFileIcon, downloadFile } from '../services/api.js';
import { folderApi } from '../services/api.js';
import { Button } from '../styles/GlobalStyles.js';
import { toast } from 'react-toastify';

// File type detection and icon mapping
const getFileTypeInfo = (fileName) => {
  const extension = fileName.toLowerCase().split('.').pop();
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'].includes(extension)) {
    return {
      icon: FiImage,
      color: '#10b981', // Green
      background: '#10b98120',
      category: 'image'
    };
  }
  
  // Document files
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
    return {
      icon: FiFileText,
      color: '#3b82f6', // Blue
      background: '#3b82f620',
      category: 'document'
    };
  }
  
  // Spreadsheet files
  if (['csv', 'xls', 'xlsx', 'ods'].includes(extension)) {
    return {
      icon: FiDatabase,
      color: '#059669', // Dark green
      background: '#05966920',
      category: 'spreadsheet'
    };
  }
  
  // Audio files
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(extension)) {
    return {
      icon: FiMusic,
      color: '#8b5cf6', // Purple
      background: '#8b5cf620',
      category: 'audio'
    };
  }
  
  // Video files
  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
    return {
      icon: FiVideo,
      color: '#ef4444', // Red
      background: '#ef444420',
      category: 'video'
    };
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
    return {
      icon: FiArchive,
      color: '#f59e0b', // Amber
      background: '#f59e0b20',
      category: 'archive'
    };
  }
  
  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(extension)) {
    return {
      icon: FiCode,
      color: '#6366f1', // Indigo
      background: '#6366f120',
      category: 'code'
    };
  }
  
  // Default file icon
  return {
    icon: FiFile,
    color: '#6b7280', // Gray
    background: '#6b728020',
    category: 'other'
  };
};

const ListContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 120px 100px;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.gray[100]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr auto;
    .desktop-only {
      display: none;
    }
  }
`;

const ListItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 120px 100px;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background-color 0.2s ease;
  cursor: ${props => props.isFolder ? 'pointer' : 'default'};
  position: relative;

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr auto;
    .desktop-only {
      display: none;
    }
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  min-width: 0;
`;

const ItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.iconBackground || (props.isFolder ? props.theme.colors.warning + '20' : props.theme.colors.primary + '20')};
  color: ${props => props.iconColor || (props.isFolder ? props.theme.colors.warning : props.theme.colors.primary)};
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ItemName = styled.div`
  min-width: 0;
  
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    font-size: 0.875rem;
    margin-bottom: 2px;
    word-break: break-word;
  }
  
  .date {
    font-size: 0.75rem;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const ItemSize = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  text-align: right;
`;

const ItemModified = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  text-align: right;
`;

const ItemActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  opacity: 1;
  transition: opacity 0.2s ease;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.gray[200]};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    transform: scale(1.05);
  }
  
  &.danger:hover {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
  
  .icon {
    font-size: 4rem;
    color: ${props => props.theme.colors.gray[300]};
    margin-bottom: ${props => props.theme.spacing.lg};
  }
  
  .title {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  .description {
    font-size: 0.875rem;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.theme.colors.gray[200]};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: ${props => props.theme.spacing.md};
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FileList = React.memo(({ files, loading, currentPath, onFolderClick, onFileDeleted }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deletingItems, setDeletingItems] = useState(new Set());

  const handleFolderClick = useCallback((item) => {
    if (item.type === 'folder') {
      const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      onFolderClick(newPath);
    }
  }, [currentPath, onFolderClick]);

  const handleDownload = useCallback(async (item, e) => {
    e.stopPropagation();
    try {
      await downloadFile(item.path, item.name);
      toast.success(`Download started: ${item.name}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download file');
    }
  }, []);

  const handleDelete = useCallback(async (item, e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to permanently delete "${item.name}"?`)) {
      return;
    }

    const itemId = item.path;
    setDeletingItems(prev => new Set([...prev, itemId]));

    try {
      if (item.type === 'file') {
        await fileApi.delete(item.path);
      } else {
        await folderApi.delete(item.path);
      }
      
      toast.success(`${item.name} deleted successfully`);
      onFileDeleted();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete ${item.name}`);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [onFileDeleted]);

  if (loading) {
    return (
      <ListContainer>
        <LoadingContainer>
          <LoadingSpinner></LoadingSpinner>
          Loading...
        </LoadingContainer>
      </ListContainer>
    );
  }

  if (!files || files.length === 0) {
    return (
      <ListContainer>
        <EmptyState>
          <div className="icon">📁</div>
          <h3>No files or folders</h3>
          <p>This folder is empty. Upload some files or create a new folder to get started.</p>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <ListHeader>
        <span>Name</span>
        <span className="desktop-only">Size</span>
        <span className="desktop-only">Modified</span>
        <span>Actions</span>
      </ListHeader>

      {files.map((item) => {
        // Only get file type info for files, not folders
        const fileTypeInfo = item.type === 'file' ? getFileTypeInfo(item.name) : null;
        const Icon = fileTypeInfo?.icon || FiFile;
        const color = fileTypeInfo?.color;
        const background = fileTypeInfo?.background;
        
        return (
          <ListItem
            key={item.path}
            isFolder={item.type === 'folder'}
            onClick={() => handleFolderClick(item)}
          >
            <ItemInfo>
              <ItemIcon 
                isFolder={item.type === 'folder'} 
                iconBackground={background} 
                iconColor={color}
              >
                {item.type === 'folder' ? <FiFolder /> : <Icon />}
              </ItemIcon>
              <ItemName>
                <div className="name">{item.name}</div>
                <div className="date">{format(new Date(item.lastModified), 'MMM d, yyyy')}</div>
              </ItemName>
            </ItemInfo>

            <ItemSize className="desktop-only">
              {item.type === 'file' ? formatFileSize(item.size) : '—'}
            </ItemSize>

            <ItemModified className="desktop-only">
              {format(new Date(item.lastModified), 'MMM d, yyyy')}
            </ItemModified>

            <ItemActions onClick={e => e.stopPropagation()}>
              {item.type === 'file' && (
                <ActionButton
                  onClick={(e) => handleDownload(item, e)}
                  title="Download"
                >
                  <FiDownload size={14} />
                </ActionButton>
              )}
              
              <ActionButton
                className="danger"
                onClick={(e) => handleDelete(item, e)}
                disabled={deletingItems.has(item.path)}
                title="Delete"
              >
                {deletingItems.has(item.path) ? (
                  <LoadingSpinner style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent' }}></LoadingSpinner>
                ) : (
                  <FiTrash2 size={14} />
                )}
              </ActionButton>
            </ItemActions>
          </ListItem>
        );
      })}
    </ListContainer>
  );
});

FileList.displayName = 'FileList';

export { FileList }; 