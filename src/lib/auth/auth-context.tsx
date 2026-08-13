'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../../types/user';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCurrentUser();
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.error) {
      const errMsg = Array.isArray(res.error.message)
        ? res.error.message.join(', ')
        : res.error.message;
      return { success: false, error: errMsg };
    }
    if (res.data) {
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: 'Login failed' };
  };

  const register = async (email: string, password: string) => {
    const res = await authApi.register({ email, password });
    if (res.error) {
      const errMsg = Array.isArray(res.error.message)
        ? res.error.message.join(', ')
        : res.error.message;
      return { success: false, error: errMsg };
    }
    if (res.data) {
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: 'Registration failed' };
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
