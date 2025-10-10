import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingIntroScreen from '../screens/onboarding/OnboardingIntroScreen';
import OnboardingAvailabilityScreen from '../screens/onboarding/OnboardingAvailabilityScreen';
import OnboardingSummaryScreen from '../screens/onboarding/OnboardingSummaryScreen';
import { OnboardingStackParamList } from '../types/navigation';

const Stack = createStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6200ee' },
      headerTintColor: '#fff',
    }}
  >
    <Stack.Screen
      name="Intro"
      component={OnboardingIntroScreen}
      options={{ title: 'Hedeflerini Planla' }}
    />
    <Stack.Screen
      name="Availability"
      component={OnboardingAvailabilityScreen}
      options={{ title: 'M�saitlik Saatlerin' }}
    />
    <Stack.Screen
      name="Summary"
      component={OnboardingSummaryScreen}
      options={{ title: 'Plani Onayla' }}
    />
  </Stack.Navigator>
);

export default OnboardingNavigator;