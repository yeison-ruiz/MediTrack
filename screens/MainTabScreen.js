import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Briefcase, Clock, Calendar, Plus } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '../store/useSettingsStore';

// Importamos las pantallas como "Componentes"
import HomeScreen from './HomeScreen';
import MedsScreen from './MedsScreen';
import HistoryScreen from './HistoryScreen';
import ScheduleScreen from './ScheduleScreen';

export default function MainTabScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('Home');
    const darkMode = useSettingsStore(state => state.darkMode);

    // Renderizado "Keep Alive": Todas existen, solo ocultamos las inactivas.
    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900 relative" edges={['top', 'left', 'right']}>
            <StatusBar style={darkMode ? "light" : "dark"} />
            
            {/* AREA DE CONTENIDO (Ocupa toda la pantalla detrás de la barra) */}
            <View className="flex-1 pb-20 pt-4"> 
                 {/* Home Tab */}
                 <View style={{ display: activeTab === 'Home' ? 'flex' : 'none', flex: 1 }}>
                     <HomeScreen navigation={navigation} isTab={true} />
                 </View>

                 {/* Meds Tab */}
                 <View style={{ display: activeTab === 'Meds' ? 'flex' : 'none', flex: 1 }}>
                     <MedsScreen navigation={navigation} isTab={true} />
                 </View>

                 {/* History Tab */}
                 <View style={{ display: activeTab === 'History' ? 'flex' : 'none', flex: 1 }}>
                     <HistoryScreen navigation={navigation} isTab={true} />
                 </View>

                 {/* Schedule Tab */}
                 <View style={{ display: activeTab === 'Schedule' ? 'flex' : 'none', flex: 1 }}>
                     <ScheduleScreen navigation={navigation} isTab={true} />
                 </View>
            </View>

            {/* BARRA DE NAVEGACIÓN FLOTANTE (Fija y Persistente) */}
            
            {/* FAB (Botón +) */}
            <View className="absolute bottom-24 right-6 shadow-xl shadow-blue-400 dark:shadow-blue-900 z-50">
                <TouchableOpacity 
                    onPress={() => navigation.navigate('AddMedication')}
                    className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center border-4 border-slate-50 dark:border-slate-800"
                >
                    <Plus size={32} color="white" />
                </TouchableOpacity>
            </View>

            {/* TAB BAR */}
            <View className="absolute bottom-5 left-5 right-5 bg-white dark:bg-slate-800 rounded-3xl h-16 shadow-2xl shadow-slate-300 dark:shadow-none flex-row justify-between items-center px-6 z-40">
                <TouchableOpacity className="items-center" onPress={() => setActiveTab('Home')}>
                    <Home size={24} color={activeTab === 'Home' ? '#3b82f6' : (darkMode ? '#94a3b8' : '#94a3b8')} strokeWidth={activeTab === 'Home' ? 2.5 : 2} />
                    <Text className={`text-[10px] font-bold mt-1 ${activeTab === 'Home' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>Inicio</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="items-center" onPress={() => setActiveTab('Meds')}>
                    <Briefcase size={24} color={activeTab === 'Meds' ? '#3b82f6' : (darkMode ? '#94a3b8' : '#64748b')} strokeWidth={activeTab === 'Meds' ? 2.5 : 2} />
                    <Text className={`text-[10px] font-bold mt-1 ${activeTab === 'Meds' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500'}`}>Medicinas</Text>
                </TouchableOpacity>

                <View className="w-8" /> 

                <TouchableOpacity className="items-center" onPress={() => setActiveTab('History')}>
                    <Clock size={24} color={activeTab === 'History' ? '#3b82f6' : (darkMode ? '#94a3b8' : '#64748b')} strokeWidth={activeTab === 'History' ? 2.5 : 2} />
                    <Text className={`text-[10px] font-bold mt-1 ${activeTab === 'History' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500'}`}>Historial</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center" onPress={() => setActiveTab('Schedule')}>
                    <Calendar size={24} color={activeTab === 'Schedule' ? '#3b82f6' : (darkMode ? '#94a3b8' : '#64748b')} strokeWidth={activeTab === 'Schedule' ? 2.5 : 2} />
                    <Text className={`text-[10px] font-bold mt-1 ${activeTab === 'Schedule' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500'}`}>Calendario</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
