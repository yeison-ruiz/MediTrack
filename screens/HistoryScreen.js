import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useMedicationStore } from '../store/useMedicationStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { ChevronLeft, Calendar as CalendarIcon, Check, X, Circle, MoreVertical, Search, TrendingUp } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function HistoryScreen({ navigation }) {
  const { getDosesByDate, markAsTaken } = useMedicationStore();
  const darkMode = useSettingsStore(state => state.darkMode);
  const [timeline, setTimeline] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generar días del calendario
  const generateWeekDays = () => {
      const days = [];
      const today = new Date();
      // Mostramos desde 3 días atrás hasta 3 adelante
      for (let i = -3; i <= 3; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          days.push(d);
      }
      return days;
  };
  const weekDays = useState(generateWeekDays())[0];

  // Cargar datos
  const loadData = async () => {
      const { agenda } = await getDosesByDate(selectedDate);
      
      // Filtrar para mostrar comportamiento de "Log" (no mostrar futuro pendiente)
      const now = new Date();
      selectedDate.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);

      let filteredTimeline = agenda;

      if (selectedDate > today) {
          // Fecha futura: No mostrar nada (según petición usuario: "no debe aparecer")
          filteredTimeline = []; 
      } else if (selectedDate.getTime() === today.getTime()) {
          // Hoy: Mostrar solo lo que ya pasó (taken, missed) o lo pendiente pero ya vencido?
          // Usuario dice: "debe aparecer cuando se haga el recordatorio"
          // Esto implica: Time <= Now.
          
          filteredTimeline = agenda.filter(item => {
              // Si ya se tomó, mostrar
              if (item.status === 'taken') return true;
              
              // Si no se ha tomado, verificar la hora
              const [h, m] = item.scheduledTime.split(':');
              const doseDate = new Date();
              doseDate.setHours(h, m, 0, 0);
              return doseDate <= now;
          });
      }
      // Pasado: Mostrar todo (lo que se tomó y lo que se olvidó)

      setTimeline(filteredTimeline);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );

  const handleMarkAsTakenNow = async (item) => {
      await markAsTaken(item.id, 'taken');
      loadData();
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar style={darkMode ? "light" : "dark"} />

      {/* HEADER */}
      <View className="px-6 pt-2 pb-4 flex-row items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <TouchableOpacity onPress={() => navigation.navigate('Home')} className="p-2 -ml-2">
            <ChevronLeft size={28} color={darkMode ? "#f1f5f9" : "#1e293b"} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-800 dark:text-white">Historial de Dosis</Text>
          <View className="w-8" /> 
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* CALENDAR STRIP */}
        <View className="bg-white dark:bg-slate-800 pb-6 pt-4 rounded-b-3xl shadow-sm mb-6">
            <View className="flex-row justify-between px-6 mb-4 items-center">
                 <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest pl-1">
                     {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                 </Text>
                 <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">Calendario Completo</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                {weekDays.map((day, index) => {
                    const isSelected = day.getDate() === selectedDate.getDate();
                    return (
                        <TouchableOpacity 
                            key={index} 
                            onPress={() => setSelectedDate(day)}
                            className={`items-center justify-center w-[50px] h-[70px] mr-3 rounded-2xl ${isSelected ? 'bg-blue-600 shadow-lg shadow-blue-300 dark:shadow-none' : 'bg-transparent'}`}
                        >
                            <Text className={`text-xs font-bold mb-1 ${isSelected ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500 uppercase'}`}>
                                {day.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0,3)}
                            </Text>
                            <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-white'}`}>
                                {day.getDate()}
                            </Text>
                            {isSelected && <View className="w-1 h-1 bg-white rounded-full mt-1" />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>

        {/* DAY SUMMARY (Replacing the confused 94% card) */}
        <View className="px-6 mb-6">
            <View className="bg-blue-600 dark:bg-blue-900 rounded-3xl p-5 shadow-lg shadow-blue-200 dark:shadow-none">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-blue-100 font-bold text-xs uppercase tracking-widest">Resumen del Día</Text>
                    <CalendarIcon size={16} color="white" opacity={0.6} />
                </View>
                <Text className="text-white text-2xl font-bold">
                    {timeline.filter(t => t.status === 'taken').length} de {timeline.length} tomas
                </Text>
                <Text className="text-blue-100 text-xs mt-1">Cumplimiento: {timeline.length > 0 ? Math.round((timeline.filter(t => t.status === 'taken').length / timeline.length) * 100) : 0}%</Text>
            </View>
        </View>

        {/* TIMELINE */}
        <View className="px-6 pb-20">
             <View className="flex-row justify-between items-end mb-6">
                 {/* Título DINÁMICO */}
                 <Text className="text-xl font-bold text-slate-800 dark:text-white">
                     {selectedDate.toLocaleDateString('es-ES', { weekday: 'long' }) === new Date().toLocaleDateString('es-ES', { weekday: 'long' }) 
                        ? 'Línea de Tiempo (Hoy)' 
                        : `Línea del ${selectedDate.toLocaleDateString('es-ES', { weekday: 'long' })}`
                        }
                 </Text>
             </View>

             <View className="pl-4">
                 {/* Línea vertical solo si hay items */}
                 {timeline.length > 0 && <View className="absolute left-[19px] top-4 bottom-10 w-[2px] bg-slate-200 dark:bg-slate-700 border-l border-r border-slate-200 dark:border-slate-700" />}
                 
                 {timeline.length === 0 ? (
                     <View className="py-10 items-center justify-center opacity-40">
                         <CalendarIcon size={48} color={darkMode ? "#94a3b8" : "#cbd5e1"} />
                         <Text className="text-slate-500 font-bold mt-4 text-center">No hay registros para este día</Text>
                     </View>
                 ) : timeline.map((item, index) => (
                     <View key={index} className="flex-row mb-6 relative">
                         
                         {/* ICONO DE ESTADO */}
                         <View className="mr-5 relative z-10 bg-slate-50 dark:bg-slate-900 py-2"> 
                             {item.status === 'taken' && (
                                 <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                                     <Check size={20} color="#16a34a" strokeWidth={3} />
                                 </View>
                             )}
                             {item.status === 'missed' && (
                                 <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                                     <X size={20} color="#ef4444" strokeWidth={3} />
                                 </View>
                             )}
                             {item.status === 'upcoming' && (
                                 <View className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 items-center justify-center">
                                     <Circle size={14} color={darkMode ? "#475569" : "#cbd5e1"} fill={darkMode ? "#1e293b" : "#cbd5e1"} />
                                 </View>
                             )}
                         </View>

                         {/* TARJETA */}
                         <TouchableOpacity 
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('MedicationDetails', { medication: item })}
                            className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                         >
                             <View className="flex-row justify-between items-start mb-2">
                                 <View className="flex-1">
                                     <Text className="font-bold text-lg text-slate-800 dark:text-white">{item.name}</Text>
                                     <Text className="text-slate-500 text-xs">{item.dosage}</Text>
                                 </View>
                                 
                                 {/* BADGE */}
                                 {item.status === 'taken' && (
                                     <View className="bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md border border-green-100 dark:border-green-800">
                                         <Text className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">REGISTRADA</Text>
                                     </View>
                                 )}
                                 {item.status === 'missed' && (
                                     <View className="bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md border border-red-100 dark:border-red-800">
                                         <Text className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase">SIN REGISTRO</Text>
                                     </View>
                                 )}
                             </View>

                             <View className="flex-row items-center mb-1">
                                 <View className="w-4 items-center mr-2">
                                     <View className="w-2 h-2 rounded-full bg-blue-400" />
                                 </View>
                                 <Text className="text-slate-500 dark:text-slate-400 text-sm">Programada: <Text className="font-bold text-slate-700 dark:text-slate-300">{item.scheduledTime}</Text></Text>
                             </View>

                             {item.status === 'taken' && (
                                 <View className="flex-row items-center">
                                     <Check size={12} color="#94a3b8" className="mr-2" />
                                     <Text className="text-slate-400 text-xs ml-6">Registrada a las {item.logTime || '08:05 AM'}</Text>
                                 </View>
                             )}

                             {/* BOTÓN DE ACCIÓN FUNCIONAL */}
                             {item.status === 'missed' && selectedDate.toDateString() === new Date().toDateString() && (
                                 <TouchableOpacity className="mt-2" onPress={() => handleMarkAsTakenNow(item)}>
                                     <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wide">Marcar como tomada ahora ›</Text>
                                 </TouchableOpacity>
                             )}
                         </TouchableOpacity>
                     </View>
                 ))}
             </View>
        </View>

      </ScrollView>
    </View>
  );
}
