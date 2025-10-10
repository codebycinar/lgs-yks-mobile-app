import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Paragraph, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { OnboardingStackParamList } from '../../types/navigation';

type SummaryNavProp = StackNavigationProp<OnboardingStackParamList, 'Summary'>;
type SummaryRouteProp = RouteProp<OnboardingStackParamList, 'Summary'>;

interface Props {
  navigation: SummaryNavProp;
  route: SummaryRouteProp;
}

const dayNamesLong = [
  'Pazartesi',
  'Sali',
  'Carsamba',
  'Persembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

const OnboardingSummaryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { profile, availability } = route.params;
  const { saveOnboarding, refreshOnboarding } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFinish = async () => {
    try {
      setIsSaving(true);
      setError('');
      await saveOnboarding(profile, availability);
      await refreshOnboarding();
      const rootNav = navigation.getParent();
      if (rootNav) {
        rootNav.reset({ index: 0, routes: [{ name: 'Main' as never }] });
      }
    } catch (err: any) {
      console.error('Onboarding kaydedilirken hata:', err);
      setError(err?.response?.data?.message || 'Onboarding adimlari kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Planin hazir!</Title>
      <Paragraph style={styles.paragraph}>
        Sana uygun bir calisma asistani olusturabilmemiz icin tum bilgiler kaydedilmeye hazir. Asagida sectiklerinin kisa bir ozetini gorebilirsin.
      </Paragraph>

      <Surface style={styles.card}>
        <Title style={styles.cardTitle}>Genel Bilgiler</Title>
        <Paragraph>Hedef: {profile.primaryGoal}</Paragraph>
        {profile.profileType === 'exam' && profile.examType && (
          <Paragraph>Sinav: {profile.examType}</Paragraph>
        )}
        {profile.targetDate && <Paragraph>Hedef Tarih: {profile.targetDate}</Paragraph>}
        {profile.dailyAvailableMinutes && (
          <Paragraph>Gunluk Sure: {profile.dailyAvailableMinutes} dk</Paragraph>
        )}
        {profile.weeklyAvailableMinutes && (
          <Paragraph>Haftalik Sure: {profile.weeklyAvailableMinutes} dk</Paragraph>
        )}
        {profile.preferredStudyTimes && (
          <Paragraph>Tercih edilen zaman: {profile.preferredStudyTimes}</Paragraph>
        )}
        {profile.learningStyle && (
          <Paragraph>Ogrenme stili: {profile.learningStyle}</Paragraph>
        )}
      </Surface>

      <Surface style={styles.card}>
        <Title style={styles.cardTitle}>Calisma Bloklarin</Title>
        {availability.length === 0 ? (
          <Paragraph>Henuz calisma blogu secmedin.</Paragraph>
        ) : (
          availability.map((slot, index) => (
            <Paragraph key={`${slot.dayOfWeek}-${index}`}>
              {dayNamesLong[slot.dayOfWeek]}: {slot.startTime} - {slot.endTime}
              {slot.intensity ? ` - ${slot.intensity}` : ''}
            </Paragraph>
          ))
        )}
      </Surface>

      {error ? <Paragraph style={styles.error}>{error}</Paragraph> : null}

      <Button mode="contained" onPress={handleFinish} disabled={isSaving} style={styles.button}>
        {isSaving ? <ActivityIndicator animating /> : 'Planimi Kaydet'}
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
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
  },
  error: {
    color: '#D32F2F',
    marginTop: 8,
  },
});

export default OnboardingSummaryScreen;
