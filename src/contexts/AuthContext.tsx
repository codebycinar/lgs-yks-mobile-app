import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types/auth';
import authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string) => Promise<void>;
  register: (data: {
    phoneNumber: string;
    name: string;
    surname: string;
    classId: number;
    gender: 'male' | 'female';
  }) => Promise<void>;
  verifySMS: (phoneNumber: string, code: string) => Promise<void>;
  resendSMS: (phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth durumu kontrol edilirken hata:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phoneNumber: string) => {
    try {
      await authService.login({ phoneNumber });
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  };

  const register = async (data: {
    phoneNumber: string;
    name: string;
    surname: string;
    classId: number;
    gender: 'male' | 'female';
  }) => {
    try {
      await authService.register(data);
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  };

  const verifySMS = async (phoneNumber: string, code: string) => {
    try {
      const authData = await authService.verifySMS({
        phoneNumber,
        verificationCode: code,
      });
      
      setUser(authData.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('SMS doğrulama hatası:', error);
      throw error;
    }
  };

  const resendSMS = async (phoneNumber: string) => {
    try {
      await authService.resendSMS(phoneNumber);
    } catch (error) {
      console.error('SMS tekrar gönderme hatası:', error);
      throw error;
    }
  };

  const updateProfile = async () => {
    try {
      const updatedUser = await authService.updateProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    verifySMS,
    resendSMS,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook AuthProvider içinde kullanılmalı');
  }
  return context;
};