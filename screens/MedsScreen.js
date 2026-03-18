import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Dimensions, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useMedicationStore } from '../store/useMedicationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Pill, Trash2, Edit2, Plus, Bell, Settings, Home, Calendar, Clock, CheckCircle, Briefcase } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function MedsScreen({ navigation }) {
  const { medications, deleteMedication, fetchMedications } = useMedicationStore();
  const { user } = useAuthStore();
  const darkMode = useSettingsStore(state => state.darkMode);
  const [stats, setStats] = useState({ taken: 0, total: 0, percent: 0 });

  useFocusEffect(
    useCallback(() => {
      fetchMedications();
      // Simulación de estadísticas para la "Adherence Card" (esto idealmente vendría del historial real)
      setStats({ taken: 2, total: 3, percent: 66 });
    }, [])
  );

  const handleDelete = (id, name) => {
    Alert.alert("Eliminar Medicamento", `¿Estás seguro de eliminar ${name}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: 'destructive', onPress: () => deleteMedication(id) }
    ]);
  };

  const handleEdit = (med) => {
      navigation.navigate('AddMedication', { medToEdit: med });
  };

  const renderCard = ({ item, index }) => {
      // Colores dinámicos basados en el índice
      const colors = [
          { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900', iconBg: 'bg-blue-100 dark:bg-blue-800' },
          { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-900', iconBg: 'bg-green-100 dark:bg-green-800' },
          { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900', iconBg: 'bg-purple-100 dark:bg-purple-800' },
      ];
      const theme = colors[index % colors.length];

      return (
        <View className="bg-white dark:bg-slate-800 p-4 rounded-3xl mb-4 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
            {/* Top Row - CLICKABLE */}
            <TouchableOpacity onPress={() => navigation.navigate('MedicationDetails', { medication: item })}>
                <View className="flex-row items-start mb-4">
                    <View className={`w-14 h-14 rounded-2xl ${theme.iconBg} items-center justify-center mr-4`}>
                        <Pill size={28} color={theme.text.split(' ')[0].includes('purple') ? '#9333ea' : theme.text.split(' ')[0].includes('green') ? '#16a34a' : '#3b82f6'} />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row justify-between items-start">
                             <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${theme.text}`}>
                                PRÓXIMA DOSIS: {(() => {
                                    try {
                                        if (!item.times) return '8:00 AM';
                                        const parsed = JSON.parse(item.times);
                                        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '8:00 AM';
                                    } catch (e) { return '8:00 AM'; }
                                })()}
                            </Text>
                            {item.patientType === 'pet' && (
                                <View className="bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800 flex-row items-center">
                                    <Text className="text-[10px] mr-1">🐾</Text>
                                    <Text className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase">{item.patientName}</Text>
                                </View>
                            )}
                        </View>
                        
                        <Text className="text-xl font-bold text-slate-800 dark:text-white mb-1">{item.name}</Text>
                        <Text className="text-slate-400 text-xs font-medium">
                            {item.dosage} • {item.frequency || 'Diaria'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Actions Row */}
            <View className="flex-row space-x-3">
                <TouchableOpacity 
                    onPress={() => handleEdit(item)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 flex-row items-center justify-center bg-slate-50 dark:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600"
                >
                    <Edit2 size={14} color={darkMode ? "#cbd5e1" : "#64748b"} />
                    <Text className="text-slate-600 dark:text-slate-300 font-bold text-xs ml-2">Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleDelete(item.id, item.name)}
                    className="flex-1 py-2.5 rounded-xl border border-red-100 dark:border-red-900/50 flex-row items-center justify-center bg-red-50 dark:bg-red-900/30 active:bg-red-100 dark:active:bg-red-900/50"
                >
                    <Trash2 size={14} color="#ef4444" />
                    <Text className="text-red-500 font-bold text-xs ml-2">Borrar</Text>
                </TouchableOpacity>
            </View>
        </View>
      );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 relative">
      <StatusBar style={darkMode ? "light" : "dark"} />
      
      {/* 1. HEADER */}
      <View className="flex-row justify-between items-center px-6 mb-6 pt-2">
          <View className="flex-row items-center">
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3 border border-white dark:border-slate-800 shadow-sm overflow-hidden">
                    <Text className="text-lg">{user?.avatar?.length < 5 ? user.avatar : '👤'}</Text>
                </View>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-slate-800 dark:text-white">Mis Medicamentos</Text>
          </View>
          <View className="flex-row space-x-2">
              <TouchableOpacity className="p-2" onPress={() => Alert.alert("Notificaciones", "No tienes notificaciones nuevas.")}>
                  <Bell size={20} color={darkMode ? "#cbd5e1" : "#64748b"} />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 ml-2" onPress={() => navigation.navigate('Profile')}>
                  <Settings size={20} color={darkMode ? "#cbd5e1" : "#64748b"} />
              </TouchableOpacity>
          </View>
      </View>

      {/* 2. MAIN LIST */}
      <View className="flex-1 px-6">
          <FlatList 
            data={medications}
            keyExtractor={item => item.id.toString()}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150, flexGrow: 1 }}
            ListEmptyComponent={
                <View className="flex-1 items-center justify-center py-20 opacity-50">
                    <View className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                        <Pill size={48} color={darkMode ? "#94a3b8" : "#cbd5e1"} />
                    </View>
                    <Text className="text-xl font-bold text-slate-400 dark:text-slate-500 text-center mb-1">
                        Sin medicamentos
                    </Text>
                    <Text className="text-slate-400 dark:text-slate-500 text-center text-sm px-10">
                        Añade tus medicinas para comenzar.
                    </Text>
                </View>
            }
            ListFooterComponent={
                // 3. DAILY ADHERENCE CARD (Footer)
                medications.length > 0 && (
                    <View className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-3xl border border-blue-100 dark:border-blue-900 mt-2 mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-blue-600 dark:text-blue-400 font-bold">Progreso Diario</Text>
                            <Text className="text-blue-800 dark:text-blue-300 font-bold">{stats.percent}%</Text>
                        </View>
                        <View className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full mb-3 overflow-hidden">
                            <View style={{ width: `${stats.percent}%` }} className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" />
                        </View>
                        <Text className="text-slate-500 dark:text-slate-400 text-xs">
                            {stats.taken} de {stats.total} dosis tomadas hoy. ¡Sigue así!
                        </Text>
                    </View>
                )
            }
          />
      </View>

    </View>
  );
}
