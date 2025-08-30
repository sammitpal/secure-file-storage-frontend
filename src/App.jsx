import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { fileApi } from './services/api';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import Breadcrumb from './components/Breadcrumb';
import FolderCreate from './components/FolderCreate';
import ErrorBoundary from './components/ErrorBoundary';
import { GlobalStyles } from './styles/GlobalStyles';

// Modern styled components with glassmorphism
const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  position: relative;
  overflow-x: hidden;
`;

const BackgroundPattern = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.03;
  background-image: 
    radial-gradient(circle at 25% 25%, var(--primary) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, var(--secondary) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
`;

const MainLayout = styled.div`
  position: relative;
  z-index: 1;
  padding-top: 80px;
  min-height: 100vh;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  
  @media (max-width: 768px) {
    padding: var(--space-6) var(--space-4);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-8);
  align-items: start;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  min-height: 600px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  
  @media (max-width: 1024px) {
    order: -1;
  }
`;

const ModernCard = styled.div`
  background: ${props => props.theme?.colors?.surface || '#ffffff'}dd;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius-lg);
  box-shadow: ${props => props.theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
  padding: var(--space-8);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme?.shadows?.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.theme?.colors?.border || '#d1d5db'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
`;

const StatCard = styled.div`
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius-md);
  padding: var(--space-6);
  text-align: center;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme?.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.theme?.colors?.border || '#d1d5db'};
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-3);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const StatValue = styled.div`
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  margin-bottom: var(--space-1);
  letter-spacing: -0.025em;
`;

const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: ${props => props.theme?.colors?.textSecondary || '#6b7280'};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius);
  font-weight: 500;
  font-size: var(--font-size-sm);
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme?.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.theme?.colors?.border || '#d1d5db'};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: ${props => props.theme?.colors?.text || '#1a1a1a'};
  margin-bottom: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  
  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 2px;
  }
`;

const BreadcrumbContainer = styled.div`
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-6);
  margin-bottom: var(--space-6);
  box-shadow: ${props => props.theme?.shadows?.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
`;

const FileManagerApp = React.memo(() => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0, totalFolders: 0 });
  const [showFolderCreate, setShowFolderCreate] = useState(false);

  const currentFolderPath = useMemo(() => {
    const path = currentPath.length === 0 ? '' : currentPath.map(p => p.name).join('/');
    return path;
  }, [currentPath]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fileApi.listFiles(currentFolderPath);
      
      // Validate response structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch files');
      }
      
      // Validate response data structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid data structure in response');
      }
      
      // Set data with proper validation
      setFiles(Array.isArray(response.data.files) ? response.data.files : []);
      setFolders(Array.isArray(response.data.folders) ? response.data.folders : []);
      
      // Validate and set stats
      const stats = response.data.stats || {};
      setStats({
        totalFiles: typeof stats.totalFiles === 'number' ? stats.totalFiles : 0,
        totalFolders: typeof stats.totalFolders === 'number' ? stats.totalFolders : 0,
        totalSize: typeof stats.totalSize === 'number' ? stats.totalSize : 0
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Set empty state on error
      setFiles([]);
      setFolders([]);
      setStats({ totalFiles: 0, totalSize: 0, totalFolders: 0 });
      
      // Show user-friendly error message
      if (error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
        console.error('Network error - server might be down');
      } else if (error.response?.status === 401) {
        console.error('Authentication error - user might need to log in again');
      } else if (error.response?.status === 403) {
        console.error('Permission error - user might not have access');
      }
    } finally {
      setLoading(false);
    }
  }, [currentFolderPath]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploadSuccess = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleFolderCreated = useCallback(() => {
    setShowFolderCreate(false);
    fetchData();
  }, [fetchData]);

  const handleNavigate = useCallback((folderId, folderName) => {
    setCurrentPath(prev => {
      const newPath = [...prev, { id: folderId, name: folderName }];
      return newPath;
    });
  }, []);

  const handleBreadcrumbClick = useCallback((index) => {
    setCurrentPath(prev => {
      const newPath = prev.slice(0, index + 1);
      return newPath;
    });
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return (
    <AppContainer>
      <BackgroundPattern />
      <MainLayout>
        <Navbar />
        <Container>
          <ContentGrid>
            <MainContent>
              <BreadcrumbContainer>
                <Breadcrumb 
                  currentPath={currentPath} 
                  onNavigate={handleBreadcrumbClick} 
                />
              </BreadcrumbContainer>
              
              <ModernCard>
                <SectionTitle>📤 Upload Files</SectionTitle>
                <FileUpload 
                  key={currentFolderPath} // Force re-render when path changes
                  currentFolderPath={currentFolderPath}
                  onUploadSuccess={handleUploadSuccess}
                />
              </ModernCard>

              <ModernCard>
                <SectionTitle>📁 Files & Folders</SectionTitle>
                <FileList
                  files={files}
                  folders={folders}
                  loading={loading}
                  onNavigate={handleNavigate}
                  onRefresh={fetchData}
                />
              </ModernCard>
            </MainContent>

            <Sidebar>
              <ModernCard>
                <SectionTitle>📊 Quick Stats</SectionTitle>
                <StatsGrid>
                  <StatCard>
                    <StatIcon>📄</StatIcon>
                    <StatValue>{stats.totalFiles}</StatValue>
                    <StatLabel>Files</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatIcon>📁</StatIcon>
                    <StatValue>{stats.totalFolders}</StatValue>
                    <StatLabel>Folders</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatIcon>💾</StatIcon>
                    <StatValue>{formatFileSize(stats.totalSize)}</StatValue>
                    <StatLabel>Storage</StatLabel>
                  </StatCard>
                </StatsGrid>
              </ModernCard>

              <ModernCard>
                <SectionTitle>⚡ Quick Actions</SectionTitle>
                <ActionsGrid>
                  <ActionButton onClick={() => setShowFolderCreate(true)}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />
                    </svg>
                    New Folder
                  </ActionButton>
                  <ActionButton onClick={fetchData}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                    </svg>
                    Refresh
                  </ActionButton>
                </ActionsGrid>
              </ModernCard>
            </Sidebar>
          </ContentGrid>
        </Container>
      </MainLayout>

      {showFolderCreate && (
        <FolderCreate
          currentFolderPath={currentFolderPath}
          onClose={() => setShowFolderCreate(false)}
          onFolderCreated={handleFolderCreated}
        />
      )}
    </AppContainer>
  );
});

FileManagerApp.displayName = 'FileManagerApp';

function App() {
  const { theme, isDarkTheme } = useTheme();

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles />
      <ErrorBoundary>
        <FileManagerApp />
      </ErrorBoundary>
    </StyledThemeProvider>
  );
}

export default App; 