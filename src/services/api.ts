import axios, { AxiosHeaders } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const resolveBaseUrl = (): string => {
  const extra = Constants.expoConfig?.extra ?? {};
  const explicit = extra.apiUrl ?? process.env.EXPO_PUBLIC_API_URL;
  if (explicit && typeof explicit === 'string' && explicit.trim().length > 0) {
    return explicit.trim();
  }
  return 'http://10.0.2.2:3000/api';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const headers = config.headers ?? new AxiosHeaders();
        if (headers instanceof AxiosHeaders) {
          headers.set('Authorization', `Bearer ${token}`);
        } else {
          (headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
        config.headers = headers;
      }
    } catch (error) {
      console.error('Token okunurken hata:', error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }

    if (error.message === 'Network Error') {
      console.warn(
        'API baglantisi saglanamadi. Expo uygulamasindan istek atiyorsan, app.json extra.apiUrl degerinin makineni isaret ettiginden emin ol.',
      );
    }

    return Promise.reject(error);
  },
);

export default api;
