import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Pill, History, CalendarDays, Plus } from 'lucide-react-native';
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
                     <HomeScreen 
                        navigation={navigation} 
                        isTab={true} 
                        onNavigateToHistory={() => setActiveTab('History')} 
                     />
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
            
             {/* TAB BAR BRAND COLORS - ESTILO MÉDICO PREMIUM */}
             <View className="absolute bottom-6 left-2 right-2 h-20 bg-brand-dark rounded-[40px] shadow-2xl shadow-slate-400 dark:shadow-none flex-row items-center px-2 z-40 border border-brand-blue/30">
                 
                 {/* INICIO */}
                 <TouchableOpacity className="items-center w-[18%] py-1" onPress={() => setActiveTab('Home')}>
                     <Home size={22} color={activeTab === 'Home' ? '#7bba47' : '#94a3b8'} strokeWidth={activeTab === 'Home' ? 2.5 : 1.8} />
                     <Text className={`text-[8px] font-bold mt-1 uppercase tracking-tighter ${activeTab === 'Home' ? 'text-brand-green' : 'text-slate-400'}`}>Inicio</Text>
                 </TouchableOpacity>
                 
                 {/* MEDICINAS */}
                 <TouchableOpacity className="items-center flex-1 py-1 pr-4" onPress={() => setActiveTab('Meds')}>
                     <View className="items-center flex-row justify-end w-full">
                         <View className="items-center">
                             <Pill size={22} color={activeTab === 'Meds' ? '#1f95d5' : '#94a3b8'} strokeWidth={activeTab === 'Meds' ? 2.5 : 1.8} />
                             <Text className={`text-[8px] font-bold mt-1 uppercase tracking-tighter ${activeTab === 'Meds' ? 'text-brand-blue' : 'text-slate-400'}`}>Medicinas</Text>
                         </View>
                     </View>
                 </TouchableOpacity>
 
                 {/* BOTÓN PLUS CENTRAL (Contraste Amarillo/Blanco) */}
                 <View className="w-16 justify-center items-center h-20 -top-5">
                     <TouchableOpacity 
                         onPress={() => navigation.navigate('AddMedication')}
                         activeOpacity={0.8}
                         className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-xl shadow-brand-dark/40 border-[6px] border-brand-dark"
                     >
                         <Plus size={28} color="#fca827" strokeWidth={3.5} />
                     </TouchableOpacity>
                 </View>
 
                 {/* HISTORIAL */}
                 <TouchableOpacity className="items-center flex-1 py-1 pl-4" onPress={() => setActiveTab('History')}>
                     <View className="items-center flex-row justify-start w-full">
                         <View className="items-center">
                             <History size={22} color={activeTab === 'History' ? '#1f95d5' : '#94a3b8'} strokeWidth={activeTab === 'History' ? 2.5 : 1.8} />
                             <Text className={`text-[8px] font-bold mt-1 uppercase tracking-tighter ${activeTab === 'History' ? 'text-brand-blue' : 'text-slate-400'}`}>Historial</Text>
                         </View>
                     </View>
                 </TouchableOpacity>
 
                 {/* AGENDA */}
                 <TouchableOpacity className="items-center w-[18%] py-1" onPress={() => setActiveTab('Schedule')}>
                     <CalendarDays size={22} color={activeTab === 'Schedule' ? '#7bba47' : '#94a3b8'} strokeWidth={activeTab === 'Schedule' ? 2.5 : 1.8} />
                     <Text className={`text-[8px] font-bold mt-1 uppercase tracking-tighter ${activeTab === 'Schedule' ? 'text-brand-green' : 'text-slate-400'}`}>Agenda</Text>
                 </TouchableOpacity>
             </View>
        </SafeAreaView>
    );
}
