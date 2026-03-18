import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export const useMedicationStore = create(
  persist(
    (set, get) => ({
      medications: [],
      history: [], // Local history for offline-first stats
      loading: false,
      error: null,
      lastSync: null,

      // Auxiliar: Obtener ID de usuario
      getUserId: () => {
        const { useAuthStore } = require('./useAuthStore');
        return useAuthStore.getState().user?.id;
      },

      togglePauseMedication: async (medId) => {
        const { medications } = get();
        const med = medications.find(m => m.id === medId);
        if (!med) return;

        const newPausedStatus = med.paused ? 0 : 1;

        try {
          // 1. Cancelar/Agendar notificaciones
          if (newPausedStatus) {
            // Pausando: cancelar todas las notificaciones
            await cancelAllNotificationsForMedication(med.name);
          } else {
            // Reanudando: volver a agendar
            const times = typeof med.times === 'string' ? JSON.parse(med.times) : med.times;
            for (const time of times) {
              await scheduleMedicationNotification(med.name, time);
            }
          }

          // 2. Actualizar localmente (Store)
          set(state => ({
            medications: state.medications.map(m =>
              m.id === medId ? { ...m, paused: newPausedStatus } : m
            )
          }));

          // 3. Actualizar SQLite
          const db = await SQLite.openDatabaseAsync('medtime.db');
          await db.runAsync(
            'UPDATE medications SET paused = ? WHERE id = ?',
            [newPausedStatus, medId]
          );

          // 4. Actualizar Supabase si está disponible
          const userId = get().getUserId();
          if (userId) {
            await supabase
              .from('medications')
              .update({ paused: newPausedStatus })
              .eq('id', medId);
          }

        } catch (error) {
          console.error("Error toggling pause:", error);
        }
      },

      fetchMedications: async () => {
        set({ loading: true, error: null });
        try {
          const db = await SQLite.openDatabaseAsync('medtime.db');

          // Intentar obtener de SQLite primero
          let meds = await db.getAllAsync('SELECT * FROM medications');

          // Normalizar campos que puedan venir mal de la base de datos
          meds = meds.map(m => ({
            ...m,
            paused: !!m.paused, // Convertir 0/1 a boolean
            times: typeof m.times === 'string' ? JSON.parse(m.times) : m.times,
            startDate: m.start_date,
            patientName: m.patient_name,
            patientType: m.patient_type || 'user'
          }));

          set({ medications: meds, loading: false, lastSync: new Date().toISOString() });

          // Sincronizar con Supabase si está logueado
          const userId = get().getUserId();
          if (userId) {
            const { data: supabaseMeds, error } = await supabase
              .from('medications')
              .select('*')
              .eq('user_id', userId)
              .eq('active', 1)
              .order('id', { ascending: false });

            if (!error && supabaseMeds) {
              // Merge o reemplazo según tu estrategia (aquí simple reemplazo local para demo)
              const normalizedSupabase = supabaseMeds.map(m => ({
                 ...m,
                 paused: !!m.paused,
                 startDate: m.start_date,
                 times: m.times || [],
                 patientName: m.patient_name,
                 patientType: m.patient_type || 'user'
              }));
              set({ medications: normalizedSupabase });

              // Opcional: actualizar SQLite con lo de Supabase
              // For simplicity, this example just updates the store.
              // A full sync logic would involve comparing and updating SQLite.
            }
          }
        } catch (error) {
          console.log('Modo Offline: Usando caché local para medicamentos');
          // No lanzamos error para que la app lea lo que tiene en 'medications' (persistido)
          set({ loading: false });
        }
      },

      addMedication: async (medication) => {
        const { name, dosage, frequency, times, startDate, notes, imageUri, patientName, patientType, side_effects, stock_count } = medication;
        const userId = get().getUserId();
        if (!userId) return;

        // 1. Optimistic Update (Local)
        const tempId = Date.now();
        const newMed = { 
            ...medication, 
            id: tempId, 
            active: 1, 
            user_id: userId,
            startDate: startDate,
            times: times,
            patientType: patientType || 'user',
            side_effects,
            stock_count: stock_count || 0
        };
        
        set(state => ({ medications: [newMed, ...state.medications] }));

        // 2. Sync with Cloud
        try {
          const { data, error } = await supabase.from('medications').insert([{
            user_id: userId,
            name, dosage, frequency, times,
            start_date: startDate, notes, image_uri: imageUri,
            patient_type: patientType || 'user', active: 1,
            side_effects, stock_count: stock_count || 0
          }]).select();

          if (error) throw error;
          
          if (data && data[0]) {
              await get().fetchMedications();
          }
        } catch (error) {
          console.warn('Sync Fallido: Medicamento guardado solo localmente.', error);
        }
      },

      updateMedication: async (id, medication) => {
        const { name, dosage, frequency, times, notes, type, patientName, patientType, side_effects, stock_count } = medication;
        
        // 1. Local Update
        set(state => ({
            medications: state.medications.map(m => m.id === id ? { ...m, ...medication } : m)
        }));

        // 2. Cloud Update
        try {
          const { error } = await supabase.from('medications').update({
            name, dosage, frequency, times, notes, 
            type, patient_name: patientName, patient_type: patientType,
            side_effects, stock_count
          }).eq('id', id);

          if (error) throw error;
        } catch (error) {
          console.warn('Sync Fallido: Actualización solo local.');
        }
      },

      deleteMedication: async (id) => {
        // 1. Local Update
        set(state => ({
            medications: state.medications.filter(m => m.id !== id)
        }));

        // 2. Cloud Update
        try {
          const { error } = await supabase.from('medications').update({ active: 0 }).eq('id', id);
          if (error) throw error;
        } catch (error) {
          console.warn('Sync Fallido: Borrado solo local. Se sincronizará luego.');
        }

        // Limpiar notificaciones
        const { cancelAllNotificationsForMedication } = require('../services/notificationService');
        const medToDelete = get().medications.find(m => m.id === id);
        if (medToDelete) {
            cancelAllNotificationsForMedication(medToDelete.name);
        }
      },

      markAsTaken: async (medicationId, status = 'taken') => {
        const now = new Date().toISOString();
        const newEntry = {
            id: Date.now(), // ID temporal local
            medication_id: medicationId,
            taken_at: now,
            status
        };

        // 1. Actualización Optimista (Local) - Fundamental para el "0 de 0"
        set(state => ({ history: [newEntry, ...state.history] }));

        // 2. Sincronización con la nube
        try {
            const { error } = await supabase.from('history').insert([{
                medication_id: medicationId,
                taken_at: now,
                status
            }]);
            if (error) throw error;
        } catch (error) {
            console.warn('Registro de toma guardado solo localmente (se sincronizará luego)');
        }
      },

      // Filtrar dosis por fecha (Lógica puramente local sobre el estado persistido)
      getDosesByDate: async (dateInput = new Date()) => {
        const state = get();
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return { agenda: [], history: [] };
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const now = new Date();
        const nowStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        
        const isToday = dateStr === nowStr;
        const isPast = dateStr < nowStr;

        // Historial local (Fuente de verdad inmediata)
        const localHistory = state.history.filter(h => h.taken_at.startsWith(dateStr));
        
        let agenda = [];
        state.medications.forEach(med => {
            // Normalizar fecha de inicio
            let medStartStr = nowStr;
            if (med.startDate) {
                try {
                    medStartStr = med.startDate.split('T')[0];
                } catch(e) { medStartStr = nowStr; }
            }

            if (dateStr < medStartStr) return;
            if (med.endDate && dateStr > med.endDate) return;
            
            const times = med.times || [];
            // Buscar cuántas veces se ha tomado este medicamento hoy
            const takenLogs = localHistory.filter(h => h.medication_id === med.id);
            
            times.forEach((time, index) => {
                const matchedLog = takenLogs[index]; 
                let status = matchedLog ? 'taken' : (isToday && new Date(`${dateStr}T${time}`) < now ? 'missed' : (isPast ? 'missed' : 'pending'));

                agenda.push({
                    ...med,
                    scheduledTime: time,
                    uniqueId: `${med.id}_${time}_${dateStr}`,
                    status: status,
                    logTime: matchedLog ? new Date(matchedLog.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : null
                });
            });
        });

        agenda.sort((a,b) => a.scheduledTime.localeCompare(b.scheduledTime));
        return { agenda, history: localHistory };
      },

      getHistoryByDate: async (dateStr) => {
        try {
            const [y, m, d] = dateStr.split('-').map(Number);
            const startISO = new Date(y, m - 1, d, 0, 0, 0).toISOString();
            const endISO = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
            
            const { data, error } = await supabase
                .from('history')
                .select('id, status, taken_at, medication_id, medications(name, dosage)')
                .gte('taken_at', startISO)
                .lte('taken_at', endISO);
            
            if (error) throw error;
            return data.map(h => ({
                id: h.id, status: h.status, taken_at: h.taken_at, 
                medication_id: h.medication_id, medName: h.medications?.name, dosage: h.medications?.dosage
            }));
        } catch (e) {
            return []; // Offline: No hay historial detallado a menos que implementemos cache de historial
        }
      }
    }),
    {
      name: 'medication-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
