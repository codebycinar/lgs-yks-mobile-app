import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Paragraph, Title } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, onboardingData, logout, startOnboarding } = useAuth();
  const profile = onboardingData?.profile;
  const aiPlan = onboardingData?.aiPlan;
  const insets = useSafeAreaInsets();

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
        <Card style={styles.card}>
          <Card.Title title="Profil" />
          <Card.Content>
            <Title style={styles.name}>
              {user?.name} {user?.surname}
            </Title>
            <Paragraph>Telefon: {user?.phoneNumber}</Paragraph>
            <Paragraph>Profil tipi: {profile?.profileType ?? 'Belirtilmedi'}</Paragraph>
            <Paragraph>Sinif: {user?.className ?? 'Belirtilmedi'}</Paragraph>
            <Paragraph>Sinav: {user?.examName ?? 'Belirtilmedi'}</Paragraph>
            {profile?.primaryGoal ? (
              <Paragraph style={styles.highlight}>
                Ana hedef: {profile.primaryGoal}
              </Paragraph>
            ) : null}
            {profile?.motivation ? (
              <Paragraph style={styles.muted}>
                Motive eden: {profile.motivation}
              </Paragraph>
            ) : null}
            {profile?.targetDate ? (
              <Paragraph style={styles.muted}>
                Hedef tarih: {profile.targetDate}
              </Paragraph>
            ) : null}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Odak alanlari" />
          <Card.Content>
            {profile?.studyFocusAreas?.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {profile.studyFocusAreas.map((area) => (
                  <Chip key={area} style={styles.chip}>
                    {area}
                  </Chip>
                ))}
              </ScrollView>
            ) : (
              <Paragraph style={styles.muted}>
                Odak alani secmedin. Onboarding ekranindan guncelleyebilirsin.
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {aiPlan ? (
          <Card style={styles.card}>
            <Card.Title title="Yapay zeka plani" subtitle={aiPlan.provider ? `Kaynak: ${aiPlan.provider}` : undefined} />
            <Card.Content>
              <Paragraph style={styles.bold}>{aiPlan.summary}</Paragraph>
              {aiPlan.goals?.length ? (
                <>
                  <Paragraph style={styles.subTitle}>Onerilen hedefler</Paragraph>
                  {aiPlan.goals.map((goal) => (
                    <Paragraph key={goal.title} style={styles.listItem}>
                      - {goal.title}
                    </Paragraph>
                  ))}
                </>
              ) : null}
              {aiPlan.habits?.length ? (
                <>
                  <Paragraph style={styles.subTitle}>Aliskanlik onerileri</Paragraph>
                  {aiPlan.habits.map((habit) => (
                    <Paragraph key={habit.name} style={styles.listItem}>
                      - {habit.name} ({habit.frequency})
                    </Paragraph>
                  ))}
                </>
              ) : null}
            </Card.Content>
          </Card>
        ) : null}

        <Button mode="contained" onPress={logout} style={styles.logoutButton}>
          Cikis yap
        </Button>
        <Button
          mode="contained-tonal"
          icon="refresh"
          onPress={startOnboarding}
          style={styles.onboardingButton}
        >
          Onboarding adimlarini yeniden baslat
        </Button>
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
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 1,
    backgroundColor: '#ffffff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  highlight: {
    marginTop: 8,
    fontWeight: '600',
  },
  muted: {
    color: '#777',
    marginTop: 4,
  },
  chip: {
    marginRight: 8,
  },
  bold: {
    fontWeight: '600',
    marginBottom: 6,
  },
  subTitle: {
    marginTop: 8,
    fontWeight: '600',
  },
  listItem: {
    color: '#555',
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 12,
  },
  onboardingButton: {
    marginTop: 12,
  },
});

export default ProfileScreen;
