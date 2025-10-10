import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Title,
  Paragraph,
  TextInput,
  Button,
  HelperText,
  RadioButton,
  Chip,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../types/navigation';

type IntroScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'Intro'>;
type IntroScreenRouteProp = RouteProp<OnboardingStackParamList, 'Intro'>;

interface Props {
  navigation: IntroScreenNavigationProp;
  route: IntroScreenRouteProp;
}

const defaultFocusAreas = ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler'];

const OnboardingIntroScreen: React.FC<Props> = ({ navigation }) => {
  const [profileType, setProfileType] = useState<'exam' | 'general'>('exam');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [examType, setExamType] = useState('');
  const [motivation, setMotivation] = useState('');
  const [dailyMinutes, setDailyMinutes] = useState('');
  const [weeklyMinutes, setWeeklyMinutes] = useState('');
  const [preferredTimes, setPreferredTimes] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [error, setError] = useState('');

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]
    );
  };

  const handleContinue = () => {
    if (!primaryGoal.trim()) {
      setError('Hedefini kısaca yazman gerekli');
      return;
    }

    navigation.navigate('Availability', {
      profile: {
        profileType,
        primaryGoal,
        targetDate: targetDate || null,
        examType: examType || null,
        motivation,
        studyFocusAreas: selectedFocusAreas,
        dailyAvailableMinutes: dailyMinutes ? Number(dailyMinutes) : null,
        weeklyAvailableMinutes: weeklyMinutes ? Number(weeklyMinutes) : null,
        preferredStudyTimes: preferredTimes || null,
        learningStyle: learningStyle || null,
        reminderTime: reminderTime || null,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Hedeflerini Tanıyalım</Title>
      <Paragraph style={styles.paragraph}>
        Sana özel bir çalışma deneyimi hazırlayabilmemiz için birkaç soruya yanıt ver lütfen.
      </Paragraph>

      <Paragraph style={styles.sectionLabel}>Çalışma Türü</Paragraph>
      <RadioButton.Group onValueChange={(value) => setProfileType(value as 'exam' | 'general')} value={profileType}>
        <View style={styles.radioRow}>
          <RadioButton value="exam" />
          <Paragraph>Sınava Hazırlık</Paragraph>
        </View>
        <View style={styles.radioRow}>
          <RadioButton value="general" />
          <Paragraph>Genel Zaman Planlama</Paragraph>
        </View>
      </RadioButton.Group>

      <TextInput
        label="Ana hedefin nedir?"
        value={primaryGoal}
        onChangeText={(value) => {
          setPrimaryGoal(value);
          if (error) setError('');
        }}
        mode="outlined"
        multiline
        style={styles.input}
        placeholder="Örn: TYT Matematikte 30 net yapmak"
      />
      <HelperText type="error" visible={Boolean(error)}>
        {error}
      </HelperText>

      <TextInput
        label="Hedef tarih (YYYY-AA-GG)"
        value={targetDate}
        onChangeText={setTargetDate}
        mode="outlined"
        style={styles.input}
        placeholder="Örn: 2025-06-01"
      />

      {profileType === 'exam' && (
        <TextInput
          label="Hangi sınava hazırlanıyorsun?"
          value={examType}
          onChangeText={setExamType}
          mode="outlined"
          style={styles.input}
          placeholder="Örn: LGS / TYT / KPSS"
        />
      )}

      <TextInput
        label="Seni motive eden şey nedir?"
        value={motivation}
        onChangeText={setMotivation}
        mode="outlined"
        multiline
        style={styles.input}
        placeholder="Kısa bir cümle"
      />

      <TextInput
        label="Günde kaç dakika ayırabilirsin?"
        value={dailyMinutes}
        onChangeText={setDailyMinutes}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
        placeholder="Örn: 120"
      />

      <TextInput
        label="Haftada kaç dakika ayırabilirsin?"
        value={weeklyMinutes}
        onChangeText={setWeeklyMinutes}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
        placeholder="Örn: 600"
      />

      <TextInput
        label="Tercih ettiğin çalışma zamanları"
        value={preferredTimes}
        onChangeText={setPreferredTimes}
        mode="outlined"
        style={styles.input}
        placeholder="Örn: Sabah 08:00-10:00 arası"
      />

      <TextInput
        label="Öğrenme stilin"
        value={learningStyle}
        onChangeText={setLearningStyle}
        mode="outlined"
        style={styles.input}
        placeholder="Örn: Görsel, İşitsel, Uygulamalı"
      />

      <TextInput
        label="Hatırlatma zamanı (opsiyonel)"
        value={reminderTime}
        onChangeText={setReminderTime}
        mode="outlined"
        style={styles.input}
        placeholder="Örn: 20:30"
      />

      <Paragraph style={styles.sectionLabel}>Odaklanmak istediğin dersler</Paragraph>
      <View style={styles.chipRow}>
        {defaultFocusAreas.map((area) => (
          <Chip
            key={area}
            selected={selectedFocusAreas.includes(area)}
            onPress={() => toggleFocusArea(area)}
            style={styles.chip}
          >
            {area}
          </Chip>
        ))}
      </View>

      <Button mode="contained" onPress={handleContinue} style={styles.button}>
        Devam Et
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#555',
    marginBottom: 16,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
  },
  button: {
    marginTop: 12,
  },
});

export default OnboardingIntroScreen;

