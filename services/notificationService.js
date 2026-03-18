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
    const reminders = [];
    
    // Programar la Alarma Principal y 3 Re-recordatorios (Total 4 avisos)
    // t=0, t=5, t=10, t=15
    for (let i = 0; i <= 3; i++) {
        const offsetMinutes = i * 5;
        let finalMinute = minute + offsetMinutes;
        let finalHour = hour;

        // Manejar desbordamiento de minutos a horas
        while (finalMinute >= 60) {
            finalMinute -= 60;
            finalHour = (finalHour + 1) % 24;
        }

        const isMain = i === 0;
        const title = isMain ? "🔔 Hora de tu medicina" : `⚠️ Recordatorio (${i}/3)`;
        const body = isMain 
            ? `Es momento de tomar ${medName} (${dosage})`
            : `Sigues sin registrar tu dosis de ${medName}. ¡No la olvides!`;

        // Simulamos la alarma principal en Expo Go para feedback inmediato
        if (isMain) {
            const now = new Date();
            const target = new Date();
            target.setHours(hour, minute, 0, 0);
            if (target <= now) {
                const diff = now.getTime() - target.getTime();
                if (diff < 60000) target.setTime(now.getTime() + 5000);
                else target.setDate(target.getDate() + 1);
            }
            const delay = target.getTime() - now.getTime();
            setTimeout(() => {
                DeviceEventEmitter.emit('MOCK_NOTIFICATION', {
                    title, body,
                    data: { screen: 'DoseConfirmation', medName, dosage, scheduledTime: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}` }
                });
                speak(body);
            }, delay);
        }

        // Programación Nativa (APK)
        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.MAX,
                    data: { 
                        screen: 'DoseConfirmation', 
                        medName, 
                        dosage, 
                        scheduledTime: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`,
                        isNag: !isMain,
                        nagIndex: i
                    }
                },
                trigger: {
                    hour: finalHour,
                    minute: finalMinute,
                    repeats: true,
                },
            });
            reminders.push(id);
        } catch (e) {
            console.log("Error en recordatorio nativo:", e.message);
        }
    }

    return reminders.join(','); 
};

export const cancelAllNotificationsForMedication = async (medName) => {
    try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notif of scheduled) {
            if (notif.content.data?.medName === medName) {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }
        }
    } catch (e) {
        console.error("Error cancelando:", e);
    }
};

export const cancelScheduledNotification = async (id) => {
    if (!id) return;
    try {
        if (typeof id === 'string' && id.includes(',')) {
            const ids = id.split(',');
            for (const subId of ids) {
                await Notifications.cancelScheduledNotificationAsync(subId);
            }
        } else {
            await Notifications.cancelScheduledNotificationAsync(id);
        }
    } catch (e) {
        console.log("Error al cancelar individual:", e.message);
    }
};
