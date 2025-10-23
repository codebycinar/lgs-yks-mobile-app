import React, { useState } from 'react';
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

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');

    let formatted = cleaned.startsWith('90') ? cleaned.slice(2) : cleaned;
    formatted = formatted.startsWith('0') ? formatted.slice(1) : formatted;

    if (formatted.length <= 10 && (formatted.startsWith('5') || formatted === '')) {
      return formatted;
    }

    return phoneNumber.replace(/\D/g, '');
  };

  const validatePhoneNumber = (phone: string) => /^5[0-9]{9}$/.test(phone);

  const handleLogin = async () => {
    setError('');

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Gecerli bir telefon numarasi girin (5xxxxxxxxx)');
      return;
    }

    try {
      setLoading(true);
      await login(phoneNumber);
      navigation.navigate('SMSVerification', {
        phoneNumber,
        isLogin: true,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.response?.data?.message || 'Giris yapilirken bir hata olustu. Lutfen tekrar deneyin.');
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
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Title style={[styles.title, { color: theme.colors.primary }]}>LGS Egitim Platformu</Title>
          <Paragraph style={styles.subtitle}>Telefon numaraniz ile giris yapin</Paragraph>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Telefon Numarasi"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                mode="outlined"
                keyboardType="phone-pad"
                placeholder="5xxxxxxxxx"
                maxLength={10}
                left={<TextInput.Affix text="+90 " />}
                error={Boolean(error)}
                style={styles.input}
              />
              <HelperText type="error" visible={Boolean(error)}>
                {error}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading || phoneNumber.length !== 10}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Giris Yap
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.registerSection}>
            <Paragraph style={styles.registerText}>Hesabiniz yok mu?</Paragraph>
            <Button mode="text" onPress={() => navigation.navigate('Register')} disabled={loading}>
              Kayit Ol
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
