import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import styled, { keyframes } from 'styled-components';
import { 
  FiUploadCloud, 
  FiFile, 
  FiX, 
  FiCheck, 
  FiAlertTriangle,
  FiImage,
  FiFileText,
  FiMusic,
  FiVideo,
  FiArchive,
  FiCode,
  FiDatabase 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { fileApi, formatFileSize } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

// Simple spin animation only
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Pulse animation for upload icon
const pulse = keyframes`
  0%, 100% {
    box-shadow: 
      0 8px 32px rgba(102, 126, 234, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 12px 40px rgba(102, 126, 234, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.2);
  }
`;

// File type detection and icon mapping (same as FileList)
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

const DropzoneContainer = styled.div`
  border: 3px dashed ${props => 
    props.isDragReject ? props.theme.colors.danger : 
    props.isDragActive ? props.theme.colors.primary : 
    props.theme.colors.gray[300]
  };
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing['2xl']};
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => 
    props.isDragReject ? props.theme.colors.danger + '10' :
    props.isDragActive ? props.theme.colors.gray[100] :
    props.theme.colors.surface
  };
  box-shadow: ${props => 
    props.isDragActive ? props.theme.shadows.xl : props.theme.shadows.md
  };
  transform: ${props => props.isDragActive ? 'scale(1.02)' : 'none'};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.gray[50]};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const UploadIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto ${props => props.theme.spacing.lg};
  box-shadow: 
    0 8px 32px rgba(102, 126, 234, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 
      0 12px 40px rgba(102, 126, 234, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.2);
    
    &::before {
      opacity: 1;
    }
  }
  
  /* Subtle pulse animation */
  animation: ${pulse} 3s ease-in-out infinite;
`;

const UploadText = styled.div`
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  p {
    color: ${props => props.theme.colors.textSecondary};
    margin-bottom: ${props => props.theme.spacing.md};
    font-size: 0.875rem;
  }
  
  .file-limit {
    font-size: 0.75rem;
    color: ${props => props.theme.colors.gray[500]};
    margin-top: ${props => props.theme.spacing.sm};
  }
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray[400]};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const FileList = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gray[50]};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const FileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.iconBackground || 'linear-gradient(135deg, #8b5cf6, #7c3aed)'};
  color: ${props => props.iconColor || 'white'};
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const FileDetails = styled.div`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  
  .name {
    font-weight: 500;
    color: ${props => props.theme.colors.text};
    font-size: 0.875rem;
    margin-bottom: 2px;
    word-break: break-word;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  
  .size {
    font-size: 0.75rem;
    color: ${props => props.theme.colors.textSecondary};
    white-space: nowrap;
  }
`;

const FileStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-shrink: 0;
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.875rem;
  
  &.uploading {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    animation: ${spin} 1s linear infinite;
  }
  
  &.success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  }
  
  &.error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }
  
  ${spin}
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: ${props => props.theme.colors.gray[200]};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${props => props.theme.colors.gray[500]};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.sm};
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  border-radius: ${props => props.theme.borderRadius.full};
`;

export const FileUpload = ({ currentPath, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { hasQuotaSpace, getQuotaInfo } = useAuth();
  const { theme } = useTheme();

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: (acceptedFiles, rejectedFiles) => {
      // Check for rejected files first
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          const errorMessages = errors.map(error => {
            switch (error.code) {
              case 'file-too-large':
                return `File "${file.name}" is too large. Maximum size is 10MB.`;
              case 'file-invalid-type':
                return `File "${file.name}" type is not supported.`;
              default:
                return `File "${file.name}" was rejected: ${error.message}`;
            }
          });
          toast.error(errorMessages.join(' '));
        });
      }

      if (acceptedFiles.length === 0) return;

      // Calculate total size of new files
      const totalNewSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0);
      const quotaInfo = getQuotaInfo();

      // Check if user has enough quota space
      if (!hasQuotaSpace(totalNewSize)) {
        const remainingSpace = quotaInfo.remainingQuota;
        toast.error(
          `Not enough storage space! You need ${formatFileSize(totalNewSize)} but only have ${formatFileSize(remainingSpace)} remaining.`
        );
        return;
      }

      // If all files can fit within quota, add them to upload queue
      const newFiles = acceptedFiles.map(file => ({
        file,
        status: 'pending',
        progress: 0
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      
      // Show success message for accepted files
      if (acceptedFiles.length > 0) {
        toast.success(`${acceptedFiles.length} file(s) added to upload queue.`);
      }
    },
    onDropRejected: (rejectedFiles) => {
      // This is handled in onDrop callback above
    },
    onError: (error) => {
      toast.error(`Upload error: ${error.message}`);
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB per file
    maxFiles: 20, // Maximum 20 files at once
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const uploadPromises = files.map(async (fileItem, index) => {
      try {
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        const response = await fileApi.uploadWithProgress(
          [fileItem.file],
          currentPath,
          (progress) => {
            setFiles(prev => prev.map((f, i) => 
              i === index ? { ...f, progress } : f
            ));
          }
        );

        if (response.success) {
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, status: 'success', progress: 100 } : f
          ));
          return { success: true, file: fileItem.file };
        } else {
          throw new Error(response.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error for file:', fileItem.file.name, error);
        
        // Handle specific S3 configuration errors
        let errorMessage = error.message || 'Upload failed';
        
        if (error.response?.status === 503) {
          errorMessage = 'File storage service is currently unavailable. Please contact administrator.';
        } else if (errorMessage.includes('S3 storage is not configured')) {
          errorMessage = 'File storage is not properly configured. Please contact administrator.';
        } else if (errorMessage.includes('S3 bucket not found')) {
          errorMessage = 'Storage configuration error. Please contact administrator.';
        } else if (errorMessage.includes('S3 access denied')) {
          errorMessage = 'Storage access error. Please contact administrator.';
        }
        
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, status: 'error', error: errorMessage } : f
        ));
        return { success: false, error: errorMessage, file: fileItem.file };
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));

      if (successful.length > 0) {
        toast.success(`${successful.length} file(s) uploaded successfully!`);
        if (onUploadComplete) {
          onUploadComplete();
        }
      }

      if (failed.length > 0) {
        const errorMessages = failed.map(r => 
          r.status === 'rejected' ? r.reason.message : r.value.error
        );
        
        // Show first error message, as they're likely all the same S3 config issue
        toast.error(errorMessages[0] || `${failed.length} file(s) failed to upload`);
      }

      // Clear successful uploads after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'success'));
      }, 3000);

    } catch (error) {
      console.error('Upload process error:', error);
      toast.error('Upload process failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [files, currentPath, onUploadComplete]);

  // Get quota info for display
  const quotaInfo = getQuotaInfo();
  const totalFilesSize = files.reduce((sum, f) => sum + f.file.size, 0);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <StatusIcon className="uploading">
          <FiUploadCloud />
        </StatusIcon>;
      case 'success':
        return <StatusIcon className="success">
          <FiCheck />
        </StatusIcon>;
      case 'error':
        return <StatusIcon className="error">
          <FiX />
        </StatusIcon>;
      default:
        return null;
    }
  };

  const getStatusText = (status, error, progress = 0) => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${progress}%`;
      case 'success':
        return 'Uploaded';
      case 'error':
        return error || 'Failed';
      default:
        return 'Ready';
    }
  };

  // Check if upload would exceed quota
  const wouldExceedQuota = totalFilesSize > quotaInfo.remainingQuota;

  return (
    <div>
      <DropzoneContainer 
        {...getRootProps()} 
        isDragActive={isDragActive}
        isDragReject={isDragReject}
      >
        <input {...getInputProps()} />
        <UploadIcon>
          <FiUploadCloud />
        </UploadIcon>
        <UploadText>
          {isDragActive ? (
            isDragReject ? (
              <div>
                <h3>Some files cannot be accepted</h3>
                <p>Please check file types and sizes</p>
              </div>
            ) : (
              <div>
                <h3>Drop files here</h3>
                <p>Release to add files to upload queue</p>
              </div>
            )
          ) : (
            <div>
              <h3>Drag & drop files here</h3>
              <p>or <span className="supported-formats">click to browse</span></p>
              <small className="file-limit">Maximum 10MB per file • 20 files max</small>
            </div>
          )}
        </UploadText>
      </DropzoneContainer>

      {/* Quota Warning */}
      {wouldExceedQuota && files.length > 0 && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: theme.colors.danger + '20',
            border: `1px solid ${theme.colors.danger}40`,
            borderRadius: theme.borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: theme.colors.danger
          }}
        >
          <FiAlertTriangle />
          <div>
            <strong>Storage quota exceeded!</strong>
            <br />
            <small>
              These files ({formatFileSize(totalFilesSize)}) would exceed your remaining quota ({formatFileSize(quotaInfo.remainingQuota)}).
              Remove some files or upgrade your storage.
            </small>
          </div>
        </div>
      )}

      {/* Quota Display */}
      {files.length > 0 && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            fontSize: '0.875rem',
            color: theme.colors.text
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Upload Size: <strong>{formatFileSize(totalFilesSize)}</strong></span>
            <span>Available: <strong>{formatFileSize(quotaInfo.remainingQuota)}</strong></span>
          </div>
          <div style={{ 
            height: '6px', 
            background: theme.colors.gray[500], 
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min((totalFilesSize / quotaInfo.remainingQuota) * 100, 100)}%`,
                background: wouldExceedQuota ? theme.colors.danger : theme.colors.success,
                transition: 'width 0.3s ease',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <FileList>
          {files.map((fileItem, index) => {
            const { icon: Icon, color, background, category } = getFileTypeInfo(fileItem.file.name);
            return (
              <FileItem key={`${fileItem.file.name}-${index}`}>
                <FileInfo>
                  <FileIcon 
                    iconBackground={background} 
                    iconColor={color}
                  >
                    <Icon />
                  </FileIcon>
                  <FileDetails>
                    <div className="name">{fileItem.file.name}</div>
                    <div className="size">{formatFileSize(fileItem.file.size)}</div>
                    {fileItem.status === 'uploading' && (
                      <ProgressBar>
                        <ProgressFill progress={fileItem.progress} />
                      </ProgressBar>
                    )}
                  </FileDetails>
                </FileInfo>
                
                <FileStatus>
                  {fileItem.status === 'uploading' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(fileItem.status)}
                      <span style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                        {Math.round(fileItem.progress)}%
                      </span>
                    </div>
                  ) : fileItem.status === 'success' || fileItem.status === 'error' ? (
                    getStatusIcon(fileItem.status)
                  ) : (
                    <RemoveButton
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <FiX />
                    </RemoveButton>
                  )}
                </FileStatus>
              </FileItem>
            );
          })}
        </FileList>
      )}

      {files.length > 0 && (
        <UploadButton
          onClick={uploadFiles}
          disabled={isUploading || files.length === 0 || wouldExceedQuota}
        >
          {isUploading ? (
            <>
              <StatusIcon className="uploading">
                <FiUploadCloud />
              </StatusIcon>
              Uploading...
            </>
          ) : (
            <>
              <FiUploadCloud />
              Upload {files.length} file{files.length !== 1 ? 's' : ''}
            </>
          )}
        </UploadButton>
      )}
    </div>
  );
}; 