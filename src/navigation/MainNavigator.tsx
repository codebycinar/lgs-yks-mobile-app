import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashboardScreen from '../screens/main/DashboardScreen';
import SubjectsScreen from '../screens/main/SubjectsScreen';
import GoalsScreen from '../screens/main/GoalsScreen';
import ProgramsScreen from '../screens/main/ProgramsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Subjects: undefined;
  Goals: undefined;
  Programs: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Dashboard':
            iconName = 'dashboard';
            break;
          case 'Subjects':
            iconName = 'school';
            break;
          case 'Goals':
            iconName = 'flag';
            break;
          case 'Programs':
            iconName = 'schedule';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'help';
        }

        return <MaterialIcons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#6200ee',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        height: 60,
        paddingBottom: 8,
        paddingTop: 4,
      },
      headerStyle: {
        backgroundColor: '#6200ee',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: 'Ana Sayfa',
        tabBarLabel: 'Ana Sayfa',
      }}
    />
    <Tab.Screen
      name="Subjects"
      component={SubjectsScreen}
      options={{
        title: 'Dersler',
        tabBarLabel: 'Dersler',
      }}
    />
    <Tab.Screen
      name="Goals"
      component={GoalsScreen}
      options={{
        title: 'Hedefler',
        tabBarLabel: 'Hedefler',
      }}
    />
    <Tab.Screen
      name="Programs"
      component={ProgramsScreen}
      options={{
        title: 'Program',
        tabBarLabel: 'Program',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profil',
        tabBarLabel: 'Profil',
      }}
    />
  </Tab.Navigator>
);

const MainNavigator: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default MainNavigator;
