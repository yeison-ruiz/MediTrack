
import React, { useEffect } from 'react';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import InAppNotification from './components/InAppNotification';
import * as Notifications from 'expo-notifications';
import { useNavigationContainerRef } from '@react-navigation/native';
import { useThemeSync } from './hooks/useThemeSync';
import { useAuthStore } from './store/useAuthStore';

import { AlertProvider } from './components/AlertSystem';

export default function App() {
  useThemeSync(); // Sincroniza Zustand con NativeWind
  const navigationRef = useNavigationContainerRef();
  
  useEffect(() => {
    // Restaurar Sesión Supabase
    useAuthStore.getState().checkSession();

    // Listener para cuando el usuario TOCA la notificación
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && data.screen === 'DoseConfirmation' && navigationRef.isReady()) {
          // Navegar a la pantalla de confirmación
          // Construimos un objeto 'medication' parcial con lo que tenemos en data
          const medicationParams = {
              name: data.medName,
              dosage: data.dosage,
              scheduledTime: data.scheduledTime,
              // ID sería ideal pasarlo también si lo tuviéramos
          };
          navigationRef.navigate('DoseConfirmation', { medication: medicationParams });
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <AlertProvider>
        <StatusBar style="dark" />
        <AppNavigator navigationRef={navigationRef} />
        
        {/* SIMULADOR DE NOTIFICACIONES */}
        <InAppNotification 
           onData={(data) => {
               if (data.data?.screen === 'DoseConfirmation' && navigationRef.isReady()) {
                   const params = data.data; // { medName, dosage, ... }
                   // Adaptar params para la screen
                   navigationRef.navigate('DoseConfirmation', { 
                       medication: {
                           name: params.medName,
                           dosage: params.dosage,
                           scheduledTime: params.scheduledTime,
                           notes: "Simulación"
                       }
                   });
               }
           }}
        />
      </AlertProvider>
    </SafeAreaProvider>
  );
}
