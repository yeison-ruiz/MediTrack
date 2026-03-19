import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { useAuthStore } from '../store/useAuthStore';

import { useNavigationContainerRef } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ navigationRef }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false, 
          contentStyle: { backgroundColor: '#f8fafc' },
          animation: 'slide_from_right'
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack (No logueado)
          <>
            <Stack.Screen name="Splash" component={require('../screens/SplashScreen').default} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Verify" component={require('../screens/VerifyScreen').default} />
            <Stack.Screen name="AvatarCreator" component={require('../screens/AvatarCreatorScreen').default} />
          </>
        ) : (
          // App Stack (Logueado)
          <>
            {/* 1. CONTENEDOR PRINCIPAL (Pestañas) */}
            <Stack.Screen name="Main" component={require('../screens/MainTabScreen').default} options={{ animation: 'none', headerShown: false }} />
            
            {/* 2. PANTALLAS MODALES / SECUNDARIAS */}
            <Stack.Screen name="AddMedication" component={require('../screens/AddMedicationScreen').default} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="MedicationDetails" component={require('../screens/MedicationDetailsScreen').default} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="AvatarCreator" component={require('../screens/AvatarCreatorScreen').default} />
            <Stack.Screen name="Profile" component={require('../screens/ProfileScreen').default} />
            <Stack.Screen name="AlarmSettings" component={require('../screens/AlarmSettingsScreen').default} options={{ title: 'Configuración' }} />
            <Stack.Screen 
              name="DoseConfirmation" 
              component={require('../screens/DoseConfirmationScreen').default} 
              options={{ 
                presentation: 'transparentModal', 
                animation: 'fade',
                headerShown: false 
              }} 
            />
            
            {/* Alias de seguridad (redirigen a Main si se llaman explícitamente) */}
            <Stack.Screen name="Home" component={require('../screens/MainTabScreen').default} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
