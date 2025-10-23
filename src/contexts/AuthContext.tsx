import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, VerifySMSRequest } from '../types/auth';
import authService from '../services/authService';
import onboardingService, {
  OnboardingProfilePayload,
  OnboardingProfileResponse,
  AvailabilitySlotPayload,
} from '../services/onboardingService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;
  onboardingData: OnboardingProfileResponse | null;
  login: (phoneNumber: string) => Promise<void>;
  register: (data: {
    phoneNumber: string;
    name: string;
    surname: string;
    classId: string;
    gender: 'male' | 'female';
  }) => Promise<void>;
  verifySMS: (payload: VerifySMSRequest) => Promise<void>;
  resendSMS: (phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: () => Promise<User>;
  refreshOnboarding: () => Promise<void>;
  saveOnboarding: (
    profile: OnboardingProfilePayload,
    availability: AvailabilitySlotPayload[],
  ) => Promise<OnboardingProfileResponse>;
  startOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingProfileResponse | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const loadOnboardingProfile = async () => {
    try {
      const profile = await onboardingService.getProfile();
      setOnboardingData(profile);
      setIsOnboarded(Boolean(profile.profile));
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 404) {
        setOnboardingData(null);
        setIsOnboarded(false);
        return;
      }
      console.error('Onboarding bilgileri yuklenirken hata:', error);
      setOnboardingData(null);
      setIsOnboarded(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        await loadOnboardingProfile();
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setOnboardingData(null);
        setIsOnboarded(false);
      }
    } catch (error) {
      console.error('Auth durumu kontrol edilirken hata:', error);
      setUser(null);
      setIsAuthenticated(false);
      setOnboardingData(null);
      setIsOnboarded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phoneNumber: string) => {
    await authService.login({ phoneNumber });
  };

  const register = async (data: {
    phoneNumber: string;
    name: string;
    surname: string;
    classId: string;
    gender: 'male' | 'female';
  }) => {
    await authService.register(data);
  };

  const verifySMS = async (payload: VerifySMSRequest) => {
    const authData = await authService.verifySMS(payload);
    setUser(authData.user);
    setIsAuthenticated(true);
    await loadOnboardingProfile();
  };

  const resendSMS = async (phoneNumber: string) => {
    await authService.resendSMS(phoneNumber);
  };

  const updateProfile = async () => {
    const updatedUser = await authService.updateProfile();
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setOnboardingData(null);
    setIsOnboarded(false);
  };

  const refreshOnboarding = async () => {
    await loadOnboardingProfile();
  };

  const saveOnboarding = async (
    profile: OnboardingProfilePayload,
    availability: AvailabilitySlotPayload[],
  ): Promise<OnboardingProfileResponse> => {
    try {
      const response = await onboardingService.saveProfile(profile, availability, true);
      setOnboardingData(response);
      setIsOnboarded(true);
      return response;
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 404) {
        throw new Error('Onboarding API bulunamadi. Backend guncel olmadigindan kaydedilemedi.');
      }
      throw error;
    }
  };

  const startOnboarding = () => {
    setOnboardingData(null);
    setIsOnboarded(false);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isOnboarded,
    onboardingData,
    login,
    register,
    verifySMS,
    resendSMS,
    logout,
    updateProfile,
    refreshOnboarding,
    saveOnboarding,
    startOnboarding,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook AuthProvider icinde kullanilmali');
  }
  return context;
};
