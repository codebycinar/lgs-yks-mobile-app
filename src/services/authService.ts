import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginRequest,
  RegisterRequest,
  VerifySMSRequest,
  AuthResponse,
  SMSResponse,
  User,
} from '../types/auth';

class AuthService {
  async login(data: LoginRequest): Promise<SMSResponse> {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  }

  async register(data: RegisterRequest): Promise<SMSResponse> {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  }

  async verifySMS(data: VerifySMSRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/verify-sms', data);
    const authData = response.data.data;

    await this.saveAuthData(authData.token, authData.user);

    return authData;
  }

  async resendSMS(phoneNumber: string): Promise<SMSResponse> {
    const response = await api.post('/auth/resend-sms', { phoneNumber });
    return response.data.data;
  }

  async saveAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Auth data kaydedilirken hata:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return Boolean(token);
    } catch (error) {
      console.error('Auth durumu kontrol edilirken hata:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('User data okunurken hata:', error);
      return null;
    }
  }

  async updateProfile(): Promise<User> {
    const response = await api.get('/users/me');
    const user = response.data.data;

    await AsyncStorage.setItem('user_data', JSON.stringify(user));

    return user;
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Logout hatasi:', error);
      throw error;
    }
  }
}

export default new AuthService();
