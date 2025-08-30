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
  FiDatabase,
  FiShare,
  FiRefreshCw
} from 'react-icons/fi';
import { format } from 'date-fns';
import { fileApi } from '../services/api';
import ShareModal from './ShareModal';

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

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }
`;

const FileCount = styled.div`
  font-size: var(--font-size-sm);
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
  
  .count {
    color: ${props => props.theme.colors.text};
    font-weight: 600;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius);
  font-weight: 500;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(99, 102, 241, 0.05)'};
    border-color: ${props => props.theme?.colors?.borderHover || '#d1d5db'};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme?.shadows?.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 16px;
    height: 16px;
    animation: ${props => props.$isRefreshing ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FileCard = styled.div`
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  cursor: ${props => props.$isFolder ? 'pointer' : 'default'};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$isFolder 
      ? 'linear-gradient(90deg, var(--primary), var(--secondary))'
      : `linear-gradient(90deg, ${props.$iconColor || '#6b7280'}, ${props.$iconColor || '#6b7280'}dd)`};
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.theme?.colors?.borderHover || '#d1d5db'};
  }
`;

const FileIcon = styled.div`
  width: 56px;
  height: 56px;
  background: ${props => props.$isFolder 
    ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
    : props.$background || '#6b728020'};
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isFolder ? 'white' : props.$color || '#6b7280'};
  font-size: 1.5rem;
  margin-bottom: var(--space-4);
  box-shadow: var(--shadow);
  
  svg {
    width: 28px;
    height: 28px;
  }
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.h3`
  font-size: var(--font-size-base);
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 var(--space-2) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
`;

const FileSize = styled.span`
  font-size: var(--font-size-xs);
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
`;

const FileDate = styled.span`
  font-size: var(--font-size-xs);
  color: ${props => props.theme.colors.textSecondary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: ${props => {
    if (props.$variant === 'share') return 'linear-gradient(135deg, var(--success), #059669)';
    if (props.$variant === 'danger') return 'linear-gradient(135deg, var(--danger), #dc2626)';
    return props.theme?.colors?.surface || '#ffffff';
  }};
  color: ${props => {
    if (props.$variant === 'share' || props.$variant === 'danger') return 'white';
    return props.theme?.colors?.textSecondary || '#666666';
  }};
  border: 1px solid ${props => {
    if (props.$variant === 'share') return 'var(--success)';
    if (props.$variant === 'danger') return 'var(--danger)';
    return props.theme?.colors?.border || '#e5e5e5';
  }};
  border-radius: var(--radius);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => {
      if (props.$variant === 'share') return '0 4px 12px rgba(16, 185, 129, 0.3)';
      if (props.$variant === 'danger') return '0 4px 12px rgba(239, 68, 68, 0.3)';
      return props.theme?.shadows?.sm || '0 2px 4px rgba(0,0,0,0.1)';
    }};
    
    ${props => !props.$variant && `
      background: ${props.theme?.colors?.hover || '#f5f5f5'};
      color: ${props.theme?.colors?.text || '#333333'};
    `}
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-16) var(--space-8);
  color: ${props => props.theme.colors.textSecondary};
  
  .icon {
    width: 64px;
    height: 64px;
    margin: 0 auto var(--space-6);
    background: ${props => props.theme.colors.surface};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.colors.textSecondary};
    font-size: 1.5rem;
  }
  
  h3 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    margin: 0 0 var(--space-2) 0;
  }
  
  p {
    font-size: var(--font-size-base);
    margin: 0;
  }
`;

const LoadingState = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const LoadingSkeleton = styled.div`
  background: ${props => props.theme.colors.border};
  border-radius: var(--radius);
  
  &.icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
  }
  
  &.title {
    height: 20px;
    margin-bottom: var(--space-2);
  }
  
  &.subtitle {
    height: 14px;
    width: 60%;
    margin-bottom: var(--space-1);
  }
  
  &.date {
    height: 14px;
    width: 40%;
    margin-bottom: var(--space-4);
  }
  
  &.button {
    height: 32px;
    margin-right: var(--space-2);
    flex: 1;
  }
`;

const FileList = ({ files, folders, loading, onNavigate, onRefresh }) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatDate = useCallback((dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [onRefresh]);

  const handleDownload = useCallback(async (file) => {
    try {
      // Extract the file key from s3Key by removing the user prefix
      const fileKey = file.s3Key ? file.s3Key.replace(/^users\/[^\/]+\//, '') : file.name;
      console.log('🔽 Downloading file:', { fileName: file.name, fileKey, s3Key: file.s3Key });
      
      const response = await fileApi.getDownloadUrl(fileKey);
      console.log('📥 Download response:', response);
      
      if (response.success && response.data && response.data.downloadUrl) {
        // Check if it's a mock URL (S3 not available)
        if (response.data.downloadUrl.startsWith('mock://')) {
          alert('⚠️ File storage is in mock mode. Download functionality requires AWS S3 configuration.');
          return;
        }
        window.open(response.data.downloadUrl, '_blank');
      } else {
        throw new Error(response.message || 'Failed to get download URL');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error.message || 'Please try again'}`);
    }
  }, []);

  const handleDelete = useCallback(async (item, isFolder) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      let response;
      if (isFolder) {
        // For folders, construct the full folder path
        const folderPath = item.path ? `${item.path}/${item.name}` : item.name;
        console.log('🗑️ Deleting folder:', { folderName: item.name, folderPath, itemPath: item.path });
        response = await fileApi.deleteFolder(folderPath);
      } else {
        // For files, extract the file key from s3Key
        const fileKey = item.s3Key ? item.s3Key.replace(/^users\/[^\/]+\//, '') : item.name;
        console.log('🗑️ Deleting file:', { fileName: item.name, fileKey, s3Key: item.s3Key });
        response = await fileApi.deleteFile(fileKey);
      }
      
      if (response.success) {
        onRefresh();
      } else {
        throw new Error(response.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      // Could add toast notification here
    }
  }, [onRefresh]);

  const handleShare = useCallback(async (file) => {
    try {
      console.log('🔗 Sharing file:', { fileName: file.name, fileId: file.id });
      const response = await fileApi.shareFile(file.id);
      console.log('🔗 Share response:', response);
      
      if (response.success && response.data && response.data.shareUrl) {
        // Copy to clipboard
        try {
          await navigator.clipboard.writeText(response.data.shareUrl);
          // Show a better modal/notification instead of alert
          const modal = document.createElement('div');
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          `;
          
          modal.innerHTML = `
            <div style="
              background: white;
              border-radius: 12px;
              padding: 24px;
              max-width: 500px;
              width: 90%;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
              <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <div style="
                  width: 48px;
                  height: 48px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 16px;
                  color: white;
                  font-size: 20px;
                ">🔗</div>
                <div>
                  <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">Share Link Created</h3>
                  <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Link copied to clipboard</p>
                </div>
              </div>
              
              <div style="
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 13px;
                word-break: break-all;
                color: #374151;
              ">${response.data.shareUrl}</div>
              
              <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button onclick="navigator.clipboard.writeText('${response.data.shareUrl}')" style="
                  background: #f3f4f6;
                  border: 1px solid #d1d5db;
                  border-radius: 6px;
                  padding: 8px 16px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  color: #374151;
                ">Copy Again</button>
                <button onclick="this.closest('[data-share-modal]').remove()" style="
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  border: none;
                  border-radius: 6px;
                  padding: 8px 16px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  color: white;
                ">Close</button>
              </div>
            </div>
          `;
          
          modal.setAttribute('data-share-modal', 'true');
          modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
          };
          
          document.body.appendChild(modal);
          
          // Auto-remove after 10 seconds
          setTimeout(() => {
            if (document.body.contains(modal)) {
              modal.remove();
            }
          }, 10000);
          
        } catch (clipboardError) {
          console.warn('Clipboard access failed:', clipboardError);
          alert(`Share link created:\n\n${response.data.shareUrl}`);
        }
      } else {
        throw new Error(response.message || 'Failed to create share link');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert(`Share failed: ${error.message || 'Please try again'}`);
    }
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShareModalOpen(false);
    setSelectedFile(null);
  }, []);

  const totalItems = (files?.length || 0) + (folders?.length || 0);

  if (loading) {
    return (
      <Container>
        <Header>
          <FileCount>Loading...</FileCount>
        </Header>
        <LoadingState>
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingCard key={index}>
              <LoadingSkeleton className="icon" />
              <LoadingSkeleton className="title" />
              <LoadingSkeleton className="subtitle" />
              <LoadingSkeleton className="date" />
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <LoadingSkeleton className="button" />
                <LoadingSkeleton className="button" />
              </div>
            </LoadingCard>
          ))}
        </LoadingState>
      </Container>
    );
  }

  if (totalItems === 0) {
    return (
      <Container>
        <Header>
          <FileCount>
            <span className="count">0</span> items
          </FileCount>
          <RefreshButton onClick={handleRefresh} disabled={isRefreshing} $isRefreshing={isRefreshing}>
            <FiRefreshCw />
            Refresh
          </RefreshButton>
        </Header>
        <EmptyState>
          <div className="icon">
            <FiFolder />
          </div>
          <h3>No files or folders</h3>
          <p>Upload some files or create a folder to get started</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <FileCount>
          <span className="count">{totalItems}</span> {totalItems === 1 ? 'item' : 'items'}
        </FileCount>
        <RefreshButton onClick={handleRefresh} disabled={isRefreshing} $isRefreshing={isRefreshing}>
          <FiRefreshCw />
          Refresh
        </RefreshButton>
      </Header>

      <FileGrid>
        {/* Render folders first */}
        {folders?.map((folder) => (
          <FileCard
            key={folder.id}
            $isFolder={true}
            onClick={() => onNavigate(folder.id, folder.name)}
          >
            <FileIcon $isFolder={true}>
              <FiFolder />
            </FileIcon>
            <FileInfo>
              <FileName>{folder.name}</FileName>
              <FileDetails>
                <FileDate>{formatDate(folder.createdAt)}</FileDate>
              </FileDetails>
            </FileInfo>
            <ActionButtons>
              <ActionButton
                $variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(folder, true);
                }}
              >
                <FiTrash2 />
                Delete
              </ActionButton>
            </ActionButtons>
          </FileCard>
        ))}

        {/* Render files */}
        {files?.map((file) => {
          const typeInfo = getFileTypeInfo(file.name);
          const IconComponent = typeInfo.icon;

          return (
            <FileCard
              key={file.id}
              $iconColor={typeInfo.color}
            >
              <FileIcon
                $background={typeInfo.background}
                $color={typeInfo.color}
              >
                <IconComponent />
              </FileIcon>
              <FileInfo>
                <FileName>{file.name}</FileName>
                <FileDetails>
                  <FileSize>{formatFileSize(file.size)}</FileSize>
                  <FileDate>{formatDate(file.uploadedAt)}</FileDate>
                </FileDetails>
              </FileInfo>
              <ActionButtons>
                <ActionButton onClick={() => handleDownload(file)}>
                  <FiDownload />
                  Download
                </ActionButton>
                <ActionButton
                                        $variant="share"
                  onClick={() => handleShare(file)}
                >
                  <FiShare />
                  Share
                </ActionButton>
                <ActionButton
                  $variant="danger"
                  onClick={() => handleDelete(file, false)}
                >
                  <FiTrash2 />
                  Delete
                </ActionButton>
              </ActionButtons>
            </FileCard>
          );
        })}
      </FileGrid>

      {shareModalOpen && selectedFile && (
        <ShareModal
          file={selectedFile}
          onClose={handleCloseShareModal}
        />
      )}
    </Container>
  );
};

export default FileList; 