import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useMedicationStore = create((set, get) => ({
  medications: [],
  loading: false,
  error: null,

  fetchMedications: async () => {
    set({ loading: true, error: null });
    try {
      const { useAuthStore } = require('./useAuthStore');
      const userId = useAuthStore.getState().user?.id;

      if (!userId) {
          set({ medications: [], loading: false });
          return;
      }

      console.log('Fetching medications for User ID:', userId);

      // Supabase: JSONB se parsea automático
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('active', 1)
        .eq('user_id', userId) // SOLO del usuario actual
        .order('id', { ascending: false });

      if (error) {
          console.error('Supabase error fetching meds:', error);
          throw error;
      };
      
      console.log('Raw medications fetched:', data?.length);

      const meds = data.map(m => ({
        ...m,
        startDate: m.start_date, // Mapping snake_case -> camelCase
        times: m.times || [],    // Ya viene como array del JSONB
        patientName: m.patient_name,
        patientType: m.patient_type || 'user'
      }));
      set({ medications: meds, loading: false });
    } catch (error) {
      console.error('Error fetching medications:', error);
      set({ loading: false, error: error.message });
    }
  },

  addMedication: async (medication) => {
    const { name, dosage, frequency, times, startDate, notes, imageUri, patientName, patientType } = medication;
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No hay usuario autenticado.");

      const { error } = await supabase.from('medications').insert([{
        user_id: user.id,
        name,
        dosage,
        frequency,
        times: times,
        start_date: startDate,
        notes,
        image_uri: imageUri,
        patient_type: patientType || 'user',
        active: 1
      }]);

      if (error) throw error;
      
      await get().fetchMedications();
      set({ loading: false }); // Asegurar apagar loading
    } catch (error) {
      console.error('Error adding medication:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // Calcular las dosis por fecha
  getDosesByDate: async (dateInput = new Date()) => {
    const state = get();
    
    // Normalizar a objeto Date y String YYYY-MM-DDLOCAL
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) { 
         console.error("Fecha inválida en getDosesByDate", dateInput);
         return { agenda: [], history: [] };
    }
    
    // Obtener fecha local YYYY-MM-DD de la fecha solicitada
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Check si es hoy (comparando strings locales)
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = String(now.getMonth() + 1).padStart(2, '0');
    const nowDay = String(now.getDate()).padStart(2, '0');
    const nowStr = `${nowYear}-${nowMonth}-${nowDay}`;

    const isToday = dateStr === nowStr;
    const isPast = dateStr < nowStr;

    // 1. Traer historial de esa fecha
    const historyResult = await state.getHistoryByDate(dateStr);
    
    // 2. Expandir medicamentos
    let agenda = [];
    state.medications.forEach(med => {
        // 1. Filtrar por Fecha de Inicio (Comparación Local)
        let startStr;
        try {
             let startDateObj;
             if (med.startDate) {
                startDateObj = new Date(med.startDate);
             } else {
                startDateObj = new Date(); // Fallback hoy
             }

             // Convertir start date UTC/ISO a fecha LOCAL string YYYY-MM-DD
             const sYear = startDateObj.getFullYear();
             const sMonth = String(startDateObj.getMonth() + 1).padStart(2, '0');
             const sDay = String(startDateObj.getDate()).padStart(2, '0');
             startStr = `${sYear}-${sMonth}-${sDay}`;

        } catch (e) {
             startStr = nowStr;
        }
        
        console.log(`Checking med: ${med.name}, Start: ${startStr}, Target: ${dateStr}`);

        if (dateStr < startStr) {
            console.log(`Skipping ${med.name}: Not started yet`);
            return; // Aún no empieza
        }

        // 2. Filtrar por Fecha de Fin (si existe)
        if (med.endDate) {
             const end = new Date(med.endDate);
             const eYear = end.getFullYear();
             const eMonth = String(end.getMonth() + 1).padStart(2, '0');
             const eDay = String(end.getDate()).padStart(2, '0');
             const endStr = `${eYear}-${eMonth}-${eDay}`;
             
             if (dateStr > endStr) {
                 console.log(`Skipping ${med.name}: Treatment ended`);
                 return; // Terminó
             }
        }
        
        const times = med.times || []; 
        // Ordenar tiempos por si acaso
        times.sort();

        // Filtrar historial para este medicamento y ordenarlo
        // Nota: asume que medName es único o foreign key matches. History usa medication_id join.
        // historyResult trae m.name como medName. Mejor filtrar por medication_id si es posible, pero historyResult lo tiene?
        // historyResult query: SELECT h.id ... m.name as medName.
        // El join en getHistoryByDate usa medication_id. 
        // Vamos a usar el nombre para maching si getHistoryByDate devuelve eso, o idealmente añadir medId al select.
        
        // Revisemos getHistoryByDate output: SELECT h.id, h.status, h.taken_at, m.name as medName ...
        // Sería mejor exponer medication_id. Por ahora usamos medName.
        
        const medHistory = historyResult
            .filter(h => h.medName === med.name)
            .sort((a,b) => new Date(a.taken_at) - new Date(b.taken_at));
        
        times.forEach((time, index) => {
            // Lógica de emparejamiento: secuencial.
            const matchedLog = medHistory[index]; 
            let status = 'pending';
            let logTime = null;

            if (matchedLog) {
                status = 'taken';
                try {
                     logTime = new Date(matchedLog.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch(e) {}
            } else {
                if (isToday) {
                    const [h, m] = time.split(':');
                    const doseTime = new Date();
                    doseTime.setHours(parseInt(h), parseInt(m), 0, 0);
                    
                    if (doseTime < now) status = 'missed';
                } else if (isPast) {
                    status = 'missed';
                } else {
                    // FUTURO (dateStr > nowStr)
                    status = 'pending';
                }
            }

            agenda.push({
                ...med,
                scheduledTime: time,
                uniqueId: `${med.id}_${time}_${dateStr}`, 
                status: status,
                logTime: logTime,
                historyId: matchedLog ? matchedLog.id : null
            });
            });
        });

    // 3. Incorporar Historial Huérfano (Medicamentos inactivos o dosis extra)
    // Los items de historyResult que NO fueron emparejados en el bucle anterior
    const usedHistoryIds = new Set(agenda.map(a => a.historyId).filter(id => id));
    
    const orphans = historyResult.filter(h => !usedHistoryIds.has(h.id));
    
    orphans.forEach(h => {
        const d = new Date(h.taken_at);
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        
        agenda.push({
            id: 'archived_' + h.id, // ID artificial
            name: h.medName || 'Medicamento Archivado',
            dosage: h.dosage || '',
            frequency: 'Historial',
            times: [],
            scheduledTime: timeStr,
            uniqueId: `hist_${h.id}`, 
            status: h.status || 'taken',
            logTime: timeStr,
            isArchived: true, // Flag visual
            // Datos mínimos para que no crashee UI
            type: 'Tableta', 
            notes: 'Este medicamento fue eliminado o archivado.'
        });
    });

    // Ordenar agenda por hora
    agenda.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    
    return { agenda, history: historyResult };
  },

  getTodayDoses: async () => {
      return get().getDosesByDate(new Date());
  },

  deleteMedication: async (id) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({ active: 0 })
        .eq('id', id);

      if (error) throw error;
      
      set(state => ({
        medications: state.medications.filter(m => m.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  },

  updateMedication: async (id, name, dosage, frequency, times, notes, type, patientName, patientType) => {
      try {
          const { error } = await supabase.from('medications').update({
              name, dosage, frequency, times, notes, type, patient_name: patientName, patient_type: patientType
          }).eq('id', id);

          if (error) throw error;

          // Actualizar estado local
          set(state => ({
              medications: state.medications.map(med => 
                  med.id === id ? { ...med, name, dosage, frequency, times, notes, type, patientName, patientType } : med
              )
          }));
          console.log("Medicamento actualizado:", id);
      } catch (error) {
          console.error("Error updating medication:", error);
          throw error;
      }
  },

  // Historial
  // Historial
  markAsTaken: async (medicationId, status = 'taken') => {
      try {
          // Check if history table exists in Supabase? Yes, we will create it.
          const { error } = await supabase.from('history').insert([{
              medication_id: medicationId,
              taken_at: new Date().toISOString(),
              status
          }]);
          if (error) console.error(error);
      } catch (error) {
          console.error('Error marking as taken:', error);
      }
  },

  getHistoryByDate: async (dateStr) => {
      // dateStr YYYY-MM-DD (Local)
      try {
         // Construir rango de tiempo LOCAL y convertir a UTC para la query
         const [y, m, d] = dateStr.split('-').map(Number);
         const startFn = new Date(y, m - 1, d, 0, 0, 0);
         const endFn = new Date(y, m - 1, d, 23, 59, 59, 999);

         const startISO = startFn.toISOString();
         const endISO = endFn.toISOString();
         
         // Consulta con relación
         const { data, error } = await supabase
            .from('history')
            .select(`
                id, status, taken_at,
                medications (name, dosage)
            `)
            .gte('taken_at', startISO)
            .lte('taken_at', endISO);
         
         if (error) throw error;
         
         // Aplanar resultado para que coincida con lo que espera el UI
         return data.map(h => ({
             id: h.id,
             status: h.status,
             taken_at: h.taken_at,
             medName: h.medications?.name,
             dosage: h.medications?.dosage
         }));
      } catch (error) {
          console.error("Error fetching history:", error);
          return [];
      }
  }
}));
