import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Alert, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MoreVertical, Pill, Calendar, Clock, Edit2, PauseCircle, Utensils, AlertTriangle, Box } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
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
        notes: 'Sin notas adicionales.',
        side_effects: 'No se han registrado efectos secundarios.',
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

    const handlePause = () => {
        Alert.alert("Pausar Tratamiento", "¿Deseas pausar los recordatorios de este medicamento temporalmente?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Pausar", onPress: () => console.log("Pausado") }
        ]);
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
                
                {/* 1. HERO CARD */}
                <View className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 items-center overflow-hidden">
                    <View className="w-full h-40 bg-blue-50 dark:bg-blue-900/40 rounded-2xl mb-4 items-center justify-center relative overflow-hidden">
                        {/* Abstract Decorative Circles */}
                        <View className="absolute top-0 left-0 w-20 h-20 bg-blue-100 dark:bg-blue-800/50 rounded-full -translate-x-10 -translate-y-10" />
                        <View className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-100 dark:bg-indigo-800/50 rounded-full translate-x-10 translate-y-10 opacity-50" />
                        
                        {/* Dynamic Icon based on Type */}
                        {(med.type === 'Syrup' || med.type === 'Jarabe') ? (
                            <Utensils size={80} color="#3b82f6" /> 
                        ) : (med.type === 'Injection' || med.type === 'Inyección') ? (
                            <Box size={80} color="#3b82f6" /> // Placeholder for Syringe
                        ) : (
                            <Pill size={80} color="#3b82f6" />
                        )}
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{med.name}</Text>
                    <Text className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                        TRATAMIENTO • {translateType(med.type)}
                    </Text>
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
                    <View className="flex-row space-x-3 mb-6">
                        <TouchableOpacity 
                            onPress={handlePause}
                            className="flex-1 bg-slate-100 dark:bg-slate-700 py-3 rounded-xl flex-row items-center justify-center border border-slate-200 dark:border-slate-600"
                        >
                            <PauseCircle size={20} color={darkMode ? "#e2e8f0" : "#475569"} />
                            <Text className="font-bold text-slate-600 dark:text-slate-200 ml-2">Pausar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={handleEdit}
                            className="flex-[2] bg-blue-600 py-3 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            <Edit2 size={20} color="white" />
                            <Text className="font-bold text-white ml-2">Editar Medicamento</Text>
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

                    <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex-row items-start">
                        <View className="bg-red-50 dark:bg-red-900/30 p-2 rounded-lg mr-3">
                            <AlertTriangle size={20} color="#ef4444" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-slate-700 dark:text-slate-200 mb-1">Efectos Secundarios</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                {med.side_effects || "No se han registrado efectos secundarios para este medicamento."}
                            </Text>
                        </View>
                    </View>

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

            {/* FOOTER SUPPLY */}
            <View className="px-6 pb-6 pt-2">
                <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <Box size={24} color="#2563eb" />
                        <View className="ml-3">
                            <Text className="text-blue-900 dark:text-blue-200 font-bold">Inventario Restante</Text>
                            <Text className="text-blue-600 dark:text-blue-400 text-xs">
                                {med.stock_count ? `Disponibles: ${med.stock_count} unidades` : "Sin control de inventario"}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        onPress={handleEdit}
                        className="bg-white dark:bg-slate-700 px-4 py-2 rounded-lg shadow-sm"
                    >
                        <Text className="text-blue-600 dark:text-blue-300 font-bold text-xs">Recargar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
