import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Button,
  Chip,
  Paragraph,
  ProgressBar,
  Surface,
  TextInput,
  Title,
} from 'react-native-paper';
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

const dayNames = ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'];

const quickTemplates: Array<{ label: string; slots: AvailabilitySlotPayload[] }> = [
  {
    label: 'Hafta ici aksam',
    slots: [
      { dayOfWeek: 1, startTime: '19:00', endTime: '20:00' },
      { dayOfWeek: 3, startTime: '19:00', endTime: '20:00' },
    ],
  },
  {
    label: 'Hafta sonu sabah',
    slots: [
      { dayOfWeek: 5, startTime: '10:00', endTime: '11:30' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '11:30' },
    ],
  },
  {
    label: 'Kisa gunluk blok',
    slots: [
      { dayOfWeek: 0, startTime: '07:30', endTime: '08:00' },
      { dayOfWeek: 2, startTime: '07:30', endTime: '08:00' },
      { dayOfWeek: 4, startTime: '07:30', endTime: '08:00' },
    ],
  },
];

const OnboardingAvailabilityScreen: React.FC<Props> = ({ navigation, route }) => {
  const { profile } = route.params;
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [availability, setAvailability] = useState<AvailabilitySlotPayload[]>([]);
  const [dailyMinutes, setDailyMinutes] = useState('');
  const [weeklyMinutes, setWeeklyMinutes] = useState('');
  const [iosTimePicker, setIosTimePicker] = useState<{ mode: 'start' | 'end'; visible: boolean }>({
    mode: 'start',
    visible: false,
  });

  const dailySlots = useMemo(
    () => availability.filter((slot) => slot.dayOfWeek === selectedDay),
    [availability, selectedDay],
  );

  const openTimePicker = (mode: 'start' | 'end') => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'time',
        value: new Date(),
        onChange: (_, date) => {
          if (!date) return;
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          if (mode === 'start') {
            setStartTime(`${hours}:${minutes}`);
          } else {
            setEndTime(`${hours}:${minutes}`);
          }
        },
        is24Hour: true,
      });
    } else {
      setIosTimePicker({ mode, visible: true });
    }
  };

  const handleIosTimeChange = (_: unknown, date?: Date) => {
    setIosTimePicker((prev) => ({ ...prev, visible: false }));
    if (!date) return;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    if (iosTimePicker.mode === 'start') {
      setStartTime(`${hours}:${minutes}`);
    } else {
      setEndTime(`${hours}:${minutes}`);
    }
  };

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
      prev.filter((slot, idx) => !(slot.dayOfWeek === selectedDay && idx === index)),
    );
  };

  const applyTemplate = (template: AvailabilitySlotPayload[]) => {
    setAvailability(template);
  };

  const handleContinue = () => {
    const daily = dailyMinutes ? Number(dailyMinutes) : null;
    const weekly = weeklyMinutes ? Number(weeklyMinutes) : null;

    navigation.navigate('Summary', {
      profile: {
        ...profile,
        dailyAvailableMinutes: daily,
        weeklyAvailableMinutes: weekly,
      },
      availability,
    });
  };

  const handleDailyChange = (value: string) => {
    setDailyMinutes(value.replace(/[^0-9]/g, ''));
  };

  const handleWeeklyChange = (value: string) => {
    setWeeklyMinutes(value.replace(/[^0-9]/g, ''));
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: insets.top }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressBar progress={0.66} style={styles.progress} />

          <View style={styles.header}>
            <MaterialCommunityIcons name="calendar-clock" size={36} color="#6200ee" />
            <Title style={styles.title}>Ritmini yakalayalim</Title>
            <Paragraph style={styles.paragraph}>
              Hangi zamanlarda calismak veya aliskanliklarini uygulamak senin icin uygun?
            </Paragraph>
          </View>

          <Paragraph style={styles.sectionLabel}>Hizli sablon sec</Paragraph>
          <View style={styles.templateRow}>
            {quickTemplates.map((template) => (
              <Chip
                key={template.label}
                onPress={() => applyTemplate(template.slots)}
                style={styles.chip}
              >
                {template.label}
              </Chip>
            ))}
          </View>

          <Paragraph style={styles.sectionLabel}>Gun sec</Paragraph>
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

          <View style={styles.timeRow}>
            <Button mode="outlined" onPress={() => openTimePicker('start')} style={styles.timeButton}>
              Baslangic: {startTime}
            </Button>
            <Button mode="outlined" onPress={() => openTimePicker('end')} style={styles.timeButton}>
              Bitis: {endTime}
            </Button>
          </View>

          <Paragraph style={styles.sectionLabel}>Yogunluk</Paragraph>
          <View style={styles.intensityRow}>
            {[
              { label: 'Hafif', value: 'low' },
              { label: 'Orta', value: 'medium' },
              { label: 'Yuksek', value: 'high' },
            ].map((item) => (
              <Chip
                key={item.value}
                selected={intensity === item.value}
                onPress={() => setIntensity(item.value as typeof intensity)}
                style={styles.intensityChip}
              >
                {item.label}
              </Chip>
            ))}
          </View>

          <Button mode="outlined" onPress={addSlot} style={styles.addButton}>
            Bu blogu ekle
          </Button>
          {Platform.OS === 'ios' && iosTimePicker.visible ? (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="spinner"
              onChange={handleIosTimeChange}
            />
          ) : null}

          <Paragraph style={styles.sectionLabel}>Secili gun icin bloklar</Paragraph>
          {dailySlots.length === 0 ? (
            <Paragraph style={styles.emptyText}>Bu gun icin henuz blok eklenmedi.</Paragraph>
          ) : (
            dailySlots.map((slot, index) => (
              <Surface key={`${slot.dayOfWeek}-${index}`} style={styles.slotCard}>
                <Paragraph style={styles.slotText}>
                  {slot.startTime} - {slot.endTime} ({slot.intensity ?? 'orta'})
                </Paragraph>
                <Button onPress={() => removeSlot(index)} compact>
                  Sil
                </Button>
              </Surface>
            ))
          )}

          <Paragraph style={styles.sectionLabel}>Zaman ayirma niyetin</Paragraph>
          <View style={styles.numberRow}>
            <TextInput
              label="Gunluk dakika"
              value={dailyMinutes}
              onChangeText={handleDailyChange}
              keyboardType="numeric"
              mode="outlined"
              style={styles.numberInput}
              placeholder="Orn: 45"
              maxLength={3}
            />
            <TextInput
              label="Haftalik dakika"
              value={weeklyMinutes}
              onChangeText={handleWeeklyChange}
              keyboardType="numeric"
              mode="outlined"
              style={styles.numberInput}
              placeholder="Orn: 180"
              maxLength={4}
            />
          </View>

          <Button mode="contained" onPress={handleContinue} style={styles.continueButton}>
            Sonraki adim
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  progress: {
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 15,
  },
  templateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  timeButton: {
    flex: 1,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityChip: {
    flex: 1,
  },
  addButton: {
    marginTop: 12,
  },
  slotCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
  numberRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  numberInput: {
    flex: 1,
  },
  continueButton: {
    marginTop: 24,
  },
});

export default OnboardingAvailabilityScreen;
