import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform, FlatList, StatusBar as RNStatusBar } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Pill, Clock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useMedicationStore } from '../store/useMedicationStore';
import { useSettingsStore } from '../store/useSettingsStore';

const { width } = Dimensions.get('window');

export default function ScheduleScreen({ navigation }) {
  const darkMode = useSettingsStore(state => state.darkMode);
  const { getDosesByDate, medications } = useMedicationStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [agenda, setAgenda] = useState([]);

  // Cargar agenda al cambiar fecha o medicamentos
  useEffect(() => {
    const load = async () => {
        const { agenda: result } = await getDosesByDate(selectedDate);
        setAgenda(result);
    };
    load();
  }, [selectedDate, medications]);

  // Calendar Logic
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 = Sunday

  const changeMonth = (direction) => {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + direction);
      setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const numDays = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      
      const days = [];
      
      // Empty slots for previous month
      for (let i = 0; i < firstDay; i++) {
          days.push(<View key={`empty-${i}`} className="w-[14.28%] aspect-square" />);
      }

      // Days
      for (let i = 1; i <= numDays; i++) {
          const date = new Date(year, month, i);
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();

          days.push(
              <TouchableOpacity 
                  key={i} 
                  onPress={() => setSelectedDate(date)}
                  className="w-[14.28%] aspect-square items-center justify-center relative"
              >
                  <View className={`w-8 h-8 items-center justify-center rounded-full ${isSelected ? 'bg-blue-600' : (isToday ? 'bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800' : '')}`}>
                      <Text className={`font-bold ${isSelected ? 'text-white' : (isToday ? 'text-blue-600 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300')}`}>
                          {i}
                      </Text>
                  </View>
                  {/* Dot indicator (simulado: si hay meds activos ese mes, mostramos dot gris suave para "posible") */}
                  <View className="flex-row space-x-0.5 mt-1 h-1">
                      {/* Aquí podría ir lógica compleja de dots, por ahora simple */}
                  </View>
              </TouchableOpacity>
          );
      }

      return days;
  };

  const renderAgendaItem = ({ item }) => (
    <View className="flex-row items-center bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-700 shadow-sm">
        <View className="bg-blue-50 dark:bg-slate-700 p-3 rounded-full mr-4">
            <Clock size={20} color={darkMode ? "#93c5fd" : "#3b82f6"} />
        </View>
        <View className="flex-1">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {item.scheduledTime}
            </Text>
            <Text className="text-base font-bold text-slate-800 dark:text-white">
                {item.name}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs">
                {item.dosage} • {item.frequency}
            </Text>
        </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar style={darkMode ? "light" : "dark"} />
      
      {/* HEADER */}
      <View className="px-6 pb-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <ChevronLeft size={28} color={darkMode ? "#f1f5f9" : "#1e293b"} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800 dark:text-white">Calendario</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          {/* CALENDAR CARD */}
          <View className="bg-white dark:bg-slate-800 mx-4 mt-2 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              
              {/* Controls */}
              <View className="flex-row justify-between items-center mb-6 px-2">
                  <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <ChevronLeft size={20} color={darkMode ? "white" : "black"} />
                  </TouchableOpacity>
                  <Text className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                      {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </Text>
                  <TouchableOpacity onPress={() => changeMonth(1)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <ChevronRight size={20} color={darkMode ? "white" : "black"} />
                  </TouchableOpacity>
              </View>

              {/* Week Days Header */}
              <View className="flex-row mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                  {weekDays.map((d, i) => (
                      <Text key={i} className="w-[14.28%] text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                          {d}
                      </Text>
                  ))}
              </View>

              {/* Grid */}
              <View className="flex-row flex-wrap">
                  {renderCalendar()}
              </View>
          </View>

          {/* AGENDA DATE HEADER */}
          <View className="px-6 mt-6 mb-3">
              <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest">
                  PROGRAMACIÓN PARA EL {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }).toUpperCase()}
              </Text>
          </View>

          {/* AGENDA LIST */}
          <View className="px-4 pb-24">
              {agenda.length > 0 ? (
                 agenda.map((item, index) => (
                     <View key={item.uniqueId || index}>
                        {renderAgendaItem({ item })}
                     </View>
                 ))
              ) : (
                  <View className="items-center py-10 opacity-50">
                      <CalendarIcon size={40} color={darkMode ? "#94a3b8" : "#cbd5e1"} />
                      <Text className="text-slate-400 dark:text-slate-500 font-bold mt-2">Sin medicamentos programados</Text>
                  </View>
              )}
          </View>

      </ScrollView>
    </View>
  );
}
