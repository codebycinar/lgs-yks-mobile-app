import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SMSVerificationScreen from '../screens/auth/SMSVerificationScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  SMSVerification: {
    phoneNumber: string;
    isLogin: boolean;
  };
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName=\"Login\"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name=\"Login\" 
        component={LoginScreen}
        options={{
          title: 'Giriş Yap',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name=\"Register\" 
        component={RegisterScreen}
        options={{
          title: 'Kayıt Ol',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name=\"SMSVerification\" 
        component={SMSVerificationScreen}
        options={{
          title: 'SMS Doğrulama',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;