import React, { useState, useEffect } from 'react';
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
  RadioButton,
  Divider,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContext';
import contentService from '../../services/contentService';
import { Class } from '../../types/content';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { register } = useAuth();
  const insets = useSafeAreaInsets();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [classId, setClassId] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const classesData = await contentService.getClasses();
      setClasses(classesData.filter((item) => item.isActive));
    } catch (error) {
      console.error('Siniflar yuklenirken hata:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned.startsWith('90') ? cleaned.slice(2) : cleaned;
    formatted = formatted.startsWith('0') ? formatted.slice(1) : formatted;

    if (formatted.length <= 10 && (formatted.startsWith('5') || formatted === '')) {
      return formatted;
    }

    return phoneNumber.replace(/\D/g, '');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Telefon numarasi gerekli';
    } else if (!/^5[0-9]{9}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Gecerli bir telefon numarasi girin';
    }

    if (!name.trim()) {
      newErrors.name = 'Ad gerekli';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Ad en az 2 karakter olmali';
    }

    if (!surname.trim()) {
      newErrors.surname = 'Soyad gerekli';
    } else if (surname.trim().length < 2) {
      newErrors.surname = 'Soyad en az 2 karakter olmali';
    }

    if (!classId) {
      newErrors.classId = 'Sinif secimi gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await register({
        phoneNumber,
        name: name.trim(),
        surname: surname.trim(),
        classId,
        gender,
      });

      navigation.navigate('SMSVerification', {
        phoneNumber,
        isLogin: false,
        registrationData: {
          name: name.trim(),
          surname: surname.trim(),
          classId,
          gender,
        },
      });
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage =
        error?.response?.data?.message || 'Kayit olurken bir hata olustu. Lutfen tekrar deneyin.';

      if (errorMessage.toLowerCase().includes('phone') || errorMessage.toLowerCase().includes('telefon')) {
        setErrors({ phoneNumber: 'Bu telefon numarasi zaten kayitli' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: '' }));
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleSurnameChange = (text: string) => {
    setSurname(text);
    if (errors.surname) {
      setErrors((prev) => ({ ...prev, surname: '' }));
    }
  };

  const handleClassChange = (value: string) => {
    setClassId(value);
    if (errors.classId) {
      setErrors((prev) => ({ ...prev, classId: '' }));
    }
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
          <Title style={[styles.title, { color: theme.colors.primary }]}>Hesap Olustur</Title>
          <Paragraph style={styles.subtitle}>Bilgilerinizi girerek kayit olun</Paragraph>

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
                error={Boolean(errors.phoneNumber)}
                style={styles.input}
              />
              <HelperText type="error" visible={Boolean(errors.phoneNumber)}>
                {errors.phoneNumber}
              </HelperText>

              <TextInput
                label="Ad"
                value={name}
                onChangeText={handleNameChange}
                mode="outlined"
                error={Boolean(errors.name)}
                style={styles.input}
              />
              <HelperText type="error" visible={Boolean(errors.name)}>
                {errors.name}
              </HelperText>

              <TextInput
                label="Soyad"
                value={surname}
                onChangeText={handleSurnameChange}
                mode="outlined"
                error={Boolean(errors.surname)}
                style={styles.input}
              />
              <HelperText type="error" visible={Boolean(errors.surname)}>
                {errors.surname}
              </HelperText>

              <View style={styles.genderSection}>
                <Paragraph style={styles.genderLabel}>Cinsiyet</Paragraph>
                <RadioButton.Group
                  onValueChange={(value) => setGender(value as 'male' | 'female')}
                  value={gender}
                >
                  <View style={styles.genderOptions}>
                    <View style={styles.genderOption}>
                      <RadioButton value="male" />
                      <Paragraph>Erkek</Paragraph>
                    </View>
                    <View style={styles.genderOption}>
                      <RadioButton value="female" />
                      <Paragraph>Kiz</Paragraph>
                    </View>
                  </View>
                </RadioButton.Group>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.classSection}>
                <Paragraph style={styles.classLabel}>Sinif</Paragraph>
                {loadingClasses ? (
                  <Paragraph>Siniflar yukleniyor...</Paragraph>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={classId} onValueChange={handleClassChange} style={styles.picker}>
                      <Picker.Item label="Sinif secin" value="" />
                      {classes.map((item) => (
                        <Picker.Item key={item.id} label={item.name} value={item.id} />
                      ))}
                    </Picker>
                  </View>
                )}
                <HelperText type="error" visible={Boolean(errors.classId)}>
                  {errors.classId}
                </HelperText>
              </View>

              <HelperText type="error" visible={Boolean(errors.general)}>
                {errors.general}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading || loadingClasses}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Kayit Ol
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.loginSection}>
            <Paragraph style={styles.loginText}>Zaten hesabiniz var mi?</Paragraph>
            <Button mode="text" onPress={() => navigation.navigate('Login')} disabled={loading}>
              Giris Yap
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
  genderSection: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  classSection: {
    marginBottom: 16,
  },
  classLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    height: 48,
  },
  loginSection: {
    alignItems: 'center',
  },
  loginText: {
    marginBottom: 8,
    color: '#666',
  },
});

export default RegisterScreen;
