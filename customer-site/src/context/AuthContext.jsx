import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { getToken, setToken, removeToken, setRefreshToken, removeRefreshToken } from '../utils/tokenStorage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const loadUser = useCallback(async () => {
    const storedToken = getToken();
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const data = await authService.getProfile();
      setUser(data.user || data);
      setTokenState(storedToken);
    } catch {
      removeToken();
      removeRefreshToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const newToken = data.accessToken || data.token;
    const newRefresh = data.refreshToken;
    const userData = data.customer || data.user;
    setToken(newToken);
    if (newRefresh) setRefreshToken(newRefresh);
    setTokenState(newToken);
    setUser(userData);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    const newToken = data.accessToken || data.token;
    const newRefresh = data.refreshToken;
    const newUser = data.customer || data.user;
    if (newToken) {
      setToken(newToken);
      if (newRefresh) setRefreshToken(newRefresh);
      setTokenState(newToken);
      setUser(newUser);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors
    }
    removeToken();
    removeRefreshToken();
    setTokenState(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
