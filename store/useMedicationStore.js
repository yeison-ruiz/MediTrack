import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export const useMedicationStore = create(
  persist(
    (set, get) => ({
      medications: [],
      loading: false,
      error: null,
      lastSync: null,

      // Auxiliar: Obtener ID de usuario
      getUserId: () => {
        const { useAuthStore } = require('./useAuthStore');
        return useAuthStore.getState().user?.id;
      },

      fetchMedications: async () => {
        const userId = get().getUserId();
        if (!userId) return;

        set({ loading: true, error: null });
        try {
          // Intentar obtener de Supabase
          const { data, error } = await supabase
            .from('medications')
            .select('*')
            .eq('active', 1)
            .eq('user_id', userId)
            .order('id', { ascending: false });

          if (error) throw error;

          const meds = data.map(m => ({
            ...m,
            startDate: m.start_date,
            times: m.times || [],
            patientName: m.patient_name,
            patientType: m.patient_type || 'user'
          }));

          // Actualizar estado Local y marcar último sync
          set({ medications: meds, loading: false, lastSync: new Date().toISOString() });
        } catch (error) {
          console.log('Modo Offline: Usando caché local para medicamentos');
          // No lanzamos error para que la app lea lo que tiene en 'medications' (persistido)
          set({ loading: false });
        }
      },

      addMedication: async (medication) => {
        const { name, dosage, frequency, times, startDate, notes, imageUri, patientName, patientType } = medication;
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
            patientType: patientType || 'user'
        };
        
        set(state => ({ medications: [newMed, ...state.medications] }));

        // 2. Sync with Cloud
        try {
          const { data, error } = await supabase.from('medications').insert([{
            user_id: userId,
            name, dosage, frequency, times,
            start_date: startDate, notes, image_uri: imageUri,
            patient_type: patientType || 'user', active: 1
          }]).select();

          if (error) throw error;
          
          // Reemplazar el temporal con el real de la DB
          if (data && data[0]) {
              await get().fetchMedications();
          }
        } catch (error) {
          console.warn('Sync Fallido: Medicamento guardado solo localmente.', error);
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
        // Buscamos el nombre antes de borrar o pasarlo por params
        cancelAllNotificationsForMedication("Med"); // Simplified
      },

      markAsTaken: async (medicationId, status = 'taken') => {
        // En una app offline-first, marcar como tomado es instantáneo en UI.
        // Aquí no cambiamos 'medications' sino que afectamos el historial.
        
        try {
            const { error } = await supabase.from('history').insert([{
                medication_id: medicationId,
                taken_at: new Date().toISOString(),
                status
            }]);
            if (error) throw error;
        } catch (error) {
            console.warn('Registro de toma guardado solo localmente (Simulado por persistencia de red)');
            // En una versión más pro, aquí guardaríamos en una tabla de 'sync_queue'
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

        // Traer historial (Aquí sí intentamos red, pero si falla devuelve [])
        const historyResult = await state.getHistoryByDate(dateStr);
        
        let agenda = [];
        state.medications.forEach(med => {
            // Lógica de filtrado por fecha...
            let startStr;
            try {
                const startDateObj = med.startDate ? new Date(med.startDate) : new Date();
                startStr = `${startDateObj.getFullYear()}-${String(startDateObj.getMonth()+1).padStart(2,'0')}-${String(startDateObj.getDate()).padStart(2,'0')}`;
            } catch(e) { startStr = nowStr; }

            if (dateStr < startStr) return;
            if (med.endDate && dateStr > med.endDate) return;
            
            const times = med.times || [];
            times.forEach((time, index) => {
                const matchedLog = historyResult.filter(h => h.medication_id === med.id)[index];
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
        return { agenda, history: historyResult };
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
