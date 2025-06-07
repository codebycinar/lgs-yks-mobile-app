import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  useTheme,
  Button,
  Chip,
  Surface,
  ProgressBar,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // Fake data - gerçek API'lardan gelecek
  const [dashboardData, setDashboardData] = useState({
    examDaysLeft: 45,
    overallProgress: 65,
    subjectProgress: [
      { name: 'Matematik', progress: 75, color: '#2196F3' },
      { name: 'Türkçe', progress: 60, color: '#4CAF50' },
      { name: 'Fen Bilimleri', progress: 70, color: '#FF9800' },
      { name: 'İnkılap Tarihi', progress: 55, color: '#9C27B0' },
    ],
    todayTasks: [
      { id: 1, title: 'Matematik - Denklemler', completed: false },
      { id: 2, title: 'Türkçe - Paragraf', completed: true },
      { id: 3, title: 'Fen - Madde ve Isı', completed: false },
    ],
    recentGoals: [
      { id: 1, title: 'Bu hafta 50 soru çöz', progress: 32, target: 50 },
      { id: 2, title: 'Matematik konularını bitir', progress: 8, target: 15 },
    ],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // API çağrıları burada yapılacak
      console.log('Dashboard verileri yükleniyor...');
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const getExamDateText = () => {
    const days = dashboardData.examDaysLeft;
    if (days > 30) {
      return `${days} gün`;
    } else if (days > 0) {
      return `${days} gün kaldı!`;
    } else {
      return 'Sınav geçti';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Karşılama Bölümü */}
      <Card style={[styles.card, { backgroundColor: theme.colors.primary }]}>
        <Card.Content>
          <Title style={[styles.greeting, { color: 'white' }]}>
            {getGreeting()}, {user?.name}!
          </Title>
          <Paragraph style={[styles.examInfo, { color: 'white' }]}>
            {user?.examName} sınavına {getExamDateText()}
          </Paragraph>
          <View style={styles.classInfo}>
            <Chip 
              mode=\"outlined\" 
              textStyle={{ color: 'white' }}
              style={styles.classChip}
            >
              {user?.className}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Genel İlerleme */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <Title style={styles.progressTitle}>Genel İlerleme</Title>
            <Title style={[styles.progressPercent, { color: theme.colors.primary }]}>
              %{dashboardData.overallProgress}
            </Title>
          </View>
          <ProgressBar 
            progress={dashboardData.overallProgress / 100} 
            style={styles.progressBar}
            color={theme.colors.primary}
          />
        </Card.Content>
      </Card>

      {/* Ders Bazında İlerleme */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Ders Bazında İlerleme</Title>
          {dashboardData.subjectProgress.map((subject, index) => (
            <View key={index} style={styles.subjectItem}>
              <View style={styles.subjectHeader}>
                <Paragraph style={styles.subjectName}>{subject.name}</Paragraph>
                <Paragraph style={styles.subjectPercent}>%{subject.progress}</Paragraph>
              </View>
              <ProgressBar 
                progress={subject.progress / 100} 
                style={styles.subjectProgress}
                color={subject.color}
              />
            </View>
          ))}
          <Button 
            mode=\"outlined\" 
            onPress={() => navigation.navigate('Subjects')}
            style={styles.viewAllButton}
          >
            Tüm Konuları Görüntüle
          </Button>
        </Card.Content>
      </Card>

      {/* Bugün Yapılacaklar */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Bugün Yapılacaklar</Title>
          {dashboardData.todayTasks.length === 0 ? (
            <Paragraph style={styles.emptyText}>
              Bugün için görev bulunmuyor
            </Paragraph>
          ) : (
            dashboardData.todayTasks.map((task) => (
              <Surface key={task.id} style={styles.taskItem}>
                <View style={styles.taskContent}>
                  <Paragraph 
                    style={[
                      styles.taskTitle,
                      task.completed && styles.taskCompleted
                    ]}
                  >
                    {task.title}
                  </Paragraph>
                  <Chip 
                    mode={task.completed ? 'flat' : 'outlined'}
                    compact
                    style={task.completed ? styles.completedChip : styles.pendingChip}
                  >
                    {task.completed ? 'Tamamlandı' : 'Bekliyor'}
                  </Chip>
                </View>
              </Surface>
            ))
          )}
          <Button 
            mode=\"outlined\" 
            onPress={() => navigation.navigate('Programs')}
            style={styles.viewAllButton}
          >
            Tüm Programı Görüntüle
          </Button>
        </Card.Content>
      </Card>

      {/* Hedefler */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Aktif Hedefler</Title>
          {dashboardData.recentGoals.length === 0 ? (
            <Paragraph style={styles.emptyText}>
              Henüz hedef belirlenmemiş
            </Paragraph>
          ) : (
            dashboardData.recentGoals.map((goal) => (
              <Surface key={goal.id} style={styles.goalItem}>
                <Paragraph style={styles.goalTitle}>{goal.title}</Paragraph>
                <View style={styles.goalProgress}>
                  <Paragraph style={styles.goalText}>
                    {goal.progress} / {goal.target}
                  </Paragraph>
                  <ProgressBar 
                    progress={goal.progress / goal.target} 
                    style={styles.goalProgressBar}
                    color={theme.colors.primary}
                  />
                </View>
              </Surface>
            ))
          )}
          <Button 
            mode=\"outlined\" 
            onPress={() => navigation.navigate('Goals')}
            style={styles.viewAllButton}
          >
            Tüm Hedefleri Görüntüle
          </Button>
        </Card.Content>
      </Card>

      {/* Çıkış Butonu */}
      <Card style={styles.card}>
        <Card.Content>
          <Button 
            mode=\"outlined\" 
            onPress={logout}
            style={styles.logoutButton}
            textColor={theme.colors.error}
          >
            Çıkış Yap
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  examInfo: {
    fontSize: 16,
    marginBottom: 12,
  },
  classInfo: {
    alignItems: 'flex-start',
  },
  classChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  subjectItem: {
    marginBottom: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
  },
  subjectPercent: {
    fontSize: 14,
    color: '#666',
  },
  subjectProgress: {
    height: 6,
    borderRadius: 3,
  },
  taskItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  completedChip: {
    backgroundColor: '#4CAF50',
  },
  pendingChip: {
    borderColor: '#FF9800',
  },
  goalItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    marginRight: 12,
    fontSize: 14,
    color: '#666',
    minWidth: 60,
  },
  goalProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  viewAllButton: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  bottomSpace: {
    height: 32,
  },
});

export default DashboardScreen;