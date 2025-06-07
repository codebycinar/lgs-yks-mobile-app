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
  // Telefon numarası ile giriş
  async login(data: LoginRequest): Promise<SMSResponse> {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  }

  // Kayıt olma
  async register(data: RegisterRequest): Promise<SMSResponse> {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  }

  // SMS kodunu doğrula
  async verifySMS(data: VerifySMSRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/verify-sms', data);
    const authData = response.data.data;
    
    // Token ve user bilgilerini kaydet
    await this.saveAuthData(authData.token, authData.user);
    
    return authData;
  }

  // SMS kodunu tekrar gönder
  async resendSMS(phoneNumber: string): Promise<SMSResponse> {
    const response = await api.post('/auth/resend-sms', { phoneNumber });
    return response.data.data;
  }

  // Token ve user bilgilerini kaydet
  async saveAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Auth data kaydedilirken hata:', error);
      throw error;
    }
  }

  // Kullanıcı giriş yapmış mı kontrol et
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch (error) {
      console.error('Auth durumu kontrol edilirken hata:', error);
      return false;
    }
  }

  // Mevcut kullanıcı bilgilerini al
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('User data alınırken hata:', error);
      return null;
    }
  }

  // Kullanıcı profil bilgilerini güncelle
  async updateProfile(): Promise<User> {
    const response = await api.get('/users/me');
    const user = response.data.data;
    
    // Güncel bilgileri kaydet
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    
    return user;
  }

  // Çıkış yap
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Logout hatası:', error);
      throw error;
    }
  }
}

export default new AuthService();