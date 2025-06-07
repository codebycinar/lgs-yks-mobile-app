import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  Card,
  HelperText,
  useTheme,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Telefon numarası formatla (Türkiye formatı)
  const formatPhoneNumber = (text: string) => {
    // Sadece rakamları al
    const cleaned = text.replace(/\D/g, '');
    
    // 90 ile başlıyorsa kaldır
    let formatted = cleaned.startsWith('90') ? cleaned.slice(2) : cleaned;
    
    // 0 ile başlıyorsa kaldır
    formatted = formatted.startsWith('0') ? formatted.slice(1) : formatted;
    
    // 5 ile başlamalı ve 10 karakter olmalı
    if (formatted.length <= 10 && (formatted.startsWith('5') || formatted === '')) {
      return formatted;
    }
    
    return phoneNumber.replace(/\D/g, '');
  };

  const validatePhoneNumber = (phone: string) => {
    // Türk telefon numarası: 5xxxxxxxxx (10 karakter)
    const phoneRegex = /^5[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleLogin = async () => {
    setError('');
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Geçerli bir telefon numarası girin (5xxxxxxxxx)');
      return;
    }

    try {
      setLoading(true);
      await login(phoneNumber);
      
      // SMS doğrulama ekranına yönlendir
      navigation.navigate('SMSVerification', {
        phoneNumber,
        isLogin: true,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    if (error) setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Title style={[styles.title, { color: theme.colors.primary }]}>
            LGS Eğitim Platformu
          </Title>
          <Paragraph style={styles.subtitle}>
            Telefon numaranız ile giriş yapın
          </Paragraph>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label=\"Telefon Numarası\"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                mode=\"outlined\"
                keyboardType=\"phone-pad\"
                placeholder=\"5xxxxxxxxx\"
                maxLength={10}
                left={<TextInput.Affix text=\"+90 \" />}
                error={!!error}
                style={styles.input}
              />
              <HelperText type=\"error\" visible={!!error}>
                {error}
              </HelperText>
              
              <Button
                mode=\"contained\"
                onPress={handleLogin}
                loading={loading}
                disabled={loading || phoneNumber.length !== 10}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Giriş Yap
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.registerSection}>
            <Paragraph style={styles.registerText}>
              Hesabınız yok mu?
            </Paragraph>
            <Button
              mode=\"text\"
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              Kayıt Ol
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  card: {
    marginBottom: 24,
    elevation: 4,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    height: 48,
  },
  registerSection: {
    alignItems: 'center',
  },
  registerText: {
    marginBottom: 8,
    color: '#666',
  },
});

export default LoginScreen;