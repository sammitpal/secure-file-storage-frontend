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
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simple logout function
  const handleLogout = async (showToast = true) => {
    try {
      await authApi.logout();
      if (showToast) {
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Always clear state regardless of API call success
    authApi.clearAuthTokens();
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  // Initialize auth state on app load - run only once
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 AuthContext: Starting initialization...');
      
      try {
        const token = authApi.getAuthToken();
        const savedUser = authApi.getCurrentUser();
        
        console.log('🔍 AuthContext: Token check:', {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
          hasSavedUser: !!savedUser,
          savedUserUsername: savedUser ? savedUser.username : 'none'
        });
        
        if (token && savedUser) {
          console.log('✅ AuthContext: Found both token and user, verifying with server...');
          
          try {
            console.log('🌐 AuthContext: Making profile API call...');
            const response = await authApi.getProfile();
            
            console.log('📡 AuthContext: Profile API response:', {
              success: response?.success,
              hasData: !!response?.data,
              hasUser: !!response?.data?.user,
              username: response?.data?.user?.username,
              fullResponse: response
            });
            
            if (response && response.success && response.data && response.data.user) {
              console.log('✅ AuthContext: Profile verification successful - setting authenticated state');
              setUser(response.data.user);
              setIsAuthenticated(true);
              console.log('✅ AuthContext: User state set, authentication complete');
            } else {
              console.log('❌ AuthContext: Profile verification failed - invalid response structure');
              console.log('❌ AuthContext: Response details:', JSON.stringify(response, null, 2));
              authApi.clearAuthTokens();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error('❌ AuthContext: Profile API call failed:', error);
            console.error('❌ AuthContext: Error details:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data
            });
            
            // Don't clear tokens on network errors, might be temporary
            if (error.response?.status === 401) {
              console.log('❌ AuthContext: 401 error - clearing tokens');
              authApi.clearAuthTokens();
            }
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('❌ AuthContext: Missing token or user data:', {
            hasToken: !!token,
            hasSavedUser: !!savedUser
          });
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ AuthContext: Initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
      
      console.log('🏁 AuthContext: Initialization complete, setting loading to false');
      setLoading(false);
    };

    initializeAuth();
  }, []); // Empty dependency array - run only once

  const handleLogin = async (credentials) => {
    try {
      console.log('🔄 AuthContext: Starting login process...');
      setLoading(true);
      const response = await authApi.login(credentials);
      
      console.log('📡 AuthContext: Login API response:', {
        success: response.success,
        hasData: !!response.data,
        hasUser: !!response.data?.user,
        username: response.data?.user?.username,
        fullResponse: response
      });
      
      if (response.success) {
        console.log('✅ AuthContext: Login successful, setting user state...');
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ AuthContext: State updated - isAuthenticated: true');
        toast.success('Login successful! Welcome back.');
        return { success: true, user: response.data.user };
      } else {
        console.log('❌ AuthContext: Login failed:', response.message);
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
      console.log('🏁 AuthContext: Login process complete, setting loading to false');
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
      
      console.log('AuthContext: Refreshing user data...');
      const response = await authApi.getProfile();
      if (response.success) {
        console.log('AuthContext: User data refreshed successfully');
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