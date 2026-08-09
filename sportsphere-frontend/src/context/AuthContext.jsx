import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session by checking with the backend
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (err) {
        // If 401 or network error, user is not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for custom logout events dispatched by Axios interceptor
    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const login = async (credentials) => {
    try {
      // The backend returns tokens AND sets HttpOnly cookies
      await authApi.login(credentials);

      // After successful login, fetch the user profile
      const userData = await authApi.getCurrentUser();
      setUser(userData);

      return userData;
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      return await authApi.register(userData);
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Call backend to clear HttpOnly cookies
      await authApi.logout();
    } catch (err) {
      console.error('Logout failed on backend:', err);
    } finally {
      // Clear frontend state regardless
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
