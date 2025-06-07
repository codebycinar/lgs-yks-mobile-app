import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  useTheme,
  ActivityIndicator,
  Button,
  Chip,
  Surface,
  ProgressBar,
  List,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import contentService from '../../services/contentService';
import { Subject, Topic, UserTopicProgress } from '../../types/content';
import { useAuth } from '../../contexts/AuthContext';

interface SubjectsScreenProps {
  navigation: any;
}

interface SubjectWithTopics extends Subject {
  topics: Topic[];
  progress: {
    total: number;
    learned: number;
    inProgress: number;
  };
}

const SubjectsScreen: React.FC<SubjectsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subjects, setSubjects] = useState<SubjectWithTopics[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubjectsAndTopics();
  }, []);

  const loadSubjectsAndTopics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Kullanıcının sınıfına göre konuları getir
      const [subjectsData, topicsData] = await Promise.all([
        contentService.getSubjects(),
        contentService.getTopicsForUser(),
      ]);

      // Konuları derse göre grupla
      const subjectsWithTopics: SubjectWithTopics[] = subjectsData
        .filter(subject => subject.isActive)
        .map(subject => {
          const subjectTopics = topicsData.filter(topic => 
            topic.subjectId === subject.id && topic.isActive
          );
          
          // İlerleme hesapla
          const progress = {
            total: subjectTopics.length,
            learned: 0, // API'dan gelecek
            inProgress: 0, // API'dan gelecek
          };

          return {
            ...subject,
            topics: subjectTopics,
            progress,
          };
        })
        .filter(subject => subject.topics.length > 0);

      setSubjects(subjectsWithTopics);
    } catch (error: any) {
      console.error('Subjects loading error:', error);
      setError('Dersler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubjectsAndTopics();
    setRefreshing(false);
  };

  const toggleSubject = (subjectId: number) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const markTopicProgress = async (
    topicId: number, 
    status: 'not_started' | 'in_progress' | 'learned' | 'needs_review'
  ) => {
    try {
      await contentService.markTopicProgress(topicId, status);
      // İlerlemeleri yeniden yükle
      await loadSubjectsAndTopics();
    } catch (error: any) {
      Alert.alert('Hata', 'Konu durumu güncellenirken hata oluştu');
    }
  };

  const getProgressPercentage = (progress: any) => {
    if (progress.total === 0) return 0;
    return Math.round(((progress.learned + progress.inProgress * 0.5) / progress.total) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'learned': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      case 'needs_review': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'learned': return 'Öğrenildi';
      case 'in_progress': return 'Devam Ediyor';
      case 'needs_review': return 'Tekrar Gerekli';
      default: return 'Başlanmadı';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Paragraph style={styles.loadingText}>Dersler yükleniyor...</Paragraph>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#F44336" />
        <Paragraph style={styles.errorText}>{error}</Paragraph>
        <Button mode="contained" onPress={loadSubjectsAndTopics}>
          Tekrar Dene
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Genel İlerleme */}
      <Card style={styles.overallCard}>
        <Card.Content>
          <Title style={styles.overallTitle}>Genel İlerleme</Title>
          <Paragraph style={styles.className}>{user?.className}</Paragraph>
          <View style={styles.overallStats}>
            <Chip mode="outlined" icon="school">
              {subjects.length} Ders
            </Chip>
            <Chip mode="outlined" icon="list">
              {subjects.reduce((total, subject) => total + subject.topics.length, 0)} Konu
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Dersler Listesi */}
      {subjects.map((subject) => {
        const isExpanded = expandedSubjects.has(subject.id);
        const progressPercent = getProgressPercentage(subject.progress);
        
        return (
          <Card key={subject.id} style={styles.subjectCard}>
            <TouchableOpacity onPress={() => toggleSubject(subject.id)}>
              <Card.Content>
                <View style={styles.subjectHeader}>
                  <View style={styles.subjectInfo}>
                    <Title style={styles.subjectTitle}>{subject.name}</Title>
                    <Paragraph style={styles.subjectStats}>
                      {subject.topics.length} konu • {progressPercent}% tamamlandı
                    </Paragraph>
                  </View>
                  <Icon 
                    name={isExpanded ? 'expand-less' : 'expand-more'} 
                    size={24} 
                    color={theme.colors.primary}
                  />
                </View>
                
                <ProgressBar 
                  progress={progressPercent / 100} 
                  style={styles.subjectProgress}
                  color={theme.colors.primary}
                />
              </Card.Content>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.topicsContainer}>
                <Divider />
                {subject.topics.map((topic, index) => (
                  <Surface key={topic.id} style={styles.topicItem}>
                    <View style={styles.topicContent}>
                      <View style={styles.topicInfo}>
                        <Paragraph style={styles.topicName}>{topic.name}</Paragraph>
                        {topic.parentName && (
                          <Paragraph style={styles.parentTopic}>
                            Alt konu: {topic.parentName}
                          </Paragraph>
                        )}
                      </View>
                      <View style={styles.topicActions}>
                        <TouchableOpacity
                          style={[
                            styles.statusButton,
                            { backgroundColor: getStatusColor('not_started') }
                          ]}
                          onPress={() => markTopicProgress(topic.id, 'in_progress')}
                        >
                          <Icon name="play-arrow" size={16} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.statusButton,
                            { backgroundColor: getStatusColor('learned') }
                          ]}
                          onPress={() => markTopicProgress(topic.id, 'learned')}
                        >
                          <Icon name="check" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Surface>
                ))}
              </View>
            )}
          </Card>
        );
      })}

      {subjects.length === 0 && (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Icon name="school" size={64} color="#ccc" />
            <Title style={styles.emptyTitle}>Henüz ders bulunamadı</Title>
            <Paragraph style={styles.emptyText}>
              Sınıfınız için ders ve konular henüz eklenmemiş.
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#F44336',
  },
  overallCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  overallTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  className: {
    color: '#666',
    marginBottom: 12,
  },
  overallStats: {
    flexDirection: 'row',
    gap: 8,
  },
  subjectCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  subjectStats: {
    fontSize: 14,
    color: '#666',
  },
  subjectProgress: {
    height: 6,
    borderRadius: 3,
  },
  topicsContainer: {
    backgroundColor: '#f8f8f8',
  },
  topicItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  topicContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicInfo: {
    flex: 1,
    marginRight: 12,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '500',
  },
  parentTopic: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  topicActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    margin: 16,
    elevation: 4,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  bottomSpace: {
    height: 32,
  },
});

export default SubjectsScreen;