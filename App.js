
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

    // Listener para cuando el usuario RECIBE la notificación (App abierta o en segundo plano)
    const receivedSub = Notifications.addNotificationReceivedListener(notification => {
        const body = notification.request.content.body;
        // Importación dinámica para evitar ciclo
        const { speak } = require('./services/notificationService');
        speak(body);
    });

    // Listener para cuando el usuario TOCA la notificación
    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && data.screen === 'DoseConfirmation' && navigationRef.isReady()) {
          const medicationParams = {
              name: data.medName,
              dosage: data.dosage,
              scheduledTime: data.scheduledTime,
          };
          navigationRef.navigate('DoseConfirmation', { medication: medicationParams });
      }
    });

    return () => {
        receivedSub.remove();
        responseSub.remove();
    };
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
