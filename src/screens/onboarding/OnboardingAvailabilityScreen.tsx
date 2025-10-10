import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Title, Paragraph, TextInput, Chip, Surface } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../types/navigation';
import { AvailabilitySlotPayload } from '../../services/onboardingService';

type AvailabilityNavProp = StackNavigationProp<OnboardingStackParamList, 'Availability'>;
type AvailabilityRouteProp = RouteProp<OnboardingStackParamList, 'Availability'>;

interface Props {
  navigation: AvailabilityNavProp;
  route: AvailabilityRouteProp;
}

const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const defaultSlots: AvailabilitySlotPayload[] = [
  { dayOfWeek: 0, startTime: '18:00', endTime: '20:00' },
  { dayOfWeek: 2, startTime: '18:00', endTime: '20:00' },
  { dayOfWeek: 5, startTime: '10:00', endTime: '12:00' },
];

const OnboardingAvailabilityScreen: React.FC<Props> = ({ navigation, route }) => {
  const { profile } = route.params;
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [intensity, setIntensity] = useState('orta');
  const [availability, setAvailability] = useState<AvailabilitySlotPayload[]>(defaultSlots);

  const dailySlots = useMemo(
    () => availability.filter((slot) => slot.dayOfWeek === selectedDay),
    [availability, selectedDay]
  );

  const addSlot = () => {
    if (!startTime || !endTime) {
      return;
    }

    setAvailability((prev) => [
      ...prev,
      {
        dayOfWeek: selectedDay,
        startTime,
        endTime,
        intensity,
      },
    ]);
  };

  const removeSlot = (index: number) => {
    setAvailability((prev) =>
      prev.filter((slot, idx) => !(slot.dayOfWeek === selectedDay && dailySlots[index] === slot))
    );
  };

  const handleContinue = () => {
    navigation.navigate('Summary', {
      profile,
      availability,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Müsait Olduğun Zamanlar</Title>
      <Paragraph style={styles.paragraph}>
        Çalışma saatlerini seçerek uygulamanın planlamayı senin ritmine göre ayarlamasını sağlayabilirsin.
      </Paragraph>

      <View style={styles.section}>
        <Paragraph style={styles.sectionLabel}>Gün seç</Paragraph>
        <View style={styles.dayRow}>
          {dayNames.map((name, index) => (
            <Chip
              key={name}
              selected={selectedDay === index}
              onPress={() => setSelectedDay(index)}
              style={styles.dayChip}
            >
              {name}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Paragraph style={styles.sectionLabel}>Saat aralığı</Paragraph>
        <TextInput
          label="Başlangıç (HH:MM)"
          value={startTime}
          onChangeText={setStartTime}
          mode="outlined"
          style={styles.input}
          placeholder="18:00"
        />
        <TextInput
          label="Bitiş (HH:MM)"
          value={endTime}
          onChangeText={setEndTime}
          mode="outlined"
          style={styles.input}
          placeholder="20:00"
        />
        <TextInput
          label="Yoğunluk (düşük/orta/yüksek)"
          value={intensity}
          onChangeText={setIntensity}
          mode="outlined"
          style={styles.input}
          placeholder="orta"
        />
        <Button mode="outlined" onPress={addSlot} style={styles.button}>
          Ekle
        </Button>
      </View>

      <Paragraph style={styles.sectionLabel}>Seçili gün için saatler</Paragraph>
      {dailySlots.length === 0 ? (
        <Paragraph style={styles.emptyText}>Bu gün için henüz çalışma bloğu eklenmedi</Paragraph>
      ) : (
        dailySlots.map((slot, index) => (
          <Surface key={`${slot.dayOfWeek}-${index}`} style={styles.slotCard}>
            <Paragraph style={styles.slotText}>
              {slot.startTime} - {slot.endTime} • {slot.intensity ?? 'orta'}
            </Paragraph>
            <Button onPress={() => removeSlot(index)} compact>
              Sil
            </Button>
          </Surface>
        ))
      )}

      <Button mode="contained" onPress={handleContinue} style={styles.continueButton}>
        Sonraki Adım
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#555',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    marginRight: 8,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    alignSelf: 'flex-start',
  },
  slotCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotText: {
    fontSize: 15,
    color: '#444',
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  continueButton: {
    marginTop: 12,
  },
});

export default OnboardingAvailabilityScreen;

