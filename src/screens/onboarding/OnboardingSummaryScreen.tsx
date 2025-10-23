import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  Chip,
  Paragraph,
  ProgressBar,
  Surface,
  Title,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { OnboardingStackParamList } from '../../types/navigation';
import { AiPlanPayload } from '../../services/onboardingService';

type SummaryNavProp = StackNavigationProp<OnboardingStackParamList, 'Summary'>;
type SummaryRouteProp = RouteProp<OnboardingStackParamList, 'Summary'>;

interface Props {
  navigation: SummaryNavProp;
  route: SummaryRouteProp;
}

const OnboardingSummaryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { profile, availability } = route.params;
  const { saveOnboarding, refreshOnboarding, onboardingData } = useAuth();
  const insets = useSafeAreaInsets();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiPlan, setAiPlan] = useState<AiPlanPayload | null>(
    onboardingData?.aiPlan ?? null,
  );
  const [isCompleted, setIsCompleted] = useState(false);

  const availabilityPreview = useMemo(
    () =>
      availability.map((slot) => ({
        key: `${slot.dayOfWeek}-${slot.startTime}`,
        label: `${['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'][slot.dayOfWeek]} ${slot.startTime} - ${slot.endTime}`,
      })),
    [availability],
  );

  const handleFinish = async () => {
    try {
      setIsSaving(true);
      setError('');
      const response = await saveOnboarding(profile, availability);
      setAiPlan(response.aiPlan ?? null);
      setIsCompleted(true);
      await refreshOnboarding();
    } catch (err: any) {
      console.error('Onboarding kaydedilirken hata:', err);
      setError(err?.message || 'Onboarding adimlari kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoHome = () => {
    const rootNav = navigation.getParent();
    if (rootNav) {
      rootNav.reset({ index: 0, routes: [{ name: 'Main' as never }] });
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: insets.top }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <ProgressBar progress={0.95} style={styles.progress} />

        <Title style={styles.title}>Planini gozden gecir</Title>
        <Paragraph style={styles.paragraph}>
          Paylastigin bilgilerle sana uygun programi hazirlamaya hazirim. Asagidaki ozetle verilerini kontrol edebilirsin.
        </Paragraph>

        <Surface style={styles.card}>
          <Title style={styles.cardTitle}>Genel bilgiler</Title>
          <Paragraph>Profil tipi: {profile.profileType === 'exam' ? 'Sinav hazirligi' : profile.profileType === 'habit' ? 'Aliskanlik gelistirme' : 'Genel uretkenlik'}</Paragraph>
          <Paragraph>Hedef: {profile.primaryGoal}</Paragraph>
          {profile.targetDate ? <Paragraph>Hedef tarih: {profile.targetDate}</Paragraph> : null}
          {profile.motivation ? <Paragraph>Motive eden: {profile.motivation}</Paragraph> : null}
          {profile.studyFocusAreas?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {profile.studyFocusAreas.map((area) => (
                <Chip key={area} style={styles.chip}>
                  {area}
                </Chip>
              ))}
            </ScrollView>
          ) : null}
        </Surface>

        <Surface style={styles.card}>
          <Title style={styles.cardTitle}>Zaman blogu tercihlerin</Title>
          {availabilityPreview.length === 0 ? (
            <Paragraph>Henuz zaman blogu eklemedin. Dilersen ileride program ekranindan duzenleyebilirsin.</Paragraph>
          ) : (
            availabilityPreview.map((item) => (
              <Paragraph key={item.key} style={styles.listItem}>
                - {item.label}
              </Paragraph>
            ))
          )}
          {(profile.dailyAvailableMinutes || profile.weeklyAvailableMinutes) ? (
            <Paragraph style={styles.listItem}>
              Gunluk {profile.dailyAvailableMinutes ?? '-'} dk, haftalik {profile.weeklyAvailableMinutes ?? '-'} dk ayirmayi planliyorsun.
            </Paragraph>
          ) : null}
        </Surface>

        {aiPlan ? (
          <Surface style={styles.card}>
            <Title style={styles.cardTitle}>Yapay zeka onerisi</Title>
            <Paragraph style={styles.bold}>{aiPlan.summary}</Paragraph>
            {aiPlan.keyFocus?.length ? (
              <View style={styles.chipRow}>
                {aiPlan.keyFocus.map((focus) => (
                  <Chip key={focus} style={styles.chip} icon="target">
                    {focus}
                  </Chip>
                ))}
              </View>
            ) : null}

            {aiPlan.goals?.length ? (
              <View style={styles.block}>
                <Paragraph style={styles.subTitle}>Onerilen hedefler</Paragraph>
                {aiPlan.goals.map((goal) => (
                  <View key={goal.title} style={styles.listBlock}>
                    <Paragraph style={styles.listItem}>- {goal.title}</Paragraph>
                    <Paragraph style={styles.listCaption}>{goal.description}</Paragraph>
                    {goal.suggestedTimeline ? (
                      <Paragraph style={styles.listCaption}>Zaman onerisi: {goal.suggestedTimeline}</Paragraph>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {aiPlan.habits?.length ? (
              <View style={styles.block}>
                <Paragraph style={styles.subTitle}>Onerilen aliskanliklar</Paragraph>
                {aiPlan.habits.map((habit) => (
                  <Paragraph key={habit.name} style={styles.listItem}>
                    - {habit.name} ({habit.frequency})
                  </Paragraph>
                ))}
              </View>
            ) : null}

            {aiPlan.schedule?.length ? (
              <View style={styles.block}>
                <Paragraph style={styles.subTitle}>Haftalik plan onerisi</Paragraph>
                {aiPlan.schedule.map((item, index) => (
                  <Paragraph key={`${item.day}-${index}`} style={styles.listItem}>
                    - {item.day}: {item.focus}
                    {item.durationMinutes ? ` (${item.durationMinutes} dk)` : ''}
                  </Paragraph>
                ))}
              </View>
            ) : null}

            {aiPlan.encouragement ? (
              <Paragraph style={styles.encouragement}>
                {aiPlan.encouragement}
              </Paragraph>
            ) : null}
          </Surface>
        ) : null}

        {error ? <Paragraph style={styles.error}>{error}</Paragraph> : null}

        {isCompleted ? (
          <Button mode="contained" onPress={handleGoHome} style={styles.button}>
            Uygulamaya basla
          </Button>
        ) : (
          <Button mode="contained" onPress={handleFinish} disabled={isSaving} style={styles.button}>
            {isSaving ? <ActivityIndicator animating /> : 'Plani kaydet'}
          </Button>
        )}

        {!isCompleted ? (
          <Paragraph style={styles.helperText}>
            Plani kaydettiginde yapay zekadan gelen oneriler otomatik olarak hesabina eklenecek.
          </Paragraph>
        ) : null}
      </ScrollView>
      {isSaving ? (
        <View style={styles.overlay} pointerEvents="none">
          <Surface style={styles.overlayCard} elevation={4}>
            <ActivityIndicator animating size="large" />
            <Paragraph style={styles.overlayTitle}>Yapay zeka planı hazırlanıyor…</Paragraph>
            <Paragraph style={styles.overlayText}>
              En iyi sonuçlar için birkaç saniye bekleyin. Öneriler birazdan hazır olacak.
            </Paragraph>
          </Surface>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#555',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    marginBottom: 6,
  },
  listItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  listCaption: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },
  block: {
    marginTop: 8,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  listBlock: {
    marginBottom: 8,
  },
  encouragement: {
    marginTop: 12,
    fontStyle: 'italic',
    color: '#555',
  },
  error: {
    color: '#D32F2F',
    marginTop: 8,
  },
  button: {
    marginTop: 12,
  },
  helperText: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
  },
  bold: {
    fontWeight: '600',
    marginBottom: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCard: {
    padding: 24,
    borderRadius: 20,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 12,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  overlayText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});

export default OnboardingSummaryScreen;
