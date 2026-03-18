import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Alert, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MoreVertical, Pill, Calendar, Clock, Edit2, PauseCircle, Utensils, AlertTriangle, Box, Activity } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '../store/useSettingsStore';
import { useMedicationStore } from '../store/useMedicationStore';
import { useAlert } from '../components/AlertSystem';

const { width } = Dimensions.get('window');

export default function MedicationDetailsScreen({ navigation, route }) {
    const { medication: initialMedication } = route.params || {};
    const medications = useMedicationStore(state => state.medications);
    
    // Obtener la versión más reciente del store para que después de editar se vea reflejado
    const med = medications.find(m => m.id === initialMedication?.id) || initialMedication || {
        name: 'Medicamento',
        dosage: '---',
        frequency: 'Diaria',
        times: '[]',
        notes: '',
        side_effects: '',
        stock_count: 0
    };

    const darkMode = useSettingsStore(state => state.darkMode);
    const { deleteMedication } = useMedicationStore();
    const { showAlert } = useAlert();

    const times = (() => {
        try {
            return typeof med.times === 'string' ? JSON.parse(med.times) : (med.times || []);
        } catch { return []; }
    })();

    const handleEdit = () => {
        navigation.navigate('AddMedication', { medToEdit: med });
    };

    const handleDelete = () => {
        showAlert(
            "Eliminar Medicamento",
            "¿Estás seguro? Esta acción borrará el medicamento y todos sus recordatorios de la agenda.",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive",
                    onPress: async () => {
                        await deleteMedication(med.id);
                        navigation.goBack();
                    }
                }
            ],
            "warning"
        );
    };

    // Helpers de Traducción para visualización
    const translateType = (type) => {
        const map = { 
            'Tablet': 'TABLETA', 'Syrup': 'JARABE', 'Injection': 'INYECCIÓN',
            'Tableta': 'TABLETA', 'Jarabe': 'JARABE', 'Inyección': 'INYECCIÓN'
        };
        return map[type] || type?.toUpperCase() || 'MEDICAMENTO';
    };

    const translateFreq = (freq) => {
        const map = {
            'Once a day': 'Una vez al día', 'Twice a day': 'Dos veces al día', 
            '3 times a day': '3 veces al día', 'Every 8 hours': 'Cada 8 horas',
            'Daily': 'Diaria'
        };
        return map[freq] || freq;
    };

    return (
        <SafeAreaView 
            className="flex-1 bg-slate-50 dark:bg-slate-900"
            edges={['top', 'left', 'right']}
        >
            <StatusBar style={darkMode ? "light" : "dark"} />

            {/* HEADER */}
            <View className="flex-row justify-between items-center px-6 pt-10 pb-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                    <ChevronLeft size={24} color={darkMode ? "#e2e8f0" : "#334155"} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 dark:text-white">Detalles</Text>
                <TouchableOpacity className="p-2">
                    <MoreVertical size={24} color={darkMode ? "#e2e8f0" : "#334155"} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                
                {/* 1. HERO CARD PREMIUM */}
                <View className="mb-8 mt-6 shadow-2xl shadow-blue-200 dark:shadow-none">
                    <LinearGradient
                        colors={
                            med.type === 'Syrup' || med.type === 'Jarabe' ? ['#fff7ed', '#ffedd5'] :
                            med.type === 'Injection' || med.type === 'Inyección' ? ['#f0fdf4', '#dcfce7'] :
                            ['#eff6ff', '#dbeafe']
                        }
                        className="rounded-[40px] p-8 items-center overflow-hidden border border-white/50"
                    >
                        {/* Decorative background glass elements */}
                        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/30 rounded-full" />
                        <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full" />
                        
                        <View className="mb-6 h-32 w-32 items-center justify-center">
                            {/* Renderizado de "Icono" Premium */}
                            {(med.type === 'Syrup' || med.type === 'Jarabe') ? (
                                <View className="relative items-center">
                                    <View className="w-16 h-28 bg-white/60 rounded-xl border-2 border-orange-200 overflow-hidden">
                                        <View className="absolute bottom-0 w-full h-3/5 bg-orange-400" />
                                        <View className="absolute top-2 left-2 w-2 h-10 bg-white/40 rounded-full" />
                                    </View>
                                    <View className="w-10 h-3 bg-orange-600 rounded-t-lg -mt-0.5" />
                                    <View className="absolute top-1/2">
                                        <Utensils size={32} color="white" opacity={0.8} />
                                    </View>
                                </View>
                            ) : (med.type === 'Injection' || med.type === 'Inyección') ? (
                                <View className="relative items-center rotate-45">
                                    <View className="w-4 h-28 bg-white/60 border border-green-200 rounded-full relative overflow-hidden">
                                        <View className="absolute bottom-4 w-full h-1/2 bg-green-500" />
                                    </View>
                                    <View className="w-1 h-10 bg-slate-400 -mb-2" />
                                    <View className="w-10 h-2 bg-slate-500 rounded-full" />
                                    <Activity className="absolute -right-8 top-1/2" size={24} color="#16a34a" />
                                </View>
                            ) : (
                                <View className="relative items-center rotate-[30deg]">
                                    <View className="w-14 h-28 bg-white/60 rounded-full border-2 border-blue-100 overflow-hidden shadow-2xl">
                                        <View className="h-1/2 bg-blue-600 w-full" />
                                        <View className="absolute top-4 left-4 w-3 h-8 bg-white/30 rounded-full" />
                                    </View>
                                    <View className="absolute -right-6 -bottom-2 opacity-40">
                                         <Pill size={40} color="#2563eb" />
                                    </View>
                                </View>
                            )}
                        </View>

                        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center tracking-tight">{med.name}</Text>
                        <View className="bg-white/70 px-5 py-2 rounded-full border border-white/90 backdrop-blur-md">
                            <Text className="text-[10px] font-bold text-slate-600 tracking-[4px] uppercase">
                                {translateType(med.type)}
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* 2. DOSAGE SECTION */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <Pill size={16} color="#3b82f6" fill="#3b82f6" />
                        <Text className="font-bold text-slate-800 dark:text-slate-200 ml-2">Dosis</Text>
                    </View>
                    <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex-row items-center">
                        <View className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                            <Pill size={24} color="#2563eb" />
                        </View>
                        <View>
                            <Text className="text-lg font-bold text-slate-800 dark:text-white">{med.dosage}</Text>
                            <Text className="text-slate-400 text-xs">Tomar {med.dosage} por dosis</Text>
                        </View>
                    </View>
                </View>

                {/* 3. SCHEDULE SECTION */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <Calendar size={16} color="#3b82f6" />
                        <Text className="font-bold text-slate-800 dark:text-slate-200 ml-2">Horario</Text>
                    </View>
                    <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 mb-4">
                        <View className="flex-row items-center mb-3">
                            <View className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                                <Clock size={20} color="#3b82f6" />
                            </View>
                            <View>
                                <Text className="font-bold text-slate-800 dark:text-white">{translateFreq(med.frequency)}</Text>
                                <Text className="text-xs text-slate-400">Frecuencia programada</Text>
                            </View>
                        </View>
                        
                        {/* Time Chips */}
                        <View className="flex-row flex-wrap gap-2">
                            {times.map((time, idx) => (
                                <View key={idx} className="flex-1 bg-slate-50 dark:bg-slate-700 py-3 px-2 rounded-xl border border-slate-100 dark:border-slate-600 items-center min-w-[45%] mb-2">
                                    <Text className="text-xs text-slate-400 dark:text-slate-300 font-bold mb-1">Toma {idx + 1}</Text>
                                    <Text className="text-blue-600 dark:text-blue-300 font-bold text-base">{time}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* ACTIONS ROW */}
                    <View className="flex-row mb-6">
                        <TouchableOpacity 
                            onPress={handleEdit}
                            className="flex-1 bg-blue-600 py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            <Edit2 size={20} color="white" />
                            <Text className="font-bold text-white ml-2 text-base">Editar Medicamento</Text>
                        </TouchableOpacity>
                    </View>

                     {/* EXTRA INFO */}
                     <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 mb-3 flex-row items-start">
                        <View className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-lg mr-3">
                            <Utensils size={20} color="#ea580c" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-slate-700 dark:text-slate-200 mb-1">Instrucciones / Notas</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                {med.notes || "Sin instrucciones adicionales."}
                            </Text>
                        </View>
                    </View>

                    {med.side_effects ? (
                        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex-row items-start">
                            <View className="bg-red-50 dark:bg-red-900/30 p-2 rounded-lg mr-3">
                                <AlertTriangle size={20} color="#ef4444" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-slate-700 dark:text-slate-200 mb-1">Efectos Secundarios</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    {med.side_effects}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                </View>

                {/* DELETE BUTTON */}
                <TouchableOpacity 
                    onPress={handleDelete}
                    className="mb-10 py-4 flex-row items-center justify-center"
                >
                    <AlertTriangle size={18} color="#ef4444" />
                    <Text className="text-red-500 font-bold ml-2 uppercase text-xs tracking-widest">Eliminar Medicamento</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
