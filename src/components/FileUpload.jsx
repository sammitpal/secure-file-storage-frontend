import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled, { keyframes } from 'styled-components';
import { FiUploadCloud, FiFile, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { fileApi } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { theme } from '../styles/GlobalStyles.js';
import { toast } from 'react-toastify';

const pulse = keyframes`
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 20px rgba(26, 26, 26, 0.1), 0 0 40px rgba(26, 26, 26, 0.05);
  }
  50% { 
    opacity: 0.95; 
    box-shadow: 0 0 40px rgba(26, 26, 26, 0.2), 0 0 80px rgba(26, 26, 26, 0.1);
  }
`;

const shimmerGlow = keyframes`
  0% { 
    background-position: -200% center;
  }
  100% { 
    background-position: 200% center;
  }
`;

const DropzoneContainer = styled.div`
  border: 3px dashed ${props => 
    props.isDragReject ? theme.colors.danger : 
    props.isDragActive ? theme.colors.primary : 
    theme.colors.gray[300]
  };
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['2xl']};
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${props => 
    props.isDragActive ? 
      `linear-gradient(135deg, rgba(26, 26, 26, 0.05), rgba(26, 26, 26, 0.02))` : 
      `rgba(255, 255, 255, 0.9)`
  };
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  box-shadow: ${theme.shadows.md};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transition: left 0.8s ease;
  }

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${props => 
      props.isDragActive ? 
        `linear-gradient(135deg, rgba(26, 26, 26, 0.08), rgba(26, 26, 26, 0.04))` : 
        `rgba(255, 255, 255, 0.95)`
    };
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.xl};
    
    &::before {
      left: 100%;
    }
  }

  ${props => props.isDragActive && `
    animation: ${pulse} 1.5s infinite;
    transform: scale(1.02) translateY(-4px);
    border-color: ${theme.colors.primary};
    background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.05) 0%,
      rgba(26, 26, 26, 0.08) 50%,
      rgba(26, 26, 26, 0.05) 100%
    );
    background-size: 200% 200%;
    animation: ${pulse} 1.5s infinite, ${shimmerGlow} 2s infinite;
    box-shadow: 
      0 12px 48px rgba(26, 26, 26, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  `}
  
  ${props => props.isDragReject && `
    border-color: ${theme.colors.danger};
    background: rgba(239, 68, 68, 0.05);
    color: ${theme.colors.danger};
  `}
`;

const UploadIcon = styled(FiUploadCloud)`
  font-size: 5rem;
  color: ${props => props.isDragActive ? theme.colors.primary : theme.colors.gray[400]};
  margin-bottom: ${theme.spacing.lg};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
  
  ${props => props.isDragActive && `
    color: ${theme.colors.primary};
    transform: scale(1.1) translateY(-4px);
    filter: drop-shadow(0 8px 25px rgba(26, 26, 26, 0.2));
  `}
`;

const UploadText = styled.div`
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.md};
    letter-spacing: -0.025em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  p {
    color: ${theme.colors.gray[600]};
    font-size: 1rem;
    line-height: 1.6;
    font-weight: 500;
  }

  .highlight {
    color: ${theme.colors.primary};
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: rgba(26, 26, 26, 0.3);
    text-underline-offset: 2px;
  }
`;

const FileList = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const FileItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${props => {
    switch (props.status) {
      case 'uploading': return theme.colors.info + '10';
      case 'success': return theme.colors.success + '10';
      case 'error': return theme.colors.danger + '10';
      default: return theme.colors.gray[50];
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'uploading': return theme.colors.info + '30';
      case 'success': return theme.colors.success + '30';
      case 'error': return theme.colors.danger + '30';
      default: return theme.colors.gray[200];
    }
  }};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.xs};
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex: 1;

  .file-icon {
    font-size: 1.25rem;
    color: ${theme.colors.primary};
  }

  .file-details {
    flex: 1;
    
    .file-name {
      font-weight: 500;
      color: ${theme.colors.gray[700]};
      font-size: 0.875rem;
    }
    
    .file-size {
      font-size: 0.75rem;
      color: ${theme.colors.gray[500]};
    }
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const FileStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => {
    switch (props.status) {
      case 'uploading': return theme.colors.info;
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.danger;
      default: return theme.colors.gray[500];
    }
  }};
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
  width: ${props => props.progress || 0}%;
  transition: width 0.3s ease;
  border-radius: 0 0 ${theme.borderRadius.md} ${theme.borderRadius.md};
  opacity: ${props => props.progress > 0 ? 1 : 0};
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: ${props => props.progress > 0 && props.progress < 100 ? 'shimmer 2s infinite' : 'none'};
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.gray[400]};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.colors.danger};
    background: ${theme.colors.danger}10;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UploadButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 16px rgba(26, 26, 26, 0.2),
    0 2px 4px rgba(26, 26, 26, 0.1);
  letter-spacing: 0.025em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 24px rgba(26, 26, 26, 0.3),
      0 4px 8px rgba(26, 26, 26, 0.15);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 8px rgba(26, 26, 26, 0.1);

    &::before {
      display: none;
    }
  }
`;

const FileIcon = styled.div`
  color: ${theme.colors.primary};
  font-size: 1.25rem;
  margin-right: ${theme.spacing.sm};
  filter: drop-shadow(0 1px 2px rgba(26, 26, 26, 0.1));
`;

const FileDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-weight: 600;
  color: ${theme.colors.primary};
  font-size: 0.875rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  font-size: 0.75rem;
  color: ${theme.colors.gray[500]};
  font-weight: 500;
`;

export const FileUpload = ({ currentPath, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { hasQuotaSpace, getQuotaInfo } = useAuth();

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

  const uploadFiles = async () => {
    if (files.length === 0) return;

    // Double-check quota before uploading
    const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
    if (!hasQuotaSpace(totalSize)) {
      toast.error('Insufficient storage space for upload!');
      return;
    }

    setIsUploading(true);
    
    try {
      // Update all files to uploading status
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading', progress: 0 })));

      // Upload files sequentially to track individual progress
      const uploadResults = [];
      
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        
        try {
          // Upload with progress tracking using the fileApi.uploadWithProgress method
          const response = await fileApi.uploadWithProgress(
            [fileItem.file], // Pass as array
            currentPath,
            (progress) => {
              // Update progress for this specific file
              setFiles(prev => prev.map((f, index) => 
                index === i ? { ...f, progress: progress } : f
              ));
            }
          );

          if (response.success && response.results && response.results[0]) {
            const result = response.results[0];
            uploadResults.push(result);
            
            // Mark this file as successful
            setFiles(prev => prev.map((f, index) => 
              index === i ? { 
                ...f, 
                status: 'success', 
                progress: 100, 
                result: result 
              } : f
            ));
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } catch (error) {
          console.error(`Upload error for file ${fileItem.file.name}:`, error);
          
          // Handle specific error types
          let errorMessage = 'Upload failed';
          if (error.response?.status === 413) {
            errorMessage = 'File too large or insufficient storage quota';
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          // Mark this file as error
          setFiles(prev => prev.map((f, index) => 
            index === i ? { 
              ...f, 
              status: 'error', 
              error: errorMessage 
            } : f
          ));
          
          uploadResults.push({
            success: false,
            originalName: fileItem.file.name,
            error: errorMessage
          });
        }
      }

      const successCount = uploadResults.filter(r => r.success).length;
      const failCount = uploadResults.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} file(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`);
        onUploadComplete();
      }

      if (failCount > 0 && successCount === 0) {
        toast.error('All uploads failed');
      }

      // Clear successful uploads after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status === 'error'));
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      
      // Mark all files as error
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      })));
    } finally {
      setIsUploading(false);
    }
  };

  // Get quota info for display
  const quotaInfo = getQuotaInfo();
  const totalFilesSize = files.reduce((sum, f) => sum + f.file.size, 0);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <LoadingSpinner />;
      case 'success':
        return <FiCheck />;
      case 'error':
        return <FiX />;
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
        <UploadIcon isDragActive={isDragActive} />
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
              <p>or <span className="highlight">click to browse</span></p>
              <small>Maximum 10MB per file • 20 files max</small>
            </div>
          )}
        </UploadText>
      </DropzoneContainer>

      {/* Quota Warning */}
      {wouldExceedQuota && files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
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
        </motion.div>
      )}

      {/* Quota Display */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(248, 250, 252, 0.8)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            borderRadius: theme.borderRadius.lg,
            fontSize: '0.875rem',
            color: theme.colors.gray[600]
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Upload Size: <strong>{formatFileSize(totalFilesSize)}</strong></span>
            <span>Available: <strong>{formatFileSize(quotaInfo.remainingQuota)}</strong></span>
          </div>
          <div style={{ 
            height: '4px', 
            background: theme.colors.gray[200], 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min((totalFilesSize / quotaInfo.remainingQuota) * 100, 100)}%`,
                background: wouldExceedQuota ? theme.colors.danger : theme.colors.success,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <FileList>
            {files.map((fileItem, index) => (
              <motion.div
                key={`${fileItem.file.name}-${index}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FileItem>
                  <FileInfo>
                    <FileIcon>
                      <FiFile />
                    </FileIcon>
                    <FileDetails>
                      <FileName>{fileItem.file.name}</FileName>
                      <FileSize>{formatFileSize(fileItem.file.size)}</FileSize>
                      <FileStatus status={fileItem.status}>
                        {getStatusIcon(fileItem.status)}
                        {getStatusText(fileItem.status, fileItem.error, fileItem.progress)}
                      </FileStatus>
                    </FileDetails>
                  </FileInfo>
                  
                  {fileItem.status === 'uploading' && (
                    <ProgressBar progress={fileItem.progress}>
                      <div className="progress" />
                    </ProgressBar>
                  )}
                  
                  <RemoveButton
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <FiX />
                  </RemoveButton>
                </FileItem>
              </motion.div>
            ))}
          </FileList>
        )}
      </AnimatePresence>

      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: theme.spacing.lg }}
        >
          <UploadButton
            onClick={uploadFiles}
            disabled={isUploading || files.length === 0 || wouldExceedQuota}
          >
            {isUploading ? (
              <>
                <LoadingSpinner />
                Uploading...
              </>
            ) : (
              <>
                <FiUploadCloud />
                Upload {files.length} file{files.length !== 1 ? 's' : ''}
              </>
            )}
          </UploadButton>
        </motion.div>
      )}
    </div>
  );
}; 