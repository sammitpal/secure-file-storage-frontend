import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiCopy, FiCheck, FiShare, FiClock, FiEye, FiDownload } from 'react-icons/fi';
import { fileApi } from '../services/api.js';
import { toast } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';

const ModalOverlay = styled.div`
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
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.colors.border};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text};
  }
`;

const FileInfo = styled.div`
  background: ${props => props.theme.colors.gray[50]};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FileName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const FileDetails = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ShareSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const ShareLinkContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ShareInput = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-family: monospace;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const CopyButton = styled.button`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ShareStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StatItem = styled.div`
  background: ${props => props.theme.colors.gray[50]};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.theme.colors.border};
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.danger}20;
  border: 1px solid ${props => props.theme.colors.danger};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.danger};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ShareModal = ({ isOpen, onClose, file }) => {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen && file) {
      createShare();
    }
  }, [isOpen, file]);

  const createShare = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🔍 ShareModal - file object:', file);
    
    try {
      // Try to get file ID from either id or _id field
      const fileId = file?.id || file?._id;
      console.log('🔍 ShareModal - extracted fileId:', fileId);
      
      if (!fileId) {
        throw new Error('File ID is missing from file object');
      }
      
      const response = await fileApi.shareFile(fileId, {
        expiresIn: 7, // 7 days default
        maxAccess: null // unlimited access
      });
      
      if (response.success) {
        setShareData(response.data);
      } else {
        setError(response.message || 'Failed to create share link');
      }
    } catch (err) {
      console.error('Share creation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareData?.shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy link');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()} theme={theme}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <FiShare />
            Share File
          </ModalTitle>
          <CloseButton onClick={onClose} theme={theme}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>

        {file && (
          <FileInfo theme={theme}>
            <FileName theme={theme}>{file.name}</FileName>
            <FileDetails theme={theme}>
              {file.size && `${(file.size / 1024 / 1024).toFixed(2)} MB`} • 
              {file.lastModified && ` Modified ${formatDate(file.lastModified)}`}
            </FileDetails>
          </FileInfo>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <LoadingSpinner theme={theme} />
            <span style={{ marginLeft: '1rem', color: theme.colors.text }}>Creating share link...</span>
          </div>
        )}

        {error && (
          <ErrorMessage theme={theme}>
            {error}
          </ErrorMessage>
        )}

        {shareData && (
          <>
            <ShareSection>
              <SectionTitle theme={theme}>Share Link</SectionTitle>
              <ShareLinkContainer>
                <ShareInput
                  type="text"
                  value={shareData.shareUrl}
                  readOnly
                  theme={theme}
                />
                <CopyButton onClick={copyToClipboard} theme={theme}>
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </CopyButton>
              </ShareLinkContainer>
            </ShareSection>

            <ShareStats theme={theme}>
              <StatItem theme={theme}>
                <StatValue theme={theme}>
                  <FiEye size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  {shareData.accessCount}
                </StatValue>
                <StatLabel theme={theme}>Views</StatLabel>
              </StatItem>
              
              <StatItem theme={theme}>
                <StatValue theme={theme}>
                  <FiClock size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  {Math.ceil((new Date(shareData.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))}
                </StatValue>
                <StatLabel theme={theme}>Days Left</StatLabel>
              </StatItem>
              
              <StatItem theme={theme}>
                <StatValue theme={theme}>
                  <FiDownload size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  {shareData.maxAccess || '∞'}
                </StatValue>
                <StatLabel theme={theme}>Max Downloads</StatLabel>
              </StatItem>
            </ShareStats>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default ShareModal; 