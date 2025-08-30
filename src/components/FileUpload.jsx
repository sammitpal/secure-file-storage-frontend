import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiUpload, FiFile, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { fileApi } from '../services/api';

const UploadContainer = styled.div`
  width: 100%;
`;

const DropZone = styled.div`
  position: relative;
  border: 2px dashed ${props => props.$isDragOver 
    ? 'var(--primary)' 
    : props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius-lg);
  background: ${props => props.$isDragOver 
    ? 'rgba(99, 102, 241, 0.05)' 
    : props.theme?.colors?.surface || '#ffffff'};
  padding: var(--space-12) var(--space-8);
  text-align: center;
  transition: var(--transition);
  cursor: pointer;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$isDragOver 
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
      : 'transparent'};
    transition: var(--transition);
    pointer-events: none;
  }
  
  &:hover {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.02);
    transform: translateY(-2px);
    box-shadow: ${props => props.theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
  }
`;

const UploadIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-6);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  position: relative;
  animation: ${props => props.$isUploading ? 'pulse 2s infinite' : 'none'};
  
  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 50%;
    z-index: -1;
    opacity: 0.3;
    filter: blur(8px);
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const UploadText = styled.div`
  margin-bottom: var(--space-4);
  
  h3 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    margin-bottom: var(--space-2);
  }
  
  p {
    font-size: var(--font-size-base);
    color: ${props => props.theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const BrowseButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileList = styled.div`
  margin-top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const FileItem = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: ${props => props.theme.colors.borderHover};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
  transition: all 0.3s ease;
  
  background: ${props => {
    if (props.$status === 'success') return 'linear-gradient(135deg, var(--success), #059669)';
    if (props.$status === 'error') return 'linear-gradient(135deg, var(--danger), #dc2626)';
    return 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
  }};
  color: white;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

const FileName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  font-size: var(--font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSize = styled.div`
  font-size: var(--font-size-xs);
  color: ${props => props.theme.colors.textSecondary};
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 120px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${props => props.theme.colors.border};
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: inherit;
  transition: width 0.3s ease;
  width: ${props => props.$progress || 0}%;
  
  background: ${props => {
    if (props.$status === 'success') return 'linear-gradient(90deg, var(--success), #059669)';
    if (props.$status === 'error') return 'linear-gradient(90deg, var(--danger), #dc2626)';
    return 'linear-gradient(90deg, var(--primary), var(--primary-dark))';
  }};
  
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: ${props => props.$status === 'uploading' ? 'shimmer 1.5s infinite' : 'none'};
  }
`;

const ProgressText = styled.div`
  font-size: var(--font-size-xs);
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  width: 32px;
  height: 32px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
  
  &:hover {
    background: var(--danger);
    border-color: var(--danger);
    color: white;
    transform: scale(1.1);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatusIcon = styled.div`
  font-size: 16px;
  margin-left: 8px;
  
  color: ${props => {
    if (props.$status === 'success') return 'var(--success)';
    if (props.$status === 'error') return 'var(--danger)';
    return 'var(--text-secondary)';
  }};
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius);
  padding: var(--space-3) var(--space-4);
  margin-top: var(--space-4);
  color: var(--danger);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const FileUpload = ({ currentFolderPath, onUploadSuccess }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const currentFolderPathRef = useRef(currentFolderPath);

  // Keep ref updated with latest prop value
  useEffect(() => {
    currentFolderPathRef.current = currentFolderPath;
  }, [currentFolderPath]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear any pending file uploads when component unmounts
      setFiles([]);
      setError('');
    };
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e) => {
    console.log('📁 File select triggered, files:', e.target.files);
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, []);

  const handleFiles = useCallback((newFiles) => {
    console.log('📂 Processing files:', newFiles);
    setError('');
    const fileItems = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'pending' // pending, uploading, success, error
    }));
    
    console.log('📋 Created file items:', fileItems);
    setFiles(prev => [...prev, ...fileItems]);
    
    // Start uploading files
    fileItems.forEach(fileItem => {
      uploadFile(fileItem);
    });
  }, []);

  const uploadFile = useCallback(async (fileItem) => {
    let progressInterval = null;
    
    try {
      console.log('🚀 Starting upload for:', fileItem.name);
      console.log('🔧 Using currentFolderPath:', currentFolderPath);
      
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      const formData = new FormData();
      formData.append('files', fileItem.file);
      if (currentFolderPathRef.current) {
        formData.append('folderPath', currentFolderPathRef.current);
        console.log('📤 Added folderPath to FormData:', currentFolderPathRef.current);
      } else {
        console.log('📤 No folderPath - uploading to root');
      }

      console.log('📤 FormData prepared:', {
        fileName: fileItem.file.name,
        fileSize: fileItem.file.size,
        currentFolderPath,
        currentFolderPathRef: currentFolderPathRef.current,
        folderPathSent: currentFolderPath || 'ROOT_DIRECTORY'
      });

      // Simulate progress updates
      progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === fileItem.id && f.status === 'uploading') {
            const newProgress = Math.min(f.progress + Math.random() * 30, 90);
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);

      const response = await fileApi.uploadFile(formData);
      console.log('✅ Upload response:', response);

      // Clear interval before processing response
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      if (response.success) {
        console.log('🎉 Upload successful for:', fileItem.name);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'success', progress: 100 }
            : f
        ));
        
        // Remove successful uploads after 3 seconds
        setTimeout(() => {
          setFiles(prev => prev.filter(f => f.id !== fileItem.id));
        }, 3000);
        
        // Call the success callback to refresh the file list
        if (onUploadSuccess) {
          console.log('🔄 Calling onUploadSuccess callback');
          onUploadSuccess();
        }
      } else {
        console.error('❌ Upload failed:', response.message);
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('💥 Upload error:', error);
      
      // Clear interval on error
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ));
      setError(error.message || 'Upload failed');
    }
  }, [onUploadSuccess]);

  // Debug: Log when currentFolderPath prop changes
  useEffect(() => {
    console.log('🔧 FileUpload currentFolderPath prop updated to:', currentFolderPath);
  }, [currentFolderPath]);

  const removeFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleBrowseClick = useCallback((e) => {
    e.stopPropagation(); // Prevent event bubbling
    fileInputRef.current?.click();
  }, []);

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'success':
        return <FiCheck />;
      case 'error':
        return <FiAlertCircle />;
      default:
        return <FiFile />;
    }
  }, []);

  const isUploading = files.some(f => f.status === 'uploading');

  return (
    <UploadContainer>
      <DropZone
        $isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropZoneClick}
      >
        <UploadIcon $isUploading={isUploading}>
          <FiUpload />
        </UploadIcon>
        
        <UploadText>
          <h3>
            {isDragOver ? 'Drop files here' : 'Upload Files'}
          </h3>
          <p>
            Drag and drop files here, or{' '}
            <BrowseButton type="button" onClick={handleBrowseClick}>
              <FiFile />
              browse files
            </BrowseButton>
          </p>
        </UploadText>
        
        <FileInput
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
        />
      </DropZone>

      {error && (
        <ErrorMessage>
          <FiAlertCircle />
          {error}
        </ErrorMessage>
      )}

      {files.length > 0 && (
        <FileList>
          {files.map(fileItem => (
            <FileItem key={fileItem.id}>
              <FileIcon $status={fileItem.status}>
                {getStatusIcon(fileItem.status)}
              </FileIcon>
              
              <FileInfo>
                <FileName>{fileItem.name}</FileName>
                <FileSize>{formatFileSize(fileItem.size)}</FileSize>
              </FileInfo>
              
              {fileItem.status === 'uploading' && (
                <ProgressContainer>
                  <ProgressBar>
                    <ProgressFill 
                      $progress={fileItem.progress} 
                      $status={fileItem.status}
                    />
                  </ProgressBar>
                  <ProgressText>{Math.round(fileItem.progress)}%</ProgressText>
                </ProgressContainer>
              )}
              
              {fileItem.status === 'success' && (
                <StatusIcon $status="success">
                  <FiCheck />
                </StatusIcon>
              )}
              
              {fileItem.status === 'error' && (
                <StatusIcon $status="error">
                  <FiAlertCircle />
                </StatusIcon>
              )}
              
              {fileItem.status !== 'success' && (
                <RemoveButton onClick={() => removeFile(fileItem.id)}>
                  <FiX />
                </RemoveButton>
              )}
            </FileItem>
          ))}
        </FileList>
      )}
    </UploadContainer>
  );
};

export default FileUpload; 