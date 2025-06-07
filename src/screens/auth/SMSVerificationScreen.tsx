import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
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

interface SMSVerificationScreenProps {
  navigation: any;
  route: any;
}

const SMSVerificationScreen: React.FC<SMSVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { verifySMS, resendSMS } = useAuth();
  const { phoneNumber, isLogin } = route.params;
  
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRef = useRef<any>(null);

  useEffect(() => {
    // Sayaç başlat
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    // Ekran açıldığında input'a focus yap
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  const handleVerify = async () => {
    setError('');
    
    if (verificationCode.length !== 6) {
      setError('Doğrulama kodu 6 haneli olmalıdır');
      return;
    }

    try {
      setLoading(true);
      await verifySMS(phoneNumber, verificationCode);
      
      // Başarılı doğrulama sonrası ana ekrana yönlendir
      // Navigation reset yaparak geri butonunu kaldır
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error: any) {
      console.error('SMS verification error:', error);
      setError(
        error.response?.data?.message || 
        'Doğrulama kodu hatalı. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      await resendSMS(phoneNumber);
      
      // Sayaçı sıfırla
      setCountdown(60);
      setCanResend(false);
      setError('');
      
    } catch (error: any) {
      console.error('Resend SMS error:', error);
      setError(
        error.response?.data?.message || 
        'SMS gönderilirken hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Sadece rakamları al ve 6 karakterle sınırla
    const cleaned = text.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(cleaned);
    if (error) setError('');
    
    // 6 karakter girildiğinde otomatik doğrula
    if (cleaned.length === 6) {
      setTimeout(() => {
        handleVerify();
      }, 500);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    return `+90 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Title style={[styles.title, { color: theme.colors.primary }]}>
            Doğrulama Kodu
          </Title>
          <Paragraph style={styles.subtitle}>
            {formatPhoneNumber(phoneNumber)} numarasına gönderilen 6 haneli kodu girin
          </Paragraph>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                ref={inputRef}
                label=\"Doğrulama Kodu\"
                value={verificationCode}
                onChangeText={handleCodeChange}
                mode=\"outlined\"
                keyboardType=\"number-pad\"
                placeholder=\"000000\"
                maxLength={6}
                error={!!error}
                style={styles.input}
                autoFocus
              />
              <HelperText type=\"error\" visible={!!error}>
                {error}
              </HelperText>
              
              <Button
                mode=\"contained\"
                onPress={handleVerify}
                loading={loading}
                disabled={loading || verificationCode.length !== 6}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Doğrula
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.resendSection}>
            {!canResend ? (
              <Paragraph style={styles.countdownText}>
                Yeniden gönder ({countdown}s)
              </Paragraph>
            ) : (
              <Button
                mode=\"text\"
                onPress={handleResend}
                loading={resendLoading}
                disabled={resendLoading}
              >
                Kodu Yeniden Gönder
              </Button>
            )}
          </View>

          <View style={styles.backSection}>
            <Button
              mode=\"text\"
              onPress={() => navigation.goBack()}
              disabled={loading || resendLoading}
            >
              Telefon Numarasını Değiştir
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
    lineHeight: 24,
  },
  card: {
    marginBottom: 24,
    elevation: 4,
  },
  input: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    height: 48,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownText: {
    color: '#666',
    fontSize: 14,
  },
  backSection: {
    alignItems: 'center',
  },
});

export default SMSVerificationScreen;