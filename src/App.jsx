import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiPlus, FiUpload, FiHardDrive, FiCloud, FiFolder, FiShield, FiZap, FiLogOut } from 'react-icons/fi';

import { GlobalStyles, theme, Container, Button } from './styles/GlobalStyles.js';
import { FileUpload } from './components/FileUpload.jsx';
import { FileList } from './components/FileList.jsx';
import { Breadcrumb } from './components/Breadcrumb.jsx';
import { FolderCreate } from './components/FolderCreate.jsx';
import { Navbar } from './components/Navbar.jsx';
import AuthWrapper from './components/AuthWrapper.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { fileApi, formatFileSize } from './services/api.js';
import { toast } from 'react-toastify';

// Keyframes for advanced animations
const shimmerGlow = keyframes`
  0% { 
    background-position: -200% center;
  }
  100% { 
    background-position: 200% center;
  }
`;

const floatingGlow = keyframes`
  0%, 100% { 
    transform: translateY(0px) scale(1);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }
  50% { 
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
`;

const glowPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(26, 26, 26, 0.1), 0 0 40px rgba(26, 26, 26, 0.05);
  }
  50% { 
    box-shadow: 0 0 40px rgba(26, 26, 26, 0.2), 0 0 80px rgba(26, 26, 26, 0.1);
  }
`;

const progressFill = keyframes`
  0% { width: 0%; }
  100% { width: var(--progress-width); }
`;

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.light};
  padding-top: 80px; // Account for fixed navbar
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.lg};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing.xl};
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 350px;
    gap: ${theme.spacing.lg};
  }
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.lg};
  }
`;

const GlassPanel = styled(motion.div)`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    transform: rotate(-45deg);
    opacity: 0;
    transition: all 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
    border-color: ${theme.colors.primary};
    
    &::before {
      opacity: 1;
      animation: ${shimmerGlow} 1.5s ease-in-out;
    }
  }
`;

const MainPanel = styled(GlassPanel)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const SidePanel = styled(GlassPanel)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  height: fit-content;
  position: sticky;
  top: 100px;
`;

const UploadSection = styled.section`
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.lg};
  
  .icon {
    font-size: 1.5rem;
    color: ${theme.colors.primary};
    filter: drop-shadow(0 2px 4px rgba(26, 26, 26, 0.1));
    animation: ${floatingGlow} 4s ease-in-out infinite;
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const QuickStatCard = styled.div`
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
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
      rgba(255, 255, 255, 0.6),
      transparent
    );
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
    border-color: ${theme.colors.primary};
    
    &::before {
      left: 100%;
    }
  }
  
  .icon {
    font-size: 1.5rem;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.sm};
    filter: drop-shadow(0 2px 4px rgba(26, 26, 26, 0.1));
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${theme.colors.primary};
    margin-bottom: 0.25rem;
  }
  
  .label {
    font-size: 0.875rem;
    color: ${theme.colors.gray[600]};
    font-weight: 500;
  }
`;

const AccountStorageCard = styled(GlassPanel)`
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.03) 0%, rgba(255, 255, 255, 0.9) 100%);
  border: 2px solid rgba(26, 26, 26, 0.1);
  margin-bottom: ${theme.spacing.lg};
  animation: ${glowPulse} 4s ease-in-out infinite;
  
  &:hover {
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
    border-color: ${theme.colors.primary};
    animation: none;
  }
`;

const StorageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const StorageDisplay = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
`;

const StorageText = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  animation: ${shimmerGlow} 3s ease-in-out infinite;
  background-size: 200% 100%;
`;

const StorageSubtext = styled.div`
  color: ${theme.colors.gray[600]};
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: ${theme.spacing.lg};
`;

const StorageProgressBar = styled.div`
  height: 12px;
  background: rgba(226, 232, 240, 0.8);
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: ${props => props.percentage}%;
    height: 100%;
    background: linear-gradient(135deg, 
      ${theme.colors.success} 0%, 
      #16a34a 50%, 
      ${theme.colors.success} 100%
    );
    border-radius: ${theme.borderRadius.lg};
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    animation: ${progressFill} 1.5s ease-out;
    --progress-width: ${props => props.percentage}%;
    
    ${props => props.percentage > 80 && `
      background: linear-gradient(135deg, 
        #f59e0b 0%, 
        #d97706 50%, 
        #f59e0b 100%
      );
    `}
    
    ${props => props.percentage > 95 && `
      background: linear-gradient(135deg, 
        ${theme.colors.danger} 0%, 
        #dc2626 50%, 
        ${theme.colors.danger} 100%
      );
    `}
  }
`;

const StoragePercentage = styled.div`
  margin-top: ${theme.spacing.md};
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.primary};
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: ${theme.spacing.xxl};
  position: relative;
  
  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    color: ${theme.colors.primary};
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: ${theme.spacing.md};
    letter-spacing: -0.02em;
    text-shadow: 0 4px 12px rgba(26, 26, 26, 0.1);
    animation: ${shimmerGlow} 4s ease-in-out infinite;
    background-size: 200% 100%;
    
    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }
  
  p {
    color: ${theme.colors.gray[600]};
    font-size: 1.25rem;
    font-weight: 500;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const LogoutButton = styled(Button)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(220, 38, 38, 0.95);
    border-color: rgba(220, 38, 38, 0.5);
  }
`;

const WelcomeMessage = styled.div`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background: rgba(34, 197, 94, 0.9);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.lg};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(34, 197, 94, 0.3);
  font-weight: 600;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    position: relative;
    top: auto;
    left: auto;
    margin-bottom: ${theme.spacing.lg};
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid ${theme.colors.gray[300]};
  border-radius: 50%;
  border-top-color: ${theme.colors.primary};
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const FileManagerApp = () => {
  const { user, logout, getQuotaInfo, refreshUserData } = useAuth();
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadFiles = async (path = '') => {
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
  };

  const refreshFiles = async () => {
    try {
      setRefreshing(true);
      await loadFiles(currentPath);
      await refreshUserData(); // Refresh user quota data
      toast.success('Files refreshed successfully');
    } catch (error) {
      // Error handling is done in loadFiles
    } finally {
      setRefreshing(false);
    }
  };

  const handleNavigation = (path) => {
    setCurrentPath(path);
  };

  const handleFolderClick = (folderPath) => {
    setCurrentPath(folderPath);
  };

  const handleFolderCreated = () => {
    loadFiles(currentPath);
    refreshUserData(); // Refresh user quota data
  };

  const handleUploadComplete = () => {
    loadFiles(currentPath);
    refreshUserData(); // Refresh user quota data
  };

  const handleLogout = async () => {
    await logout();
  };

  // Load files when path changes
  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath]);

  // Calculate stats for current folder
  const fileCount = files.filter(item => item.type === 'file').length;
  const folderCount = files.filter(item => item.type === 'folder').length;
  const totalSize = files
    .filter(item => item.type === 'file')
    .reduce((sum, file) => sum + (file.size || 0), 0);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Get quota information
  const quotaInfo = getQuotaInfo();

  return (
    <>
      <GlobalStyles />
      
      {/* User Controls */}
      <WelcomeMessage>
        Welcome back, {user?.username}!
      </WelcomeMessage>
      
      <LogoutButton onClick={handleLogout} variant="danger">
        <FiLogOut />
        Logout
      </LogoutButton>
      
      {/* Navigation Bar */}
      <Navbar />
      
      <AppContainer>
        <Container>
          <MainContent>
            {/* Header */}
            <Header>
              <h1>
                <FiShield style={{ marginRight: '1rem', verticalAlign: 'middle' }} />
                Secure File Storage
              </h1>
              <p>Your personal cloud storage with advanced security and encryption</p>
            </Header>

            {/* Breadcrumb Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Breadcrumb
                currentPath={currentPath}
                onNavigate={handleNavigation}
              />
            </motion.div>

            {/* Main Content Grid */}
            <ContentGrid>
              {/* Main Panel */}
              <MainPanel
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
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

                {/* File List Section */}
                <motion.section
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <SectionTitle>
                    <FiFolder className="icon" />
                    {currentPath ? `Files in ${currentPath.split('/').pop()}` : 'All Files & Folders'}
                  </SectionTitle>
                  
                  {error ? (
                    <div style={{ 
                      padding: theme.spacing.xl, 
                      textAlign: 'center', 
                      color: theme.colors.danger 
                    }}>
                      {error}
                    </div>
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
                </motion.section>
              </MainPanel>

              {/* Side Panel */}
              <SidePanel
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {/* Account Storage Display */}
                <AccountStorageCard>
                  <StorageHeader>
                    <FiHardDrive style={{ fontSize: '1.5rem', color: theme.colors.primary }} />
                    <h3 style={{ 
                      margin: 0, 
                      color: theme.colors.primary, 
                      fontSize: '1.25rem', 
                      fontWeight: '700' 
                    }}>
                      Account Storage
                    </h3>
                  </StorageHeader>
                  
                  <StorageDisplay>
                    <StorageText>
                      {formatFileSize(quotaInfo.totalSize)}
                    </StorageText>
                    <StorageSubtext>
                      of {formatFileSize(quotaInfo.quota)} used
                    </StorageSubtext>
                    
                    <StorageProgressBar percentage={quotaInfo.usagePercentage} />
                    
                    <StoragePercentage>
                      {quotaInfo.usagePercentage.toFixed(1)}% Full
                    </StoragePercentage>
                  </StorageDisplay>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: theme.spacing.md,
                    fontSize: '0.875rem',
                    color: theme.colors.gray[600]
                  }}>
                    <div>
                      <strong>{quotaInfo.filesCount}</strong> Files
                    </div>
                    <div>
                      <strong>{formatFileSize(quotaInfo.remainingQuota)}</strong> Free
                    </div>
                  </div>
                </AccountStorageCard>

                <SectionTitle>
                  <FiZap className="icon" />
                  Quick Stats
                </SectionTitle>
                
                <QuickStats>
                  <QuickStatCard>
                    <div className="icon">
                      <FiHardDrive />
                    </div>
                    <div className="value">{fileCount}</div>
                    <div className="label">Files</div>
                  </QuickStatCard>
                  
                  <QuickStatCard>
                    <div className="icon">
                      <FiFolder />
                    </div>
                    <div className="value">{folderCount}</div>
                    <div className="label">Folders</div>
                  </QuickStatCard>
                  
                  <QuickStatCard>
                    <div className="icon">
                      <FiFolder />
                    </div>
                    <div className="value">{formatSize(totalSize)}</div>
                    <div className="label">{currentPath ? 'Current Folder' : 'Root Folder'}</div>
                  </QuickStatCard>
                  
                  <QuickStatCard>
                    <div className="icon">
                      <FiShield />
                    </div>
                    <div className="value">256-bit</div>
                    <div className="label">Encryption</div>
                  </QuickStatCard>
                </QuickStats>

                <SectionTitle>
                  <FiUpload className="icon" />
                  Quick Actions
                </SectionTitle>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setIsCreateFolderOpen(true)}
                  >
                    <FiPlus size={16} />
                    New Folder
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={refreshFiles}
                    disabled={refreshing}
                  >
                    {refreshing ? <LoadingSpinner /> : <FiRefreshCw size={16} />}
                    Refresh Files
                  </Button>
                </div>
              </SidePanel>
            </ContentGrid>
          </MainContent>
        </Container>

        {/* Create Folder Modal */}
        <FolderCreate
          isOpen={isCreateFolderOpen}
          currentPath={currentPath}
          onClose={() => setIsCreateFolderOpen(false)}
          onFolderCreated={handleFolderCreated}
        />

        {/* Toast Notifications */}
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.lg,
          }}
        />
      </AppContainer>
    </>
  );
};

const App = () => {
  return (
    <AuthWrapper>
      <FileManagerApp />
    </AuthWrapper>
  );
};

export default App; 