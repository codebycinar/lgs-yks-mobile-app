import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  Button,
  Chip,
  HelperText,
  Paragraph,
  ProgressBar,
  RadioButton,
  TextInput,
  Title,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OnboardingStackParamList } from '../../types/navigation';

type IntroScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'Intro'>;
type IntroScreenRouteProp = RouteProp<OnboardingStackParamList, 'Intro'>;

interface Props {
  navigation: IntroScreenNavigationProp;
  route: IntroScreenRouteProp;
}

const motivationPresets = ['Istikrar saglamak', 'Performans yukselmek', 'Yeni aliskanlik gelistirmek'];
const learningStylePresets = ['Gorsel', 'Isitsel', 'Yazarak', 'Pratik'];
const focusAreaPresets = ['Matematik', 'Turkce', 'Fen Bilimleri', 'Sosyal Bilgiler', 'Saglik', 'Zihin acikligi'];

const profileTypeOptions: Array<{ key: 'exam' | 'habit' | 'general'; title: string; icon: string; description: string }> = [
  {
    key: 'exam',
    title: 'Sinava Hazirlik',
    icon: 'school-outline',
    description: 'Belirli bir sinava yonelik hedeflerini planla',
  },
  {
    key: 'habit',
    title: 'Aliskanlik Gelistir',
    icon: 'meditation',
    description: 'Rutinlerini guclendir, saglikli aliskanliklar olustur',
  },
  {
    key: 'general',
    title: 'Genel Uretkenlik',
    icon: 'progress-star',
    description: 'Projelerini, is ve kisisel hedeflerini organize et',
  },
];

const AnimatedAvatar = Animated.createAnimatedComponent(Avatar.Icon);

const OnboardingIntroScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const [profileType, setProfileType] = useState<'exam' | 'habit' | 'general'>('habit');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [examType, setExamType] = useState('');
  const [selectedMotivation, setSelectedMotivation] = useState<string>('Istikrar saglamak');
  const [customMotivation, setCustomMotivation] = useState('');
  const [learningStyle, setLearningStyle] = useState<string>('');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const motivationValue = useMemo(() => {
    if (selectedMotivation === 'Diger') {
      return customMotivation.trim();
    }
    return selectedMotivation || '';
  }, [selectedMotivation, customMotivation]);

  const handleToggleFocusArea = (area: string) => {
    setSelectedFocusAreas((prev) =>
      prev.includes(area)
        ? prev.filter((item) => item !== area)
        : [...prev, area].slice(0, 4),
    );
  };

  const handleDateChange = (_: any, date?: Date) => {
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
    if (date) {
      const iso = date.toISOString().split('T')[0];
      setTargetDate(iso);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: targetDate ? new Date(targetDate) : new Date(),
        onChange: handleDateChange,
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const handleContinue = () => {
    if (!primaryGoal.trim()) {
      setError('Hedefini kisaca yazmalisin');
      return;
    }

    const motivation = motivationValue || 'Belirtilmedi';
    const learning = learningStyle || null;

    navigation.navigate('Availability', {
      profile: {
        profileType,
        primaryGoal: primaryGoal.trim(),
        targetDate,
        examType: profileType === 'exam' ? examType.trim() || null : null,
        motivation,
        studyFocusAreas: selectedFocusAreas,
        learningStyle: learning,
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: insets.top }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressBar progress={0.33} style={styles.progress} />

          <AnimatedAvatar
            style={{ alignSelf: 'center', opacity: fadeAnim }}
            icon="star-four-points"
            size={80}
          />
          <Title style={styles.title}>Hedeflerini tanitalim</Title>
          <Paragraph style={styles.paragraph}>
            Sadece birkac yanitla sana ozel bir baslangic plani onerecegim.
          </Paragraph>

          <Paragraph style={styles.sectionLabel}>Profilini sec</Paragraph>
          <View style={styles.profileRow}>
            {profileTypeOptions.map((option) => {
              const isSelected = profileType === option.key;
              return (
                <View key={option.key} style={[styles.profileCard, isSelected && styles.profileCardSelected]}>
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={28}
                    color={isSelected ? '#ffffff' : '#6200ee'}
                    style={styles.profileIcon}
                  />
                  <Button
                    mode={isSelected ? 'contained' : 'outlined'}
                    onPress={() => setProfileType(option.key)}
                    style={styles.profileButton}
                  >
                    {option.title}
                  </Button>
                  <Paragraph style={[styles.profileDescription, isSelected && styles.profileDescriptionSelected]}>
                    {option.description}
                  </Paragraph>
                </View>
              );
            })}
          </View>

          <TextInput
            label="Ana hedefin nedir?"
            value={primaryGoal}
            onChangeText={(text) => {
              setPrimaryGoal(text);
              if (error) setError('');
            }}
            mode="outlined"
            multiline
            style={styles.input}
            placeholder="Orn: Sabah erken kalkma aliskanligi edinmek"
          />
          <HelperText type="error" visible={Boolean(error)}>
            {error}
          </HelperText>

          <View style={styles.inlineGroup}>
            <Button
              mode={targetDate ? 'contained-tonal' : 'outlined'}
              onPress={openDatePicker}
              icon="calendar"
              style={styles.inlineButton}
            >
              {targetDate ? `Hedef tarihi: ${targetDate}` : 'Hedef tarih sec'}
            </Button>
            {showDatePicker ? (
              <DateTimePicker
                value={targetDate ? new Date(targetDate) : new Date()}
                mode="date"
                display="inline"
                onChange={handleDateChange}
              />
            ) : null}
          </View>

          {profileType === 'exam' ? (
            <TextInput
              label="Hangi sinava hazirlaniyorsun?"
              value={examType}
              onChangeText={setExamType}
              mode="outlined"
              style={styles.input}
              placeholder="Orn: LGS, KPSS, TOEFL"
            />
          ) : null}

          <Paragraph style={styles.sectionLabel}>Seni en cok hangisi motive eder?</Paragraph>
          <View style={styles.chipRow}>
            {motivationPresets.map((item) => (
              <Chip
                key={item}
                selected={selectedMotivation === item}
                onPress={() => setSelectedMotivation(item)}
                style={styles.chip}
              >
                {item}
              </Chip>
            ))}
            <Chip
              selected={selectedMotivation === 'Diger'}
              onPress={() => setSelectedMotivation('Diger')}
              style={styles.chip}
            >
              Diger
            </Chip>
          </View>
          {selectedMotivation === 'Diger' ? (
            <TextInput
              label="Motivasyonunu yaz"
              value={customMotivation}
              onChangeText={setCustomMotivation}
              mode="outlined"
              style={styles.input}
              placeholder="Kendi motivasyonunu paylas"
            />
          ) : null}

          <Paragraph style={styles.sectionLabel}>Nasil ogrenmeyi/aliskanlik gelistirmeyi seversin?</Paragraph>
          <RadioButton.Group
            onValueChange={(value) => setLearningStyle(value as string)}
            value={learningStyle}
          >
            {learningStylePresets.map((item) => (
              <View key={item} style={styles.radioRow}>
                <RadioButton value={item} />
                <Paragraph>{item}</Paragraph>
              </View>
            ))}
          </RadioButton.Group>

          <Paragraph style={styles.sectionLabel}>Odaklanmak istedigin alanlar</Paragraph>
          <View style={styles.chipRow}>
            {focusAreaPresets.map((area) => (
              <Chip
                key={area}
                selected={selectedFocusAreas.includes(area)}
                onPress={() => handleToggleFocusArea(area)}
                style={styles.chip}
              >
                {area}
              </Chip>
            ))}
          </View>

          <Button mode="contained" onPress={handleContinue} style={styles.button}>
            Devam et
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  progress: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
  },
  button: {
    marginTop: 24,
  },
  inlineGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineButton: {
    flex: 1,
    marginRight: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileCard: {
    flexBasis: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  profileCardSelected: {
    backgroundColor: '#6200ee',
  },
  profileIcon: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  profileButton: {
    marginBottom: 6,
  },
  profileDescription: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
  profileDescriptionSelected: {
    color: '#ffffff',
  },
});

export default OnboardingIntroScreen;
