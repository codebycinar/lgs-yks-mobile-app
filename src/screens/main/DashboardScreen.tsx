import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Paragraph,
  ProgressBar,
  Surface,
  Title,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import goalService from '../../services/goalService';
import programService from '../../services/programService';
import contentService from '../../services/contentService';
import { Goal, WeeklyProgram, ProgramTask, Subject, Topic } from '../../types/content';

interface DashboardScreenProps {
  navigation: any;
}

type SubjectSummary = {
  id: string;
  name: string;
  progressPercent: number;
  learnedCount: number;
  totalCount: number;
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user, onboardingData } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [programs, setPrograms] = useState<WeeklyProgram[]>([]);
  const [subjectSummaries, setSubjectSummaries] = useState<SubjectSummary[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<ProgramTask[]>([]);

  const profileType = onboardingData?.profile?.profileType ?? 'habit';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Gunaydin';
    if (hour < 18) return 'Iyi gunler';
    return 'Iyi aksamlar';
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [active, completed, weeklyPrograms, subjects, userTopics, topicProgress] =
        await Promise.all([
          goalService.getGoals('active'),
          goalService.getGoals('completed'),
          programService.getPrograms(),
          contentService.getSubjects(),
          contentService.getTopicsForUser(),
          contentService.getUserProgress(),
        ]);

      setActiveGoals(active);
      setCompletedGoals(completed);

      const validPrograms = weeklyPrograms.filter((program) => Boolean(program.id)) as Array<
        WeeklyProgram & { id: string }
      >;
      const programDetails = await Promise.all(
        validPrograms.map((program) =>
          programService.getProgramById(program.id).catch(() => null),
        ),
      );
      const hydratedPrograms = programDetails.filter(
        (item): item is WeeklyProgram => Boolean(item),
      );
      setPrograms(hydratedPrograms);

      const progressMap = new Map<string, { total: number; learned: number }>();
      const statusMap = new Map<string, string>();
      topicProgress.forEach((item) => {
        const topicId = item.topicId || '';
        if (!topicId) {
          return;
        }
        statusMap.set(topicId, item.status);
      });

      userTopics.forEach((topic: Topic) => { const topicId = topic.id || ""; if (!topicId) { return; }
        const subjectId = topic.subjectId;
        if (!progressMap.has(subjectId)) {
          progressMap.set(subjectId, { total: 0, learned: 0 });
        }
        const subjectStats = progressMap.get(subjectId)!;
        subjectStats.total += 1;
        if (statusMap.get(topicId) === 'learned') {
          subjectStats.learned += 1;
        }
      });

      const subjectData: SubjectSummary[] = subjects.map((subject: Subject) => {
        const stats = progressMap.get(subject.id) || { total: 0, learned: 0 };
        const progressPercent =
          stats.total > 0 ? Math.round((stats.learned / stats.total) * 100) : 0;
        return {
          id: subject.id,
          name: subject.name,
          progressPercent,
          learnedCount: stats.learned,
          totalCount: stats.total,
        };
      });

      setSubjectSummaries(subjectData.slice(0, 4));

      const nextTasks: ProgramTask[] = [];
      hydratedPrograms.forEach((program) => {
        program.tasks.forEach((task) => {
          if (!task.isCompleted) {
            nextTasks.push(task);
          }
        });
      });

      nextTasks.sort((a, b) => a.taskDate.localeCompare(b.taskDate));
      setUpcomingTasks(nextTasks.slice(0, 5));
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const overallProgress = useMemo(() => {
    if (!subjectSummaries.length) return 0;
    const total = subjectSummaries.reduce((acc, item) => acc + item.progressPercent, 0);
    return Math.round(total / subjectSummaries.length);
  }, [subjectSummaries]);

  const aiPlan = onboardingData?.aiPlan;

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: insets.top }]}
      edges={['top', 'right', 'left']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 32 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Title style={styles.greeting}>
          {greeting}, {user?.name}
        </Title>
        <Paragraph style={styles.subGreeting}>
          Bugun kucuk bir adim atmaya hazir misin?
        </Paragraph>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.progressHeader}>
              <View>
                <Paragraph style={styles.mutedText}>Genel ilerleme</Paragraph>
                <Title>{overallProgress}%</Title>
              </View>
              <ProgressBar
                progress={overallProgress / 100}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
            <Paragraph style={styles.mutedText}>
              Profil turu: {profileType === 'exam' ? 'Sinav hazirligi' : profileType === 'habit' ? 'Aliskanlik' : 'Genel uretkenlik'}
            </Paragraph>
          </Card.Content>
        </Card>

        {aiPlan ? (
          <Card style={styles.card}>
            <Card.Content>
              <Paragraph style={styles.sectionLabel}>
                Yapay zeka planı{aiPlan.provider ? ` • ${aiPlan.provider}` : ''}
              </Paragraph>
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
                <View style={styles.aiBlock}>
                  <Paragraph style={styles.aiBlockTitle}>Önerilen hedefler</Paragraph>
                  {aiPlan.goals.map((goal) => (
                    <View key={goal.title} style={styles.aiBullet}>
                      <View style={styles.aiBulletDot} />
                      <View style={styles.aiBulletContent}>
                        <Paragraph style={styles.aiBulletTitle}>{goal.title}</Paragraph>
                        <Paragraph style={styles.aiBulletDescription}>{goal.description}</Paragraph>
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

              {aiPlan.habits?.length ? (
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

              {aiPlan.schedule?.length ? (
                <View style={styles.aiBlock}>
                  <Paragraph style={styles.aiBlockTitle}>Haftalık plan önerisi</Paragraph>
                  {aiPlan.schedule.map((item, index) => (
                    <View key={`${item.day}-${index}`} style={styles.aiScheduleRow}>
                      <Paragraph style={styles.aiScheduleDay}>{item.day}</Paragraph>
                      <Paragraph style={styles.aiScheduleText}>
                        {item.focus}
                        {item.durationMinutes ? ` • ${item.durationMinutes} dk` : ''}
                      </Paragraph>
                    </View>
                  ))}
                </View>
              ) : null}

              {aiPlan.encouragement ? (
                <Paragraph style={styles.encouragement}>{aiPlan.encouragement}</Paragraph>
              ) : null}
            </Card.Content>
          </Card>
        ) : null}

        <Card style={styles.card}>
          <Card.Content>
            <Paragraph style={styles.sectionLabel}>Ders / alan ilermesi</Paragraph>
            {isLoading ? (
              <ActivityIndicator />
            ) : subjectSummaries.length === 0 ? (
              <Paragraph style={styles.mutedText}>
                Ders ilerlemesi bulunmuyor. Dersler ekranindan ilerlemeni isaretleyebilirsin.
              </Paragraph>
            ) : (
              subjectSummaries.map((subject) => (
                <View key={subject.id} style={styles.subjectItem}>
                  <View style={styles.subjectHeader}>
                    <Paragraph style={styles.bold}>{subject.name}</Paragraph>
                    <Paragraph style={styles.mutedText}>
                      {subject.learnedCount}/{subject.totalCount}
                    </Paragraph>
                  </View>
                  <ProgressBar
                    progress={subject.progressPercent / 100}
                    color={theme.colors.secondary}
                    style={styles.subjectProgress}
                  />
                </View>
              ))
            )}
            <Button mode="text" onPress={() => navigation.navigate('Subjects')}>
              Dersleri goruntule
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Paragraph style={styles.sectionLabel}>Hedeflerin</Paragraph>
            {isLoading ? (
              <ActivityIndicator />
            ) : activeGoals.length === 0 ? (
              <Paragraph style={styles.mutedText}>
                Aktif hedef bulunmuyor. Hedefler ekranindan yeni bir hedef ekleyebilirsin.
              </Paragraph>
            ) : (
              activeGoals.slice(0, 3).map((goal) => (
                <Surface key={goal.id} style={styles.goalCard}>
                  <Paragraph style={styles.bold}>{goal.title}</Paragraph>
                  {goal.targetDate ? (
                    <Paragraph style={styles.mutedText}>Hedef tarih: {goal.targetDate}</Paragraph>
                  ) : null}
                </Surface>
              ))
            )}
            <Button mode="text" onPress={() => navigation.navigate('Goals')}>
              Hedefleri yonet
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Paragraph style={styles.sectionLabel}>Yaklasan gorevler</Paragraph>
            {isLoading ? (
              <ActivityIndicator />
            ) : upcomingTasks.length === 0 ? (
              <Paragraph style={styles.mutedText}>
                Planlanmis gorev bulunmuyor. Programlar ekranindan gorev ekleyebilirsin.
              </Paragraph>
            ) : (
              upcomingTasks.map((task) => (
                <Paragraph key={task.id} style={styles.listItem}>
                  - {task.taskDate}: {task.title}
                </Paragraph>
              ))
            )}
            <Button mode="text" onPress={() => navigation.navigate('Programs')}>
              Programlari goruntule
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 15,
    color: '#555',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 1,
    backgroundColor: '#ffffff',
  },
  progressHeader: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  bold: {
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
  aiScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  aiScheduleDay: {
    fontWeight: '600',
    color: '#333',
  },
  aiScheduleText: {
    flex: 1,
    marginLeft: 12,
    color: '#555',
  },
  encouragement: {
    marginTop: 12,
    fontStyle: 'italic',
    color: '#555',
  },
  subjectItem: {
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  mutedText: {
    color: '#707070',
    fontSize: 13,
  },
  subjectProgress: {
    height: 6,
    borderRadius: 3,
  },
  goalCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F1F3FF',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});

export default DashboardScreen;
