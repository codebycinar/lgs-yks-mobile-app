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
  FAB,
  TextInput,
  Modal,
  Portal,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WeeklyProgram, ProgramTask } from '../../types/content';
import { useAuth } from '../../contexts/AuthContext';

interface ProgramsScreenProps {
  navigation: any;
}

const ProgramsScreen: React.FC<ProgramsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [programs, setPrograms] = useState<WeeklyProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WeeklyProgram | null>(null);
  const [error, setError] = useState('');
  const [newProgramModalVisible, setNewProgramModalVisible] = useState(false);
  const [newTaskModalVisible, setNewTaskModalVisible] = useState(false);
  const [newProgramTitle, setNewProgramTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fake data - gerçek API'dan gelecek
      const mockPrograms: WeeklyProgram[] = [
        {
          id: 1,
          userId: user?.id || 1,
          startDate: '2024-01-15',
          endDate: '2024-01-21',
          title: '15-21 Ocak Haftalık Program',
          createdAt: '2024-01-14',
          tasks: [
            {
              id: 1,
              weeklyProgramId: 1,
              description: 'Matematik denklemler konusunu çalış',
              taskDate: '2024-01-15',
              isCompleted: true,
              completedAt: '2024-01-15T10:30:00Z',
              topicId: 1,
              topicName: 'Denklemler',
              createdAt: '2024-01-14',
            },
            {
              id: 2,
              weeklyProgramId: 1,
              description: 'Türkçe paragraf soruları çöz',
              taskDate: '2024-01-16',
              isCompleted: false,
              topicId: 2,
              topicName: 'Paragraf',
              createdAt: '2024-01-14',
            },
            {
              id: 3,
              weeklyProgramId: 1,
              description: 'Fen bilimleri test çöz',
              taskDate: '2024-01-17',
              isCompleted: false,
              createdAt: '2024-01-14',
            },
          ],
        },
        {
          id: 2,
          userId: user?.id || 1,
          startDate: '2024-01-22',
          endDate: '2024-01-28',
          title: '22-28 Ocak Haftalık Program',
          createdAt: '2024-01-21',
          tasks: [],
        },
      ];
      
      setPrograms(mockPrograms);
      if (mockPrograms.length > 0 && !selectedProgram) {
        setSelectedProgram(mockPrograms[0]);
      }
    } catch (error: any) {
      console.error('Programs loading error:', error);
      setError('Programlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrograms();
    setRefreshing(false);
  };

  const toggleTaskComplete = async (taskId: number) => {
    if (!selectedProgram) return;

    try {
      // API çağrısı yapılacak
      const updatedTasks = selectedProgram.tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            isCompleted: !task.isCompleted,
            completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
          };
        }
        return task;
      });

      const updatedProgram = { ...selectedProgram, tasks: updatedTasks };
      setSelectedProgram(updatedProgram);
      
      // Programs listesini de güncelle
      setPrograms(programs.map(p => p.id === selectedProgram.id ? updatedProgram : p));
    } catch (error: any) {
      Alert.alert('Hata', 'Görev durumu güncellenirken hata oluştu');
    }
  };

  const createNewProgram = async () => {
    if (!newProgramTitle.trim()) {
      Alert.alert('Hata', 'Program başlığı gerekli');
      return;
    }

    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Pazartesi
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Pazar

      const newProgram: WeeklyProgram = {
        id: Date.now(),
        userId: user?.id || 1,
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
        title: newProgramTitle.trim(),
        createdAt: new Date().toISOString(),
        tasks: [],
      };

      setPrograms([newProgram, ...programs]);
      setSelectedProgram(newProgram);
      setNewProgramModalVisible(false);
      setNewProgramTitle('');
    } catch (error: any) {
      Alert.alert('Hata', 'Program oluşturulurken hata oluştu');
    }
  };

  const addNewTask = async () => {
    if (!newTaskDescription.trim() || !selectedProgram) {
      Alert.alert('Hata', 'Görev açıklaması gerekli');
      return;
    }

    try {
      const newTask: ProgramTask = {
        id: Date.now(),
        weeklyProgramId: selectedProgram.id,
        description: newTaskDescription.trim(),
        taskDate: newTaskDate || new Date().toISOString().split('T')[0],
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };

      const updatedProgram = {
        ...selectedProgram,
        tasks: [...selectedProgram.tasks, newTask],
      };

      setSelectedProgram(updatedProgram);
      setPrograms(programs.map(p => p.id === selectedProgram.id ? updatedProgram : p));
      
      setNewTaskModalVisible(false);
      setNewTaskDescription('');
      setNewTaskDate('');
    } catch (error: any) {
      Alert.alert('Hata', 'Görev eklenirken hata oluştu');
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!selectedProgram) return;

    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTasks = selectedProgram.tasks.filter(task => task.id !== taskId);
              const updatedProgram = { ...selectedProgram, tasks: updatedTasks };
              
              setSelectedProgram(updatedProgram);
              setPrograms(programs.map(p => p.id === selectedProgram.id ? updatedProgram : p));
            } catch (error: any) {
              Alert.alert('Hata', 'Görev silinirken hata oluştu');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getTasksForDate = (date: string) => {
    if (!selectedProgram) return [];
    return selectedProgram.tasks.filter(task => task.taskDate === date);
  };

  const getCompletedTasksCount = () => {
    if (!selectedProgram) return 0;
    return selectedProgram.tasks.filter(task => task.isCompleted).length;
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isPast = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString < today;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Paragraph style={styles.loadingText}>Programlar yükleniyor...</Paragraph>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#F44336" />
        <Paragraph style={styles.errorText}>{error}</Paragraph>
        <Button mode="contained" onPress={loadPrograms}>
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
        {/* Program Seçimi */}
        <Card style={styles.programSelectorCard}>
          <Card.Content>
            <Title style={styles.selectorTitle}>Haftalık Programlar</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.programChips}>
                {programs.map((program) => (
                  <Chip
                    key={program.id}
                    mode={selectedProgram?.id === program.id ? 'flat' : 'outlined'}
                    selected={selectedProgram?.id === program.id}
                    onPress={() => setSelectedProgram(program)}
                    style={styles.programChip}
                  >
                    {program.title}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {selectedProgram ? (
          <>
            {/* Program Detayları */}
            <Card style={styles.programDetailsCard}>
              <Card.Content>
                <Title style={styles.programTitle}>{selectedProgram.title}</Title>
                <Paragraph style={styles.programDates}>
                  {formatDateRange(selectedProgram.startDate, selectedProgram.endDate)}
                </Paragraph>
                
                <View style={styles.programStats}>
                  <View style={styles.statItem}>
                    <Title style={[styles.statNumber, { color: theme.colors.primary }]}>
                      {selectedProgram.tasks.length}
                    </Title>
                    <Paragraph style={styles.statLabel}>Toplam Görev</Paragraph>
                  </View>
                  <View style={styles.statItem}>
                    <Title style={[styles.statNumber, { color: '#4CAF50' }]}>
                      {getCompletedTasksCount()}
                    </Title>
                    <Paragraph style={styles.statLabel}>Tamamlanan</Paragraph>
                  </View>
                  <View style={styles.statItem}>
                    <Title style={[styles.statNumber, { color: '#FF9800' }]}>
                      {selectedProgram.tasks.length - getCompletedTasksCount()}
                    </Title>
                    <Paragraph style={styles.statLabel}>Kalan</Paragraph>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Günlük Görevler */}
            {selectedProgram.tasks.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="assignment" size={64} color="#ccc" />
                  <Title style={styles.emptyTitle}>Henüz görev yok</Title>
                  <Paragraph style={styles.emptyText}>
                    Bu programa görev eklemek için + butonuna tıklayın
                  </Paragraph>
                </Card.Content>
              </Card>
            ) : (
              // Görevleri tarihe göre grupla
              (() => {
                const tasksByDate: { [key: string]: ProgramTask[] } = {};
                selectedProgram.tasks.forEach(task => {
                  if (!tasksByDate[task.taskDate]) {
                    tasksByDate[task.taskDate] = [];
                  }
                  tasksByDate[task.taskDate].push(task);
                });

                return Object.keys(tasksByDate)
                  .sort()
                  .map(date => (
                    <Card key={date} style={styles.dayCard}>
                      <Card.Content>
                        <View style={styles.dayHeader}>
                          <Title style={styles.dayTitle}>
                            {formatDate(date)}
                            {isToday(date) && (
                              <Chip mode="flat" compact style={styles.todayChip}>
                                Bugün
                              </Chip>
                            )}
                          </Title>
                          <Paragraph style={styles.dayTaskCount}>
                            {tasksByDate[date].filter(t => t.isCompleted).length} / {tasksByDate[date].length} tamamlandı
                          </Paragraph>
                        </View>
                        
                        <Divider style={styles.dayDivider} />
                        
                        {tasksByDate[date].map((task) => (
                          <Surface key={task.id} style={styles.taskItem}>
                            <View style={styles.taskContent}>
                              <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => toggleTaskComplete(task.id)}
                              >
                                <Icon
                                  name={task.isCompleted ? 'check-box' : 'check-box-outline-blank'}
                                  size={24}
                                  color={task.isCompleted ? '#4CAF50' : '#ccc'}
                                />
                              </TouchableOpacity>
                              
                              <View style={styles.taskInfo}>
                                <Paragraph 
                                  style={[
                                    styles.taskDescription,
                                    task.isCompleted && styles.completedTask
                                  ]}
                                >
                                  {task.description}
                                </Paragraph>
                                {task.topicName && (
                                  <Chip mode="outlined" compact style={styles.topicChip}>
                                    {task.topicName}
                                  </Chip>
                                )}
                                {task.completedAt && (
                                  <Paragraph style={styles.completedTime}>
                                    Tamamlandı: {new Date(task.completedAt).toLocaleTimeString('tr-TR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </Paragraph>
                                )}
                              </View>
                              
                              <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => deleteTask(task.id)}
                              >
                                <Icon name="delete-outline" size={20} color="#F44336" />
                              </TouchableOpacity>
                            </View>
                          </Surface>
                        ))}
                      </Card.Content>
                    </Card>
                  ));
              })()
            )}
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="event-note" size={64} color="#ccc" />
              <Title style={styles.emptyTitle}>Program bulunamadı</Title>
              <Paragraph style={styles.emptyText}>
                Yeni bir haftalık program oluşturmak için + butonuna tıklayın
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* FAB Menu */}
      <View style={styles.fabContainer}>
        {selectedProgram && (
          <FAB
            icon="add-task"
            style={[styles.fab, styles.secondaryFab]}
            size="small"
            onPress={() => setNewTaskModalVisible(true)}
          />
        )}
        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => setNewProgramModalVisible(true)}
        />
      </View>

      {/* Yeni Program Modal */}
      <Portal>
        <Modal
          visible={newProgramModalVisible}
          onDismiss={() => setNewProgramModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Yeni Program Oluştur</Title>
          
          <TextInput
            label="Program Başlığı"
            value={newProgramTitle}
            onChangeText={setNewProgramTitle}
            mode="outlined"
            style={styles.modalInput}
            placeholder="Örn: 15-21 Ocak Haftalık Program"
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setNewProgramModalVisible(false)}
              style={styles.modalButton}
            >
              İptal
            </Button>
            <Button
              mode="contained"
              onPress={createNewProgram}
              style={styles.modalButton}
            >
              Oluştur
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Yeni Görev Modal */}
      <Portal>
        <Modal
          visible={newTaskModalVisible}
          onDismiss={() => setNewTaskModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Yeni Görev Ekle</Title>
          
          <TextInput
            label="Görev Açıklaması"
            value={newTaskDescription}
            onChangeText={setNewTaskDescription}
            mode="outlined"
            multiline
            style={styles.modalInput}
            placeholder="Örn: Matematik denklemler konusunu çalış"
          />
          
          <TextInput
            label="Görev Tarihi"
            value={newTaskDate}
            onChangeText={setNewTaskDate}
            mode="outlined"
            style={styles.modalInput}
            placeholder="YYYY-MM-DD (boş bırakılırsa bugün)"
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setNewTaskModalVisible(false)}
              style={styles.modalButton}
            >
              İptal
            </Button>
            <Button
              mode="contained"
              onPress={addNewTask}
              style={styles.modalButton}
            >
              Ekle
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
  programSelectorCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  selectorTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  programChips: {
    flexDirection: 'row',
    gap: 8,
  },
  programChip: {
    marginRight: 8,
  },
  programDetailsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  programTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  programDates: {
    color: '#666',
    marginBottom: 16,
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  dayCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 18,
    flex: 1,
  },
  todayChip: {
    marginLeft: 8,
    backgroundColor: '#E3F2FD',
  },
  dayTaskCount: {
    fontSize: 14,
    color: '#666',
  },
  dayDivider: {
    marginBottom: 12,
  },
  taskItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  topicChip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  completedTime: {
    fontSize: 12,
    color: '#4CAF50',
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
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    alignItems: 'flex-end',
  },
  fab: {
    marginBottom: 8,
  },
  secondaryFab: {
    backgroundColor: '#FF9800',
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
    height: 100,
  },
});

export default ProgramsScreen;