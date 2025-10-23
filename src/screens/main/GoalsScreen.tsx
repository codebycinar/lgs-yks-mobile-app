import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  Paragraph,
  TextInput,
  Title,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import goalService from '../../services/goalService';
import { Goal } from '../../types/content';
import { useAuth } from '../../contexts/AuthContext';

const GoalsScreen: React.FC = () => {
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGoalText, setNewGoalText] = useState('');
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [showIosDatePicker, setShowIosDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const { onboardingData } = useAuth();
  const aiPlan = onboardingData?.aiPlan;

  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const [active, completed] = await Promise.all([
        goalService.getGoals('active'),
        goalService.getGoals('completed'),
      ]);
      setActiveGoals(active);
      setCompletedGoals(completed);
    } catch (error) {
      console.error('Goals load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals]),
  );

  const handleCreateGoal = async () => {
    if (!newGoalText.trim()) return;
    try {
      setSaving(true);
      const newGoal = await goalService.createGoal(newGoalText.trim(), targetDate);
      setActiveGoals((prev) => [newGoal, ...prev]);
      setNewGoalText('');
      setTargetDate(null);
    } catch (error) {
      console.error('Create goal error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      const updated = await goalService.completeGoal(goalId);
      setActiveGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      setCompletedGoals((prev) => [updated, ...prev]);
    } catch (error) {
      console.error('Complete goal error:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await goalService.deleteGoal(goalId);
      setActiveGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      setCompletedGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (error) {
      console.error('Delete goal error:', error);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: targetDate ? new Date(targetDate) : new Date(),
        onChange: (_, date) => {
          if (date) {
            setTargetDate(date.toISOString().split('T')[0]);
          }
        },
      });
    } else {
      setShowIosDatePicker(true);
    }
  };

  const renderGoalCard = (goal: Goal, isCompleted: boolean) => (
    <Card key={goal.id} style={styles.goalCard}>
      <Card.Title
        title={goal.title}
        subtitle={goal.targetDate ? `Hedef tarih: ${goal.targetDate}` : undefined}
      />
      <Card.Actions style={styles.goalActions}>
        {!isCompleted ? (
          <Button
            mode="contained-tonal"
            onPress={() => handleCompleteGoal(goal.id)}
            icon="check"
          >
            Tamamla
          </Button>
        ) : null}
        <IconButton icon="delete-outline" onPress={() => handleDeleteGoal(goal.id)} />
      </Card.Actions>
    </Card>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: insets.top }]}
      edges={['top', 'right', 'left']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Title style={styles.title}>Hedeflerin</Title>
          <Paragraph style={styles.paragraph}>
            Kucuk hedefler koy, tamamladikca yenilerini ekle. Yapay zeka onerileri hedeflerine gore program olusturacak.
          </Paragraph>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Hedef ekle</Title>
              <TextInput
                label="Ne basarmak istiyorsun?"
                value={newGoalText}
                onChangeText={setNewGoalText}
                mode="outlined"
                style={styles.input}
                multiline
                placeholder="Orn: Sabah 15 dakikalik meditasyon yapmak"
              />
              <View style={styles.inlineRow}>
                <Button mode="outlined" icon="calendar" onPress={openDatePicker}>
                  {targetDate ? `Hedef tarih: ${targetDate}` : 'Tarih sec (opsiyonel)'}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateGoal}
                  disabled={!newGoalText.trim() || saving}
                  loading={saving}
                >
                  Kaydet
                </Button>
              </View>
              {Platform.OS === 'ios' && showIosDatePicker ? (
                <DateTimePicker
                  mode="date"
                  value={targetDate ? new Date(targetDate) : new Date()}
                  onChange={(_, date) => {
                    setShowIosDatePicker(false);
                    if (date) {
                      setTargetDate(date.toISOString().split('T')[0]);
                    }
                  }}
                />
              ) : null}
            </Card.Content>
          </Card>

          <Title style={styles.sectionTitle}>Aktif hedefler</Title>
          {isLoading ? (
            <ActivityIndicator />
          ) : activeGoals.length === 0 ? (
            <Paragraph style={styles.muted}>
              Henuz aktif hedef yok. Yukaridaki formdan yeni hedef ekleyebilirsin.
            </Paragraph>
          ) : (
            activeGoals.slice(0, 3).map((goal) => renderGoalCard(goal, false))
          )}

          <Title style={styles.sectionTitle}>Tamamlanan hedefler</Title>
          {isLoading ? (
            <ActivityIndicator />
          ) : completedGoals.length === 0 ? (
            <Paragraph style={styles.muted}>Tamamlanan hedeflerin burada gorunecek.</Paragraph>
          ) : (
            completedGoals.slice(0, 5).map((goal) => renderGoalCard(goal, true))
          )}

          {aiPlan?.goals?.length || aiPlan?.habits?.length ? (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Yapay zeka önerileri</Title>
                <Paragraph style={styles.muted}>
                  Planından gelen önerileri hedeflerine dönüştürmek için fikir olarak kullanabilirsin.
                </Paragraph>

                {aiPlan?.goals?.length ? (
                  <View style={styles.aiBlock}>
                    <Paragraph style={styles.aiBlockTitle}>Önerilen hedefler</Paragraph>
                    {aiPlan.goals.map((goal) => (
                      <View key={goal.title} style={styles.aiBullet}>
                        <View style={styles.aiBulletDot} />
                        <View style={styles.aiBulletContent}>
                          <Paragraph style={styles.aiBulletTitle}>{goal.title}</Paragraph>
                          <Paragraph style={styles.aiBulletDescription}>
                            {goal.description}
                          </Paragraph>
                          {goal.suggestedTimeline ? (
                            <Paragraph style={styles.aiBulletMeta}>
                              Zaman önerisi: {goal.suggestedTimeline}
                            </Paragraph>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}

                {aiPlan?.habits?.length ? (
                  <View style={styles.aiBlock}>
                    <Paragraph style={styles.aiBlockTitle}>Alışkanlık önerileri</Paragraph>
                    {aiPlan.habits.map((habit) => (
                      <View key={habit.name} style={styles.aiBullet}>
                        <View style={styles.aiBulletDot} />
                        <View style={styles.aiBulletContent}>
                          <Paragraph style={styles.aiBulletTitle}>{habit.name}</Paragraph>
                          <Paragraph style={styles.aiBulletDescription}>
                            {habit.frequency}
                          </Paragraph>
                          {habit.reminderTime ? (
                            <Paragraph style={styles.aiBulletMeta}>
                              Hatırlatma: {habit.reminderTime}
                            </Paragraph>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Card.Content>
            </Card>
          ) : null}
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
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
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
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  goalCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  goalActions: {
    justifyContent: 'space-between',
  },
  muted: {
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  aiBlock: {
    marginTop: 12,
    gap: 8,
  },
  aiBlockTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  aiBullet: {
    flexDirection: 'row',
    gap: 12,
  },
  aiBulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6200ee',
    marginTop: 6,
  },
  aiBulletContent: {
    flex: 1,
    gap: 2,
  },
  aiBulletTitle: {
    fontWeight: '600',
    color: '#333',
  },
  aiBulletDescription: {
    fontSize: 13,
    color: '#555',
  },
  aiBulletMeta: {
    fontSize: 12,
    color: '#777',
  },
});

export default GoalsScreen;
