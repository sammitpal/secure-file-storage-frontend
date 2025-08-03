import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiRefreshCw, FiPlus, FiUpload, FiHardDrive, FiCloud, FiFolder, FiShield, FiZap, FiSettings, FiFile, FiLock } from 'react-icons/fi';

import { GlobalStyles, Container, Button } from './styles/GlobalStyles.js';
import { FileUpload } from './components/FileUpload.jsx';
import { FileList } from './components/FileList.jsx';
import { Breadcrumb } from './components/Breadcrumb.jsx';
import { FolderCreate } from './components/FolderCreate.jsx';
import { Navbar } from './components/Navbar.jsx';
import AuthWrapper from './components/AuthWrapper.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { fileApi, formatFileSize } from './services/api.js';
import { toast } from 'react-toastify';

// Simple spinner animation only
const spin = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Simplified styled components without heavy animations
const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  padding-top: 80px;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: ${props => props.theme.spacing.xl};
  min-height: 500px;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const MainPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
  min-width: 300px;
  min-height: 500px;
`;

const MiddlePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.md};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  p {
    font-size: 1.125rem;
    color: ${props => props.theme.colors.textSecondary};
    max-width: 600px;
    margin: 0 auto;
  }
`;

const GlassPanel = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border};
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-row: 1;
  }
`;

const UploadSection = styled.section`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.md};
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  .icon {
    color: ${props => props.theme.colors.primary};
  }
`;

const QuickStats = styled(GlassPanel)`
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.md};
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const StatGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.md};
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.gray[100]};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: ${props => props.theme.spacing.sm};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .stat-left {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
  }
  
  .stat-icon {
    width: 20px;
    height: 20px;
    color: ${props => props.theme.colors.primary};
    flex-shrink: 0;
  }
  
  .label {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .value {
    font-weight: 700;
    color: ${props => props.theme.colors.text};
    font-size: 0.875rem;
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    background: ${props => props.theme.colors.gray[200]};
    border-radius: ${props => props.theme.borderRadius.sm};
    min-width: 40px;
    text-align: center;
  }
`;

const StorageCard = styled(GlassPanel)`
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.md};
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const StorageBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StorageFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${props => props.theme.colors.success}, ${props => props.theme.colors.primary});
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const StorageText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  
  .percentage {
    font-weight: 600;
    color: ${props => props.theme.colors.primary};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background: ${props => props.theme.colors.primary};
  color: white;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: #4b5563;
  color: white;
  
  &:hover {
    background: #374151;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    background: #6b7280;
    opacity: 0.6;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid ${props => props.theme.colors.gray[300]};
  border-radius: 50%;
  border-top-color: ${props => props.theme.colors.primary};
  animation: spin 1s ease-in-out infinite;
  
  ${spin}
`;

const FileListSection = styled.section`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.md};
`;

const BreadcrumbSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const ErrorMessage = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.danger};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.danger}20;
`;

const FileManagerApp = () => {
  const { user, logout, getQuotaInfo, refreshUserData } = useAuth();
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadFiles = useCallback(async (path = '') => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fileApi.list(path);
      
      if (response.success && response.data) {
        setFiles(response.data.items);
      } else {
        throw new Error(response.message || 'Failed to load files');
      }
    } catch (error) {
      console.error('Load files error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load files';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshFiles = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadFiles(currentPath);
      await refreshUserData();
      toast.success('Files refreshed successfully');
    } catch (error) {
      // Error handling is done in loadFiles
    } finally {
      setRefreshing(false);
    }
  }, [currentPath, loadFiles, refreshUserData]);

  const handleNavigation = useCallback((path) => {
    setCurrentPath(path);
  }, []);

  const handleFolderClick = useCallback((folderPath) => {
    setCurrentPath(folderPath);
  }, []);

  const handleFolderCreated = useCallback(() => {
    loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  const handleUploadComplete = useCallback(() => {
    loadFiles(currentPath);
    refreshUserData();
  }, [currentPath, loadFiles, refreshUserData]);

  // Load files when path changes
  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  // Memoized calculations
  const stats = useMemo(() => {
    const fileCount = files.filter(item => item.type === 'file').length;
    const folderCount = files.filter(item => item.type === 'folder').length;
    const totalSize = files
      .filter(item => item.type === 'file')
      .reduce((sum, file) => sum + (file.size || 0), 0);

    return { fileCount, folderCount, totalSize };
  }, [files]);

  const formatSize = useCallback((bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  // Get quota information
  const quotaInfo = getQuotaInfo();

  return (
    <>
      {/* Navigation Bar */}
      <Navbar />
      
      <AppContainer>
        <Container>
          {/* Header */}
          <Header>
            <h1>
              <FiShield style={{ marginRight: '1rem', verticalAlign: 'middle' }} />
              Secure File Storage
            </h1>
            <p>Your personal cloud storage with advanced security and encryption</p>
          </Header>

          <MainContent>
            {/* Main Panel - Primary content */}
            <MiddlePanel>
              {/* File Upload Section */}
              <UploadSection>
                <SectionTitle>
                  <FiUpload className="icon" />
                  Upload Files
                </SectionTitle>
                <FileUpload
                  currentPath={currentPath}
                  onUploadComplete={handleUploadComplete}
                />
              </UploadSection>

              {/* Breadcrumb Navigation */}
              <BreadcrumbSection>
                <Breadcrumb
                  currentPath={currentPath}
                  onNavigate={handleNavigation}
                />
              </BreadcrumbSection>

              {/* File List Section */}
              <FileListSection>
                <SectionTitle>
                  <FiFolder className="icon" />
                  {currentPath ? `Files in ${currentPath.split('/').pop()}` : 'All Files & Folders'}
                </SectionTitle>
                
                {error ? (
                  <ErrorMessage>
                    {error}
                  </ErrorMessage>
                ) : (
                  <FileList
                    files={files}
                    loading={loading}
                    currentPath={currentPath}
                    onFolderClick={handleFolderClick}
                    onFileDeleted={() => {
                      loadFiles(currentPath);
                      refreshUserData();
                    }}
                  />
                )}
              </FileListSection>
            </MiddlePanel>

            {/* Right Panel - Stats and Actions */}
            <SidePanel>
              {/* Account Storage Display */}
              <StorageCard>
                <h3>
                  <FiHardDrive style={{ fontSize: '1.5rem', color: props => props.theme.colors.primary }} />
                  Account Storage
                </h3>
                
                <StorageText>
                  <span>{formatFileSize(quotaInfo.totalSize)}</span>
                  <span className="percentage">
                    {quotaInfo.usagePercentage.toFixed(1)}% Full
                  </span>
                </StorageText>
                
                <StorageBar>
                  <StorageFill percentage={quotaInfo.usagePercentage} />
                </StorageBar>
                
                <StatGrid>
                  <StatItem>
                    <span className="label">Files</span>
                    <span className="value">{quotaInfo.filesCount}</span>
                  </StatItem>
                  <StatItem>
                    <span className="label">Free</span>
                    <span className="value">{formatFileSize(quotaInfo.remainingQuota)}</span>
                  </StatItem>
                </StatGrid>
              </StorageCard>

              <SectionTitle>
                <FiZap className="icon" />
                Quick Stats
              </SectionTitle>
              
              <QuickStats>
                <StatGrid>
                  <StatItem>
                    <div className="stat-left">
                      <FiFile className="stat-icon" />
                      <span className="label">Files</span>
                    </div>
                    <span className="value">{stats.fileCount}</span>
                  </StatItem>
                  <StatItem>
                    <div className="stat-left">
                      <FiFolder className="stat-icon" />
                      <span className="label">Folders</span>
                    </div>
                    <span className="value">{stats.folderCount}</span>
                  </StatItem>
                  <StatItem>
                    <div className="stat-left">
                      <FiHardDrive className="stat-icon" />
                      <span className="label">Current Folder</span>
                    </div>
                    <span className="value">{formatSize(stats.totalSize)}</span>
                  </StatItem>
                  <StatItem>
                    <div className="stat-left">
                      <FiLock className="stat-icon" />
                      <span className="label">Encryption</span>
                    </div>
                    <span className="value">256-bit</span>
                  </StatItem>
                </StatGrid>
              </QuickStats>

              <SectionTitle>
                <FiSettings className="icon" />
                Actions
              </SectionTitle>
              
              <ActionButtons>
                <PrimaryButton 
                  onClick={() => {
                    setIsCreateFolderOpen(true);
                  }}
                  type="button"
                >
                  <FiPlus />
                  Create Folder
                </PrimaryButton>
                
                <SecondaryButton 
                  onClick={() => {
                    refreshFiles();
                  }}
                  disabled={refreshing}
                  type="button"
                >
                  {refreshing ? <LoadingSpinner /> : <FiRefreshCw />}
                  Refresh
                </SecondaryButton>
              </ActionButtons>
            </SidePanel>
          </MainContent>
        </Container>
      </AppContainer>

      {/* Create Folder Modal */}
      {isCreateFolderOpen && (
        <FolderCreate
          currentPath={currentPath}
          onClose={() => setIsCreateFolderOpen(false)}
          onFolderCreated={() => {
            setIsCreateFolderOpen(false);
            loadFiles(currentPath);
          }}
        />
      )}

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

const MemorizedFileManagerApp = React.memo(FileManagerApp);

const App = () => {
  return (
    <>
      <GlobalStyles />
      <AuthWrapper>
        <MemorizedFileManagerApp />
      </AuthWrapper>
    </>
  );
};

export default App; 