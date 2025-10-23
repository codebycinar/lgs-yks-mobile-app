import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  Paragraph,
  Title,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import programService from '../../services/programService';
import { ProgramTask, WeeklyProgram } from '../../types/content';
import { useAuth } from '../../contexts/AuthContext';

const ProgramsScreen: React.FC = () => {
  const [programs, setPrograms] = useState<WeeklyProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { startOnboarding, onboardingData } = useAuth();
  const aiPlan = onboardingData?.aiPlan;

  const loadPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      const summaries = await programService.getPrograms();
      const validPrograms = summaries.filter((program) => Boolean(program.id));
      const details = await Promise.all(
        validPrograms.map((program) =>
          programService.getProgramById(program.id as string).catch(() => null),
        ),
      );
      setPrograms(details.filter((program): program is WeeklyProgram => Boolean(program)));
    } catch (error) {
      console.error('Programs load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPrograms();
    }, [loadPrograms]),
  );

  const handleCompleteTask = async (programId: string, taskId: string) => {
    try {
      const updated = await programService.completeTask(programId, taskId);
      setPrograms((prev) =>
        prev.map((program) =>
          program.id === programId
            ? {
                ...program,
                tasks: program.tasks.map((task) => (task.id === taskId ? updated : task)),
              }
            : program,
        ),
      );
    } catch (error) {
      console.error('Complete task error:', error);
    }
  };

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
      >
        <Title style={styles.title}>Haftalik programlar</Title>
        <Paragraph style={styles.paragraph}>
          Onboarding verilerine gore olusan programlarini burada yonetebilirsin. Gorevleri tamamladikca isaretle.
        </Paragraph>

        <Button
          mode="contained-tonal"
          icon="lightbulb-on-outline"
          style={styles.planButton}
          onPress={startOnboarding}
        >
          Yapay zekadan yeni plan iste
        </Button>

        {aiPlan?.schedule?.length ? (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Yapay zeka önerilen haftalık plan</Title>
              <Paragraph style={styles.muted}>
                Bu önerileri kendi programına dönüştürmek için alttaki program listesine görev olarak ekleyebilirsin.
              </Paragraph>
              {aiPlan.schedule.map((item, index) => (
                <View key={`${item.day}-${index}`} style={styles.aiScheduleRow}>
                  <Paragraph style={styles.aiScheduleDay}>{item.day}</Paragraph>
                  <Paragraph style={styles.aiScheduleText}>
                    {item.focus}
                    {item.durationMinutes ? ` • ${item.durationMinutes} dk` : ''}
                  </Paragraph>
                </View>
              ))}
            </Card.Content>
          </Card>
        ) : null}

        {isLoading ? (
          <ActivityIndicator />
        ) : programs.length === 0 ? (
          <Paragraph style={styles.muted}>
            Henuz program olusturulmadi. Yapay zeka onerileri dogrultusunda hedef ekledikce burada gorunecek.
          </Paragraph>
        ) : (
          programs.map((program) => (
            <Card key={program.id} style={styles.card}>
              <Card.Title
                title={program.title}
                subtitle={`${program.startDate} - ${program.endDate}`}
              />
              <Card.Content>
                <Paragraph style={styles.muted}>
                  Tamamlanan gorev: {program.completedTasks}/{program.totalTasks} ({program.completionPercentage}%)
                </Paragraph>
                {program.tasks.length === 0 ? (
                  <Paragraph style={styles.muted}>Bu programa ait gorev bulunmuyor.</Paragraph>
                ) : (
                  program.tasks.map((task: ProgramTask) => (
                    <View key={task.id} style={styles.taskRow}>
                      <View style={styles.taskInfo}>
                        <Paragraph style={styles.taskTitle}>{task.title}</Paragraph>
                        <Paragraph style={styles.taskMeta}>
                          {task.taskDate} - {task.subjectName ?? 'Genel'}
                        </Paragraph>
                      </View>
                      <IconButton
                        icon={task.isCompleted ? 'check-circle' : 'checkbox-blank-circle-outline'}
                        onPress={() => handleCompleteTask(program.id, task.id)}
                        iconColor={task.isCompleted ? '#4CAF50' : undefined}
                      />
                    </View>
                  ))
                )}
              </Card.Content>
            </Card>
          ))
        )}
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
  planButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 1,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  muted: {
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  taskInfo: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontWeight: '600',
  },
  taskMeta: {
    fontSize: 12,
    color: '#666',
  },
  aiScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
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
});

export default ProgramsScreen;
