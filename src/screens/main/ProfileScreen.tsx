import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  useTheme,
  Button,
  Divider,
  List,
  Avatar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getGenderText = (gender: string) => {
    return gender === 'male' ? 'Erkek' : 'Kız';
  };

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Kullanıcı Bilgileri */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={getInitials(user?.name || '', user?.surname || '')}
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          />
          <Title style={styles.userName}>
            {user?.name} {user?.surname}
          </Title>
          <Paragraph style={styles.userPhone}>
            +90 {user?.phoneNumber}
          </Paragraph>
          <View style={styles.userDetails}>
            <Paragraph style={styles.userDetail}>
              <Icon name="school" size={16} color="#666" /> {user?.className}
            </Paragraph>
            <Paragraph style={styles.userDetail}>
              <Icon name="assignment" size={16} color="#666" /> {user?.examName}
            </Paragraph>
            <Paragraph style={styles.userDetail}>
              <Icon name={user?.gender === 'male' ? 'person' : 'person-outline'} size={16} color="#666" /> 
              {' '}{getGenderText(user?.gender || '')}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      {/* Hesap Bilgileri */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Hesap Bilgileri</Title>
          <List.Item
            title="Kayıt Tarihi"
            description={formatDate(user?.createdAt || '')}
            left={(props) => <List.Icon {...props} icon="calendar" />}
          />
          <Divider />
          <List.Item
            title="Hesap Durumu"
            description="Aktif"
            left={(props) => <List.Icon {...props} icon="check-circle" color="#4CAF50" />}
          />
        </Card.Content>
      </Card>

      {/* İstatistikler */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>İstatistikler</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Title style={[styles.statNumber, { color: theme.colors.primary }]}>
                0
              </Title>
              <Paragraph style={styles.statLabel}>Tamamlanan Konu</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={[styles.statNumber, { color: '#4CAF50' }]}>
                0
              </Title>
              <Paragraph style={styles.statLabel}>Hedef</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={[styles.statNumber, { color: '#FF9800' }]}>
                0
              </Title>
              <Paragraph style={styles.statLabel}>Program</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={[styles.statNumber, { color: '#9C27B0' }]}>
                0
              </Title>
              <Paragraph style={styles.statLabel}>Çözülen Soru</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Ayarlar */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Ayarlar</Title>
          <List.Item
            title="Bildirimler"
            description="Hatırlatma bildirimleri"
            left={(props) => <List.Icon {...props} icon="notifications" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Bildirim ayarları modal açılacak
            }}
          />
          <Divider />
          <List.Item
            title="Gizlilik Politikası"
            left={(props) => <List.Icon {...props} icon="privacy-tip" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Gizlilik politikası sayfası açılacak
            }}
          />
          <Divider />
          <List.Item
            title="Hakkında"
            description="Versiyon 1.0.0"
            left={(props) => <List.Icon {...props} icon="info" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Hakkında sayfası açılacak
            }}
          />
        </Card.Content>
      </Card>

      {/* Çıkış */}
      <Card style={styles.logoutCard}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={theme.colors.error}
            buttonColor="transparent"
            icon="logout"
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
  profileCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  userDetails: {
    alignItems: 'center',
    gap: 8,
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  settingsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  logoutCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: '#F44336',
  },
  bottomSpace: {
    height: 32,
  },
});

export default ProfileScreen;