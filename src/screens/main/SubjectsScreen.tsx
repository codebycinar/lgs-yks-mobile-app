import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Paragraph,
  Title,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import contentService from '../../services/contentService';
import { Subject, Topic } from '../../types/content';

interface SubjectDetail {
  subject: Subject;
  stats: {
    learned: number;
    inProgress: number;
    needsReview: number;
    notStarted: number;
  };
  nextTopics: Topic[];
}

const SubjectsScreen: React.FC = () => {
  const [subjectDetails, setSubjectDetails] = useState<SubjectDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const loadSubjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const [subjects, topics, progress] = await Promise.all([
        contentService.getSubjects(),
        contentService.getTopicsForUser(),
        contentService.getUserProgress(),
      ]);

      const statusMap = new Map<string, string>();
      const safeProgress = progress.filter(
        (item) => typeof item.topicId === 'string' && item.topicId.length > 0,
      ) as Array<typeof progress[number] & { topicId: string }>;
      safeProgress.forEach((item) => {
        statusMap.set(item.topicId, item.status);
      });

      const details: SubjectDetail[] = subjects.map((subject) => {
        const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
        const stats = {
          learned: 0,
          inProgress: 0,
          needsReview: 0,
          notStarted: 0,
        };

        const annotatedTopics = subjectTopics.map((topic) => {
          const topicId = topic.id ?? '';
          const status = topicId ? statusMap.get(topicId) || 'not_started' : 'not_started';
          if (status === 'learned') stats.learned += 1;
          else if (status === 'in_progress') stats.inProgress += 1;
          else if (status === 'needs_review') stats.needsReview += 1;
          else stats.notStarted += 1;
          return { ...topic, id: topicId, status } as Topic;
        });

        const nextTopics = annotatedTopics
          .filter((topic) => topic.status !== 'learned')
          .slice(0, 3);

        return {
          subject,
          stats,
          nextTopics,
        };
      });

      setSubjectDetails(details);
    } catch (error) {
      console.error('Subjects load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [loadSubjects]),
  );

  const handleMarkLearned = async (topicId: string) => {
    if (!topicId) return;
    try {
      await contentService.markTopicProgress(topicId, 'learned');
      await loadSubjects();
    } catch (error) {
      console.error('Topic progress update error:', error);
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
        <Title style={styles.title}>Odak alanlarin</Title>
        <Paragraph style={styles.paragraph}>
          Her ders icin ilerlemeni takip et. Henuz tamamlanmamis konulari isaretleyerek yapay zekanin onerilerini guncel tutabilirsin.
        </Paragraph>

        {isLoading ? (
          <ActivityIndicator />
        ) : subjectDetails.length === 0 ? (
          <Paragraph style={styles.muted}>
            Ders verisi bulunamadi. Program yoneticisinden iceriklerin aktari oldugundan emin ol.
          </Paragraph>
        ) : (
          subjectDetails.map(({ subject, stats, nextTopics }) => (
            <Card key={subject.id} style={styles.card}>
              <Card.Title title={subject.name} />
              <Card.Content>
                <View style={styles.chipRow}>
                  <Chip icon="check" style={styles.chip}>
                    Ogrenilen: {stats.learned}
                  </Chip>
                  <Chip icon="play-circle" style={styles.chip}>
                    Devam: {stats.inProgress}
                  </Chip>
                  <Chip icon="refresh" style={styles.chip}>
                    Tekrar: {stats.needsReview}
                  </Chip>
                  <Chip icon="dots-horizontal" style={styles.chip}>
                    Baslanmadi: {stats.notStarted}
                  </Chip>
                </View>
                {nextTopics.length ? (
                  <>
                    <Paragraph style={styles.subTitle}>Sonraki adimlar</Paragraph>
                    {nextTopics.map((topic) => (
                      <View key={topic.id} style={styles.topicRow}>
                        <Paragraph style={styles.topicTitle}>{topic.name}</Paragraph>
                        <Button
                          mode="text"
                          onPress={() => handleMarkLearned(topic.id)}
                          compact
                        >
                          Ogrendim
                        </Button>
                      </View>
                    ))}
                  </>
                ) : (
                  <Paragraph style={styles.muted}>Bu derste tum konulari tamamladin!</Paragraph>
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
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 1,
    backgroundColor: '#ffffff',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  topicTitle: {
    flex: 1,
    marginRight: 8,
    color: '#444',
  },
  muted: {
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 12,
  },
});

export default SubjectsScreen;
