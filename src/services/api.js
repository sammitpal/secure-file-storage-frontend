import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://sw4vjjc110.execute-api.ap-south-1.amazonaws.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Initialize auth token from localStorage on app startup
let authToken = localStorage.getItem('authToken');

// Function to get current auth token (will be used by interceptors)
const getCurrentAuthToken = () => {
  return authToken || localStorage.getItem('authToken');
};

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = getCurrentAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if it's already a retry, or if it's the refresh token endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Make direct axios call to avoid interceptor recursion
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, 
            { refreshToken },
            { 
              timeout: 10000,
              headers: { 'Content-Type': 'application/json' }
            }
          );
          
          if (refreshResponse.data.success) {
            authApi.setAuthToken(refreshResponse.data.data.token);
            authApi.setRefreshToken(refreshResponse.data.data.refreshToken);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.token}`;
            return api(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          console.warn('Token refresh failed:', refreshError.message);
          // Refresh failed, clear tokens and let AuthContext handle the state
          authApi.clearAuthTokens();
        }
      } else {
        // No refresh token, clear tokens
        authApi.clearAuthTokens();
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth token management functions
export const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem('authToken', token);
};

export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
};

export const clearAuthTokens = () => {
  authToken = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
};

export const getAuthToken = () => {
  return authToken || localStorage.getItem('authToken');
};

// Authentication API
export const authApi = {
  // Token management methods
  getAuthToken: () => {
    return authToken || localStorage.getItem('authToken');
  },
  
  setAuthToken: (token) => {
    authToken = token;
    localStorage.setItem('authToken', token);
  },
  
  setRefreshToken: (token) => {
    localStorage.setItem('refreshToken', token);
  },
  
  clearAuthTokens: () => {
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  },
  
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // Register new user (no token expected)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Registration doesn't return tokens - user must login separately
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      authApi.setAuthToken(response.data.data.token);
      authApi.setRefreshToken(response.data.data.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Refresh JWT token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      authApi.clearAuthTokens();
      return response.data;
    } catch (error) {
      // If logout fails (e.g., token expired), still clear local tokens
      authApi.clearAuthTokens();
      
      // Return a success response since we've cleared local state
      return {
        success: true,
        message: 'Logged out successfully (local cleanup)'
      };
    }
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    if (response.data.success) {
      localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authApi.getAuthToken();
  }
};

// File API (updated to work with authentication)
export const fileApi = {
  // Upload files with progress
  uploadWithProgress: async (files, folderPath = '', onProgress = null) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (folderPath) {
      formData.append('folderPath', folderPath);
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for file uploads
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) {
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  // Upload single file (for FileUpload component)
  uploadFile: async (formData) => {
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for file uploads
    });
    return response.data;
  },

  // Upload single file
  upload: async (file, folderPath = '') => {
    const formData = new FormData();
    formData.append('files', file);
    
    if (folderPath) {
      formData.append('folderPath', folderPath);
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for file uploads
    });

    return response.data;
  },

  // List files (for App.jsx)
  listFiles: async (folderPath = '') => {
    const params = {};
    if (folderPath) {
      params.path = folderPath;
    }
    
    const response = await api.get('/files/list', { params });
    return response.data;
  },

  // List files (original)
  list: async (path = '', limit = 50, offset = 0) => {
    const response = await api.get('/files/list', {
      params: { path, limit, offset }
    });
    return response.data;
  },

  // Delete file (for FileList component)
  deleteFile: async (fileKey) => {
    const response = await api.delete(`/files/${encodeURIComponent(fileKey)}`);
    return response.data;
  },

  // Delete file (original)
  delete: async (key) => {
    const response = await api.delete(`/files/${encodeURIComponent(key)}`);
    return response.data;
  },

  // Delete folder (for FileList component)
  deleteFolder: async (folderPath) => {
    const response = await api.delete(`/folders/${encodeURIComponent(folderPath)}`);
    return response.data;
  },

  // Create folder (for FolderCreate component)
  createFolder: async (data) => {
    const response = await api.post('/folders/create', data);
    return response.data;
  },

  // Get file info
  getInfo: async (key) => {
    const response = await api.get(`/files/info/${encodeURIComponent(key)}`);
    return response.data;
  },

  // Get download URL
  getDownloadUrl: async (key) => {
    const response = await api.get(`/files/download/${encodeURIComponent(key)}`);
    return response.data;
  },

  // Share file
  shareFile: async (fileId, options = {}) => {
    const response = await api.post(`/files/share/${fileId}`, options);
    return response.data;
  },

  // Get user's shared files
  getShares: async () => {
    const response = await api.get('/files/shares');
    return response.data;
  },

  // Deactivate share
  deactivateShare: async (shareId) => {
    const response = await api.delete(`/files/share/${shareId}`);
    return response.data;
  }
};

// Folder API (updated to work with authentication)
export const folderApi = {
  // Create folder
  create: async (name, path = '') => {
    const response = await api.post('/folders/create', { name, path });
    return response.data;
  },

  // List folders
  list: async (path = '') => {
    const response = await api.get('/folders/list', {
      params: { path }
    });
    return response.data;
  },

  // Delete folder
  delete: async (folderPath) => {
    const response = await api.delete(`/folders/${encodeURIComponent(folderPath)}`);
    return response.data;
  },

  // Get folder info
  getInfo: async (folderPath) => {
    const response = await api.get(`/folders/info/${encodeURIComponent(folderPath)}`);
    return response.data;
  }
};

// Utility functions
export const downloadFile = async (filePath, filename) => {
  try {
    // Get download URL from backend
    const response = await fileApi.getDownloadUrl(filePath);
    
    if (!response.success || !response.data?.downloadUrl) {
      throw new Error(response.message || 'Failed to get download URL');
    }

    const { downloadUrl } = response.data;
    
    // Handle different types of download URLs
    if (downloadUrl.startsWith('mock://')) {
      throw new Error('File storage service is not properly configured. Please contact administrator.');
    }
    
    // For S3 presigned URLs or any valid HTTP(S) URL
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    // Temporarily add to DOM, click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return Promise.resolve();

  } catch (error) {
    console.error('Download failed:', error);
    
    // Handle specific error types
    let errorMessage = error.message || 'Download failed';
    
    if (error.response?.status === 503) {
      errorMessage = 'File download service is currently unavailable. Please contact administrator.';
    } else if (errorMessage.includes('S3 storage is not configured')) {
      errorMessage = 'File storage is not properly configured. Please contact administrator.';
    } else if (errorMessage.includes('File not found in storage')) {
      errorMessage = 'File not found in storage. It may have been deleted or moved.';
    } else if (errorMessage.includes('Access denied to file storage')) {
      errorMessage = 'Storage access error. Please contact administrator.';
    } else if (errorMessage.includes('Storage service error')) {
      errorMessage = 'Storage service error. Please try again or contact administrator.';
    }
    
    throw new Error(errorMessage);
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get file icon based on file extension
export const getFileIcon = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📈';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
      return '🖼️';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'mkv':
      return '🎥';
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return '🎵';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return '🗜️';
    case 'txt':
    case 'md':
      return '📄';
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return '⚛️';
    case 'html':
    case 'htm':
      return '🌐';
    case 'css':
    case 'scss':
    case 'sass':
      return '🎨';
    case 'json':
      return '📋';
    case 'xml':
      return '📰';
    case 'csv':
      return '📈';
    default:
      return '📄';
  }
};

// Public Share API (no authentication required)
export const shareApi = {
  // Access shared file by short code
  accessShare: async (shortCode) => {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/share/${shortCode}`);
    return response.data;
  },

  // Download shared file
  downloadShare: async (shortCode) => {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/share/${shortCode}/download`);
    return response.data;
  },

  // Verify password for protected share
  verifyPassword: async (shortCode, password) => {
    const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/share/${shortCode}/password`, {
      password
    });
    return response.data;
  }
};

export default api; 