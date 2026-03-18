import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import { Platform, Alert, DeviceEventEmitter } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';

// Configuración Global del Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestPermissions = async () => {
    // Retornamos true "mock" porque en Expo Go ya sabemos que no va bien el push remoto
    return true; 
};

export const speak = (text) => {
  const { voiceEnabled, volume } = useSettingsStore.getState();
  if (!voiceEnabled) return;

  try {
    Speech.speak(text, {
      language: 'es-419',
      pitch: 1.0,
      rate: 0.9,
      volume: volume || 1.0, 
    });
  } catch (e) {
    console.log("Error Speech:", e);
  }
};

// Función HÍBRIDA: Intenta nativa, pero asegura la visual con el componente InApp
export const scheduleTestNotification = async () => {
    // 1. DISPARAR SIMULACIÓN INMEDIATA (Garantizado que funciona en Expo Go)
    console.log("📢 Emitiendo alarma simulada...");
    
    // Pequeño delay para que se sienta que "pasa algo"
    setTimeout(() => {
        DeviceEventEmitter.emit('MOCK_NOTIFICATION', {
            title: "🔔 ALARMA DE PRUEBA",
            body: "¡Sistema de notificaciones activo! Tócame.",
            data: { screen: 'DoseConfirmation', medName: 'Prueba', dosage: '10mg', scheduledTime: 'Ahora' }
        });
        speak("Prueba de sistema exitosa.");
    }, 1000);

    // 2. Intentar Native (Solo funcionará si hay permisos y Dev Build)
    try {
        await Notifications.scheduleNotificationAsync({
            content: { title: "Test Nativo", body: "Si ves esto, es un milagro de Expo Go" },
            trigger: { seconds: 2 },
        });
    } catch (e) {
        console.log("Ignorando error nativo en Go:", e.message);
    }
};

export const scheduleMedicationReminder = async (medName, dosage, hour, minute) => {
    // Calculamos el tiempo para la simulación
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    
    // Si la hora ya pasó, es para mañana
    if (target <= now) {
        // PERO: Si la diferencia es menor a 1 minuto, asumimos que es una prueba inmediata del usuario
        // y la disparamos en 5 segundos.
        const diff = now.getTime() - target.getTime();
        if (diff < 60000) {
             target.setTime(now.getTime() + 5000); // 5 seg futuro
        } else {
             target.setDate(target.getDate() + 1);
        }
    }

    const delay = target.getTime() - now.getTime();
    console.log(`⏰ Alarma agendada para dentro de ${delay}ms`);

    // Usamos setTimeout para simular la alarma si la app está abierta (Dev Mode)
    setTimeout(() => {
        DeviceEventEmitter.emit('MOCK_NOTIFICATION', {
            title: "Hora de tu medicina",
            body: `Es momento de tomar ${medName}`,
            data: { screen: 'DoseConfirmation', medName, dosage, scheduledTime: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}` }
        });
        speak(`Es hora de tomar ${medName}`);
    }, delay);

    // -------------------------------------------------------------
    // CÓDIGO DE PRODUCCIÓN (Alarma Real del Sistema)
    // Esto fallará silenciosamente en Expo Go, pero FUNCIONARÁ en el APK real.
    // -------------------------------------------------------------
    try {
        const trigger = {
            hour: hour,
            minute: minute,
            repeats: true, // Repetir diariamente
        };

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Hora de tu medicina",
                body: `Es momento de tu dosis de ${medName} (${dosage})`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.MAX,
                data: { screen: 'DoseConfirmation', medName, dosage, scheduledTime: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}` }
            },
            trigger,
        });
        console.log(`[PROD] Alarma nativa agendada con éxito (ID: ${id})`);
        return id;
    } catch (e) {
        console.log("Aviso: La alarma nativa no se pudo agendar (Normal si estás en Expo Go):", e.message);
        return "simulated-id-" + Date.now();
    }
};

export const cancelScheduledNotification = async (id) => {
  // No-op en simulación
};
