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
  FAB,
  TextInput,
  Modal,
  Portal,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Goal } from '../../types/content';
import { useAuth } from '../../contexts/AuthContext';

interface GoalsScreenProps {
  navigation: any;
}

const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState('');
  const [newGoalModalVisible, setNewGoalModalVisible] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fake data - gerçek API'dan gelecek
      const mockGoals: Goal[] = [
        {
          id: 1,
          userId: user?.id || 1,
          description: 'Bu hafta 50 matematik sorusu çöz',
          targetDate: '2024-01-15',
          isCompleted: false,
          createdAt: '2024-01-08',
        },
        {
          id: 2,
          userId: user?.id || 1,
          description: 'Türkçe paragraf konusunu bitir',
          targetDate: '2024-01-20',
          isCompleted: true,
          completedAt: '2024-01-10',
          createdAt: '2024-01-05',
        },
        {
          id: 3,
          userId: user?.id || 1,
          description: 'Fen bilimleri test çöz',
          isCompleted: false,
          createdAt: '2024-01-12',
        },
      ];
      
      setGoals(mockGoals);
    } catch (error: any) {
      console.error('Goals loading error:', error);
      setError('Hedefler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  const toggleGoalComplete = async (goalId: number) => {
    try {
      // API çağrısı yapılacak
      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          return {
            ...goal,
            isCompleted: !goal.isCompleted,
            completedAt: !goal.isCompleted ? new Date().toISOString() : undefined,
          };
        }
        return goal;
      });
      setGoals(updatedGoals);
    } catch (error: any) {
      Alert.alert('Hata', 'Hedef durumu güncellenirken hata oluştu');
    }
  };

  const createNewGoal = async () => {
    if (!newGoalText.trim()) {
      Alert.alert('Hata', 'Hedef açıklaması gerekli');
      return;
    }

    try {
      // API çağrısı yapılacak
      const newGoal: Goal = {
        id: Date.now(), // Geçici ID
        userId: user?.id || 1,
        description: newGoalText.trim(),
        targetDate: newGoalDate || undefined,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };

      setGoals([newGoal, ...goals]);
      setNewGoalModalVisible(false);
      setNewGoalText('');
      setNewGoalDate('');
    } catch (error: any) {
      Alert.alert('Hata', 'Hedef oluşturulurken hata oluştu');
    }
  };

  const deleteGoal = async (goalId: number) => {
    Alert.alert(
      'Hedefi Sil',
      'Bu hedefi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // API çağrısı yapılacak
              setGoals(goals.filter(goal => goal.id !== goalId));
            } catch (error: any) {
              Alert.alert('Hata', 'Hedef silinirken hata oluştu');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const isOverdue = (targetDate?: string) => {
    if (!targetDate) return false;
    return new Date(targetDate) < new Date();
  };

  const getDaysUntilTarget = (targetDate?: string) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCompletedGoalsCount = () => {
    return goals.filter(goal => goal.isCompleted).length;
  };

  const getPendingGoalsCount = () => {
    return goals.filter(goal => !goal.isCompleted).length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Paragraph style={styles.loadingText}>Hedefler yükleniyor...</Paragraph>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#F44336" />
        <Paragraph style={styles.errorText}>{error}</Paragraph>
        <Button mode="contained" onPress={loadGoals}>
          Tekrar Dene
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* İstatistikler */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>Hedef İstatistikleri</Title>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Title style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {goals.length}
                </Title>
                <Paragraph style={styles.statLabel}>Toplam</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={[styles.statNumber, { color: '#4CAF50' }]}>
                  {getCompletedGoalsCount()}
                </Title>
                <Paragraph style={styles.statLabel}>Tamamlanan</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={[styles.statNumber, { color: '#FF9800' }]}>
                  {getPendingGoalsCount()}
                </Title>
                <Paragraph style={styles.statLabel}>Devam Eden</Paragraph>
              </View>
            </View>
            
            {goals.length > 0 && (
              <View style={styles.progressSection}>
                <Paragraph style={styles.progressLabel}>
                  Tamamlanma Oranı: %{Math.round((getCompletedGoalsCount() / goals.length) * 100)}
                </Paragraph>
                <ProgressBar 
                  progress={getCompletedGoalsCount() / goals.length} 
                  style={styles.progressBar}
                  color={theme.colors.primary}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Hedefler Listesi */}
        {goals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="flag" size={64} color="#ccc" />
              <Title style={styles.emptyTitle}>Henüz hedef yok</Title>
              <Paragraph style={styles.emptyText}>
                İlk hedefinizi oluşturmak için + butonuna tıklayın
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          goals.map((goal) => {
            const daysUntilTarget = getDaysUntilTarget(goal.targetDate);
            const overdue = isOverdue(goal.targetDate);
            
            return (
              <Card key={goal.id} style={styles.goalCard}>
                <Card.Content>
                  <View style={styles.goalHeader}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => toggleGoalComplete(goal.id)}
                    >
                      <Icon
                        name={goal.isCompleted ? 'check-box' : 'check-box-outline-blank'}
                        size={24}
                        color={goal.isCompleted ? '#4CAF50' : '#ccc'}
                      />
                    </TouchableOpacity>
                    <View style={styles.goalContent}>
                      <Paragraph 
                        style={[
                          styles.goalDescription,
                          goal.isCompleted && styles.completedGoal
                        ]}
                      >
                        {goal.description}
                      </Paragraph>
                      
                      {goal.targetDate && (
                        <View style={styles.goalMeta}>
                          <Chip
                            mode="outlined"
                            compact
                            style={[
                              styles.dateChip,
                              overdue && !goal.isCompleted && styles.overdueChip,
                              goal.isCompleted && styles.completedChip
                            ]}
                          >
                            {goal.isCompleted 
                              ? `Tamamlandı: ${formatDate(goal.completedAt!)}`
                              : overdue
                                ? `${Math.abs(daysUntilTarget!)} gün geçti`
                                : daysUntilTarget === 0
                                  ? 'Bugün'
                                  : daysUntilTarget === 1
                                    ? 'Yarın'
                                    : `${daysUntilTarget} gün kaldı`
                            }
                          </Chip>
                        </View>
                      )}
                      
                      <Paragraph style={styles.goalDate}>
                        Oluşturuldu: {formatDate(goal.createdAt)}
                      </Paragraph>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteGoal(goal.id)}
                    >
                      <Icon name="delete-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Yeni Hedef FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setNewGoalModalVisible(true)}
      />

      {/* Yeni Hedef Modal */}
      <Portal>
        <Modal
          visible={newGoalModalVisible}
          onDismiss={() => setNewGoalModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Yeni Hedef Oluştur</Title>
          
          <TextInput
            label="Hedef Açıklaması"
            value={newGoalText}
            onChangeText={setNewGoalText}
            mode="outlined"
            multiline
            style={styles.modalInput}
            placeholder="Örn: Bu hafta 20 matematik sorusu çöz"
          />
          
          <TextInput
            label="Hedef Tarihi (Opsiyonel)"
            value={newGoalDate}
            onChangeText={setNewGoalDate}
            mode="outlined"
            style={styles.modalInput}
            placeholder="YYYY-MM-DD"
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setNewGoalModalVisible(false)}
              style={styles.modalButton}
            >
              İptal
            </Button>
            <Button
              mode="contained"
              onPress={createNewGoal}
              style={styles.modalButton}
            >
              Oluştur
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
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
  statsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    marginTop: 16,
  },
  progressLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  goalCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  goalContent: {
    flex: 1,
  },
  goalDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  completedGoal: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  goalMeta: {
    marginBottom: 8,
  },
  dateChip: {
    alignSelf: 'flex-start',
  },
  overdueChip: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  completedChip: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  goalDate: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    minWidth: 80,
  },
  bottomSpace: {
    height: 80,
  },
});

export default GoalsScreen;