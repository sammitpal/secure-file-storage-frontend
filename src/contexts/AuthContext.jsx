import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  // Simple logout function
  const handleLogout = async (showToast = true) => {
    try {
      const result = await authApi.logout();
      if (showToast) {
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't show error toast for logout - it's not critical if the API call fails
      // The important thing is that we clear local state
      if (showToast) {
        toast.success('Logged out successfully');
      }
    }
    
    // Always clear state regardless of API call success
    authApi.clearAuthTokens();
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    setHasLoggedOut(true); // Set flag to true after explicit logout
  };

  // Initialize auth state on app load - run only once
  useEffect(() => {
    const initializeAuth = async () => {
      // Skip initialization if user has explicitly logged out
      if (hasLoggedOut) {
        setLoading(false);
        return;
      }
      
      try {
        const token = authApi.getAuthToken();
        const savedUser = authApi.getCurrentUser();
        
        if (token && savedUser) {
          try {
            const response = await authApi.getProfile();
            
            if (response && response.success && response.data && response.data.user) {
              setUser(response.data.user);
              setIsAuthenticated(true);
            } else {
              authApi.clearAuthTokens();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            // Don't clear tokens on network errors, might be temporary
            if (error.response?.status === 401) {
              authApi.clearAuthTokens();
            }
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []); // Empty dependency array - run only once

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success('Login successful! Welcome back.');
        return { success: true, user: response.data.user };
      } else {
        const error = response.message || 'Login failed';
        toast.error(error);
        return { success: false, error };
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      const response = await authApi.register(userData);
      
      if (response.success) {
        // Don't auto-login, just show success message and let them login manually
        toast.success('Registration successful! Please login to continue.');
        return { success: true, message: 'Registration successful! Please login to continue.' };
      } else {
        const error = response.message || 'Registration failed';
        toast.error(error);
        return { success: false, error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      if (!isAuthenticated) return null;
      
      const response = await authApi.getProfile();
      if (response.success) {
        const userData = response.data.user;
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Don't auto-logout on refresh error, just log it
    }
    return null;
  };

  const updateUserQuota = (sizeChange) => {
    if (user && user.storageStats) {
      const updatedUser = {
        ...user,
        storageStats: {
          ...user.storageStats,
          totalSize: Math.max(0, user.storageStats.totalSize + sizeChange),
          remainingQuota: Math.max(0, user.storageStats.remainingQuota - sizeChange),
          usagePercentage: Math.min(100, ((user.storageStats.totalSize + sizeChange) / user.storageQuota) * 100)
        }
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const hasQuotaSpace = (fileSize) => {
    if (!user || !user.storageStats) return false;
    return user.storageStats.remainingQuota >= fileSize;
  };

  const getQuotaInfo = () => {
    if (!user || !user.storageStats) {
      return {
        totalSize: 0,
        quota: 500 * 1024 * 1024, // 500MB default
        remainingQuota: 500 * 1024 * 1024,
        usagePercentage: 0,
        filesCount: 0
      };
    }
    return user.storageStats;
  };

  const contextValue = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Auth methods
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUserData,
    
    // Quota methods
    updateUserQuota,
    hasQuotaSpace,
    getQuotaInfo,
    
    // Utility methods
    isAdmin: user?.isAdmin || false,
    username: user?.username || '',
    email: user?.email || ''
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 