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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface SMSVerificationScreenProps {
  navigation: any;
  route: any;
}

const SMSVerificationScreen: React.FC<SMSVerificationScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { verifySMS, resendSMS } = useAuth();
  const { phoneNumber, registrationData } = route.params;
  const insets = useSafeAreaInsets();

  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown]);

  useEffect(() => {
    const handle = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(handle);
  }, []);

  const handleVerify = async () => {
    setError('');

    if (verificationCode.length !== 6) {
      setError('Dogrulama kodu 6 haneli olmalidir');
      return;
    }

    try {
      setLoading(true);
      await verifySMS({
        phoneNumber,
        verificationCode,
        name: registrationData?.name,
        surname: registrationData?.surname,
        classId: registrationData?.classId,
        gender: registrationData?.gender,
      });
    } catch (err: any) {
      console.error('SMS verification error:', err);
      setError(err?.response?.data?.message || 'Dogrulama kodu hatali. Lutfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      await resendSMS(phoneNumber);
      setCountdown(60);
      setCanResend(false);
      setError('');
      setVerificationCode('');
    } catch (err: any) {
      console.error('Resend SMS error:', err);
      setError(err?.response?.data?.message || 'Kod gonderilirken hata olustu. Lutfen tekrar deneyin.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(cleaned);
    if (error) setError('');

    if (cleaned.length === 6) {
      setTimeout(() => {
        handleVerify();
      }, 300);
    }
  };

  const formatPhoneNumber = (phone: string) => `+90 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Title style={[styles.title, { color: theme.colors.primary }]}>Dogrulama Kodu</Title>
          <Paragraph style={styles.subtitle}>
            {formatPhoneNumber(phoneNumber)} numarasina gonderilen 6 haneli kodu girin.
          </Paragraph>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                ref={inputRef}
                label="Dogrulama Kodu"
                value={verificationCode}
                onChangeText={handleCodeChange}
                mode="outlined"
                keyboardType="number-pad"
                placeholder="000000"
                maxLength={6}
                error={Boolean(error)}
                style={styles.input}
              />
              <HelperText type="error" visible={Boolean(error)}>
                {error}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleVerify}
                loading={loading}
                disabled={loading || verificationCode.length !== 6}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Dogrula
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.resendSection}>
            {!canResend ? (
              <Paragraph style={styles.countdownText}>Yeniden gonder ({countdown}s)</Paragraph>
            ) : (
              <Button mode="text" onPress={handleResend} loading={resendLoading} disabled={resendLoading}>
                Kodu Yeniden Gonder
              </Button>
            )}
          </View>

          <View style={styles.backSection}>
            <Button mode="text" onPress={() => navigation.goBack()} disabled={loading || resendLoading}>
              Telefon Numarasini Degistir
            </Button>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex: {
    flex: 1,
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
