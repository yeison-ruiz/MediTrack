import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, Dimensions, Modal, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Bell, Check, Pill, TrendingUp, CheckCircle, AlertTriangle, Activity, Cloud, CloudOff, Wifi } from 'lucide-react-native';

import * as Speech from 'expo-speech';
import { useAuthStore } from '../store/useAuthStore';
import { useMedicationStore } from '../store/useMedicationStore';
import { useSettingsStore } from '../store/useSettingsStore';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const { user } = useAuthStore();
    const { getDosesByDate, markAsTaken, medications, fetchMedications, loading, lastSync } = useMedicationStore();
    const darkMode = useSettingsStore(state => state.darkMode);
    const [isOnline, setIsOnline] = useState(true);
    const [isInitializing, setIsInitializing] = useState(true);
    const [dismissedDoses, setDismissedDoses] = useState([]); // Track IDs dismissed during this session

    // Voice Helper
    const speak = (text) => {
        try {
            Speech.speak(text, { language: 'es-ES', rate: 0.9 });
        } catch (e) {
            console.error("Speech error", e);
        }
    };

    // Time Formatter
    const formatToAmPm = (timeStr) => {
        if (!timeStr) return '';
        try {
            const [hours, minutes] = timeStr.split(':');
            let h = parseInt(hours, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return `${h}:${minutes} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    // Safety Fetch
    useEffect(() => {
        if (user && medications.length === 0) {
            fetchMedications();
        }
    }, [user]);

    const [timeline, setTimeline] = useState([]);
    const [nextDose, setNextDose] = useState(null);
    const [stats, setStats] = useState({ taken: 0, total: 0, adherence: 0, missed: 0 });
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
    
    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [processingDose, setProcessingDose] = useState(null);

    const loadData = async () => {
        // 1. Cargar dosis de HOY
        let { agenda } = await getDosesByDate(new Date());
        
        // Mapear para UI (añadir isTaken flag basado en status)
        let uiTimeline = agenda.map(item => ({
            ...item,
            isTaken: item.status === 'taken'
        }));

        // 2. ¿Queda algo por hacer HOY?
        let nextRelevant = uiTimeline
            .filter(i => !i.isTaken)
            .sort((a, b) => {
                if (a.status === 'missed' && b.status !== 'missed') return -1;
                if (a.status !== 'missed' && b.status === 'missed') return 1;
                return a.scheduledTime.localeCompare(b.scheduledTime);
            })[0];

        // 3. SI NO HAY NADA HOY, buscar en MAÑANA (Lookahead)
        if (!nextRelevant) {
            console.log("Nada hoy, buscando mañana...");
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const { agenda: tomorrowAgenda } = await getDosesByDate(tomorrow);
            
            if (tomorrowAgenda.length > 0) {
                // Tomamos la primera del día siguiente
                const firstTomorrow = tomorrowAgenda.sort((a,b) => a.scheduledTime.localeCompare(b.scheduledTime))[0];
                if (firstTomorrow) {
                    nextRelevant = { ...firstTomorrow, isTomorrow: true };
                }
            }
        }

        setTimeline(uiTimeline);
        setNextDose(nextRelevant || null);

        // Stats de hoy:
        const totalToday = uiTimeline.length;
        const taken = uiTimeline.filter(i => i.isTaken).length;
        const missed = uiTimeline.filter(i => i.status === 'missed').length;
        
        // El porcentaje es simplemente PROGRESO REAL (1/2 = 50%)
        const adherence = totalToday > 0 ? (taken / totalToday) * 100 : 0;
        
        setStats({ taken, total: totalToday, adherence, missed });
        setIsInitializing(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [medications]) // Re-ejecutar si cambian los medicamentos (ej: borrado)
    );

    const lastAutoPromptId = React.useRef(null);

    // Timer effect para la próxima dosis
    useEffect(() => {
        if (!nextDose) return;
        
        const updateTimer = () => {
            const now = new Date();
            const target = new Date();
            const [h, m] = nextDose.scheduledTime.split(':');
            
            if (nextDose.isTomorrow) {
                target.setDate(target.getDate() + 1);
            }
            
            target.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
            
            let diff = target - now;
            
            // Auto-Popup cuando llega la hora
            if (diff <= 0) {
                 diff = 0;
                 // Solo abrir si es HOY y no se ha abierto ya para esta dosis
                 // Y solo abrir si el retraso es menor a 30 minutos (para no molestar si ya es muy tarde)
                 const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;
                 const IS_VERY_LATE = Math.abs(diff) > THIRTY_MINUTES_IN_MS;

                 if (!nextDose.isTomorrow && 
                     lastAutoPromptId.current !== nextDose.uniqueId && 
                     !modalVisible && 
                     !dismissedDoses.includes(nextDose.uniqueId) &&
                     !IS_VERY_LATE) {
                     lastAutoPromptId.current = nextDose.uniqueId;
                     handleOpenConfirm(nextDose);
                 }
            }

            const hLeft = Math.floor(diff / (1000 * 60 * 60));
            const mLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const sLeft = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ h: hLeft, m: mLeft, s: sLeft });
        };

        const timer = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(timer);
    }, [nextDose, modalVisible]);

    const handleOpenConfirm = (dose) => {
        console.log("Opening confirmation for dose:", dose?.name, dose?.id);
        if (!dose) return;
        setProcessingDose(dose);
        setModalVisible(true);
    };

    const handleAunNo = () => {
        console.log("User postponed dose");
        if (processingDose) {
            setDismissedDoses(prev => [...prev, processingDose.uniqueId]);
        }
        setModalVisible(false);
        setProcessingDose(null);
        speak("Entendido. No olvides tomar tu dosis, te lo recordaré nuevamente en un momento.");
        lastAutoPromptId.current = null;
    };

    const confirmTakeDose = async () => {
        if (!processingDose) return;

        try {
            // 1. Cerrar UI inmediatamente
            setModalVisible(false);
            const savedDoseName = processingDose.name;
            
            // 2. Ejecutar guardado
            await markAsTaken(processingDose.id, 'taken');
            
            speak(`¡Listo! He anotado tu dosis de ${savedDoseName}.`);
            
            // 3. Limpiar estado y refrescar
            setProcessingDose(null);
            
            // Refrescar inmediatamente
            await loadData();
            
            // Refrescar de nuevo en un segundo por si acaso la red tardó
            setTimeout(loadData, 1500);
            
        } catch (error) {
            console.error("Error al confirmar toma:", error);
            setModalVisible(false);
        }
    };

    // Helper para mensaje dinámico
    const getActionMessage = (type) => {
        const lower = (type || '').toLowerCase();
        if (lower.includes('inyección') || lower.includes('inyeccion')) return 'aplicarte tu inyección';
        if (lower.includes('jarabe')) return 'tomarte tu jarabe';
        if (lower.includes('tableta') || lower.includes('pastilla')) return 'tomarte tu pastilla';
        return 'tomar tu medicamento';
    };

    // Card de Estado de Ánimo Dinámica - UNIFICADA CON EL PROGRESO REAL
    const getMoodData = (taken, total, missed) => {
        if (total === 0) return { label: 'Sin Datos', icon: '😶', color: 'bg-slate-100', textColor: 'text-slate-700', darkColor: 'dark:bg-slate-800' };

        // 1. Si hay olvidos (Prioridad máxima)
        if (missed > 0) {
            return { label: 'Dosis Perdida', icon: '⚠️', color: 'bg-red-50', textColor: 'text-red-700', darkColor: 'dark:bg-red-900/20' };
        }

        // 2. Si ya completó TODO el día
        if (taken === total && total > 0) {
            return { 
                label: '¡Meta Cumplida!', 
                icon: '🌟', 
                color: 'bg-emerald-100', 
                textColor: 'text-emerald-900', 
                darkColor: 'dark:bg-emerald-900/40' 
            };
        }

        // 3. Fallback para cuando no ha empezado el día (0%)
        if (taken === 0) {
            return { label: 'Pendiente', icon: '⏰', color: 'bg-amber-50', textColor: 'text-amber-700', darkColor: 'dark:bg-amber-900/20' };
        }

        // 4. Si va por buen camino (ha tomado algo)
        return { label: 'Vas Bien', icon: '👍', color: 'bg-blue-50', textColor: 'text-blue-700', darkColor: 'dark:bg-blue-900/20' };
    };

    const mood = getMoodData(stats.taken, stats.total, stats.missed);

    const renderDoseItem = ({ item }) => {
        // Estilo 1: Tomado
        if (item.isTaken) {
            return (
                <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-700 opacity-60">
                    <View className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full mr-4">
                        <Check size={20} color={darkMode ? "#94a3b8" : "#64748b"} />
                    </View>
                    <View className="flex-1">
                        <Text numberOfLines={1} className="text-xs text-slate-400 font-bold uppercase tracking-wider">TOMADA • {formatToAmPm(item.scheduledTime)}</Text>
                        <Text className="text-lg font-bold text-slate-700 dark:text-slate-300 line-through">{item.name}</Text>
                        <Text className="text-slate-400 text-sm">{item.dosage}</Text>
                    </View>
                </View>
            );
        }

        const isMissed = item.status === 'missed';

        return (
           <TouchableOpacity onPress={() => navigation.navigate('MedicationDetails', { medication: item })} activeOpacity={0.7}>
               <View className={`flex-row items-center bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border ${isMissed ? 'border-red-100 dark:border-red-900' : 'border-slate-100 dark:border-slate-700'}`}>
                   <View className={`p-2 rounded-full mr-4 ${isMissed ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                       {isMissed ? (
                           <AlertTriangle size={20} color="#ef4444" />
                       ) : (
                           <Pill size={20} color={darkMode ? "#cbd5e1" : "#94a3b8"} />
                       )}
                   </View>
                     <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${isMissed ? 'text-red-400' : 'text-slate-400'}`}>
                                 {isMissed ? 'OLVIDADA • ' : 'PENDIENTE • '}{formatToAmPm(item.scheduledTime)}
                            </Text>
                            {item.patientType === 'pet' && (
                                 <View className="bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded-full ml-auto flex-row items-center">
                                     <Text className="text-[10px] mr-1">🐾</Text>
                                     <Text className="text-[9px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-tight">{item.patientName}</Text>
                                 </View>
                            )}
                        </View>
                        <Text className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{item.name}</Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{item.dosage}</Text>
                    </View>
                   {!isMissed && (
                       <View className="h-6 w-6 rounded-full border-2 border-slate-200 dark:border-slate-600" />
                   )}
               </View>
           </TouchableOpacity>
        );
     };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
          <StatusBar style={darkMode ? "light" : "dark"} />
          <View className="px-6 flex-1">
            
            {/* HEADER */}
            <View className="flex-row justify-between items-center mb-6 mt-2">
                <TouchableOpacity className="flex-row items-center" onPress={() => navigation.navigate('Profile')}>
                    <View className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/50 rounded-full items-center justify-center mr-3 border border-indigo-100 dark:border-indigo-800 shadow-sm overflow-hidden">
                        {user?.avatar && user.avatar.startsWith('http') ? (
                            <Image source={{ uri: user.avatar }} className="w-full h-full" />
                        ) : (
                            <Text className="text-2xl">{user?.avatar || "👤"}</Text>
                        )}
                    </View>
                    <View>
                        <View className="flex-row items-center">
                            <Text className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">BIENVENIDO</Text>
                            <View className={`ml-2 px-1.5 py-0.5 rounded-full flex-row items-center ${isOnline ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                                {isOnline ? <Cloud size={10} color="#10b981" /> : <CloudOff size={10} color="#f59e0b" />}
                                <Text className={`text-[8px] font-bold ml-1 ${isOnline ? 'text-emerald-600' : 'text-orange-600'}`}>
                                    {isOnline ? 'SINCRO' : 'LOCAL'}
                                </Text>
                            </View>
                        </View>
                        <Text className="text-lg font-bold text-slate-800 dark:text-white">{user?.name || "Paciente"}</Text>
                        {lastSync && (
                            <Text className="text-[8px] text-slate-400 italic">Sinc: {new Date(lastSync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                        )}
                    </View>
                </TouchableOpacity>
                <TouchableOpacity className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm" onPress={() => navigation.navigate('AlarmSettings')}>
                    <Bell size={20} color={darkMode ? "#e2e8f0" : "#64748b"} />
                </TouchableOpacity>
            </View>
            {/* HERO CARD (Timer / Welcome / All Done) */}
            {isInitializing ? (
                <View className="bg-slate-200 dark:bg-slate-800 w-full h-48 rounded-3xl p-6 mb-6 items-center justify-center">
                    <Activity size={24} color="#64748b" />
                    <Text className="text-slate-500 mt-2 font-bold uppercase text-[10px]">Actualizando tu Agenda...</Text>
                </View>
            ) : medications.length === 0 ? (
                 <View className="bg-indigo-600 dark:bg-indigo-700 w-full rounded-3xl p-6 shadow-xl shadow-indigo-200 dark:shadow-none mb-6 relative overflow-hidden">
                    <View className="absolute -right-10 -top-10 bg-white opacity-10 w-40 h-40 rounded-full" />
                    <View className="absolute -left-10 -bottom-10 bg-white opacity-10 w-32 h-32 rounded-full" />
                    
                    <View className="mb-4">
                        <View className="flex-row items-center mb-1">
                             <Image 
                                source={require('../assets/logomeditrack.png')} 
                                style={{ width: 80, height: 16, marginRight: 6 }}
                                resizeMode="contain"
                             />
                             <Text className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">¡BIENVENIDO!</Text>
                        </View>
                        <Text className="text-white font-bold text-2xl leading-8">Tu salud, organizada.</Text>
                    </View>
                    
                    <Text className="text-indigo-100 text-sm mb-6 leading-5 opacity-90">
                        Añade tu primer medicamento para que podamos recordarte tus dosis y cuidar de ti.
                    </Text>
                    
                    <TouchableOpacity 
                        className="bg-white px-6 py-4 rounded-xl shadow-sm flex-row items-center self-start active:bg-indigo-50"
                        onPress={() => navigation.navigate('AddMedication')}
                    >
                         <View className="bg-indigo-100 p-1 rounded-full mr-2">
                            <Activity size={12} color="#4f46e5" />
                         </View>
                        <Text className="text-indigo-600 font-bold uppercase text-xs tracking-wide">Añadir Medicamento</Text>
                    </TouchableOpacity>
                 </View>
            ) : nextDose ? (
                <View className={`${nextDose.status === 'missed' ? 'bg-red-500 shadow-red-200' : 'bg-blue-600 shadow-blue-200'} w-full rounded-3xl p-6 shadow-xl dark:shadow-none mb-6 relative overflow-hidden`}>
                    <View className="absolute -right-10 -top-10 bg-white opacity-10 w-40 h-40 rounded-full" />
                    <View className="absolute -left-10 -bottom-10 bg-white opacity-10 w-32 h-32 rounded-full" />
    
                    <Text className={`${nextDose.status === 'missed' ? 'text-red-100' : 'text-blue-100'} text-xs font-bold uppercase tracking-widest mb-4 flex-row items-center`}>
                        {nextDose.status === 'missed' ? '⚠️  REPORTAR TOMA: ' : '⏱  PRÓXIMA DOSIS: '} {nextDose.name.toUpperCase()}
                    </Text>
    
                    <View className="flex-row justify-between mb-6">
                        {['HORAS', 'MIN', 'SEG'].map((label, idx) => {
                            const val = idx === 0 ? timeLeft.h : idx === 1 ? timeLeft.m : timeLeft.s;
                            const isMissed = nextDose.status === 'missed';
                            return (
                                <View key={label} className="items-center">
                                    <View className={`${isMissed ? 'bg-red-400/50 border-red-300/30' : nextDose.isTomorrow ? 'bg-slate-500/50 border-white/20' : 'bg-blue-500/50 border-blue-400/30'} rounded-xl w-20 h-16 items-center justify-center mb-1 border`}>
                                        <Text className="text-white text-2xl font-bold">
                                            {isMissed ? '!' : val.toString().padStart(2, '0')}
                                        </Text>
                                    </View>
                                    <Text className={`${isMissed ? 'text-red-200' : 'text-blue-200'} text-[10px] font-bold`}>{label}</Text>
                                </View>
                            );
                        })}
                    </View>
    
                    <View className="flex-row justify-between items-center mt-auto">
                        <View className="flex-1 mr-3">
                            <Text className="text-white font-bold text-lg leading-6">Hora: {formatToAmPm(nextDose.scheduledTime)} • {nextDose.dosage}</Text>
                            <Text className={`${nextDose.status === 'missed' ? 'text-red-100' : 'text-blue-200'} text-xs mt-1 leading-4`}>
                                {nextDose.notes || "Según receta"}
                            </Text>
                        </View>
                        
                        {/* Lógica de Botón Inteligente: Aparece si es Olvidada O si faltan menos de 30 mins */}
                        {(nextDose.status === 'missed' || (timeLeft.h === 0 && timeLeft.m <= 30) || nextDose.isTomorrow) ? (
                            <TouchableOpacity 
                                className="bg-white px-5 py-3 rounded-xl shadow-lg border-2 border-white/50"
                                onPress={() => {
                                    console.log("Botón Registrar Toma presionado");
                                    handleOpenConfirm(nextDose);
                                }}
                                activeOpacity={0.8}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text className={`${nextDose.status === 'missed' ? 'text-red-600' : 'text-blue-600'} font-bold uppercase text-xs`}>
                                    {nextDose.status === 'missed' ? 'Tomar Ahora' : 'Confirmar'}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                className={`${nextDose.status === 'missed' ? 'bg-red-400/30 border-red-300/30' : 'bg-blue-500/30 border-blue-400/30'} border px-5 py-3 rounded-xl`}
                                onPress={() => navigation.navigate('MedicationDetails', { medication: nextDose })}
                            >
                                <Text className={`${nextDose.status === 'missed' ? 'text-red-100' : 'text-blue-100'} font-bold uppercase text-xs`}>Ver Detalles</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ) : (
                <View className="bg-green-600 dark:bg-green-700 w-full rounded-3xl p-8 mb-6 shadow-xl shadow-green-200 dark:shadow-none items-center">
                    <CheckCircle size={40} color="white" />
                    <Text className="text-white font-bold text-xl mt-3">¡Todo al día!</Text>
                    <Text className="text-green-100 mt-1">Has completado todas tus dosis.</Text>
                </View>
            )}
    
            {/* QUICK STATS - Solo si hay datos */}
            {medications.length > 0 && (
                <>
                    <TouchableOpacity onPress={() => navigation.navigate('History')} activeOpacity={0.7}>
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-lg font-bold text-slate-800 dark:text-white">Resumen</Text>
                            <Text className="text-blue-600 dark:text-blue-400 text-sm font-bold">Ver Más</Text>
                        </View>
                    </TouchableOpacity>
            
                    <View className="flex-row space-x-2 mb-6 px-1">
                        <View className={`flex-1 p-4 rounded-3xl border border-slate-100 dark:border-none shadow-sm ${mood.color.split(' ')[0]} dark:bg-slate-800 justify-center`}>
                            <View className="flex-row items-center space-x-1.5 mb-2">
                                <TrendingUp size={14} color={darkMode ? "white" : "#64748b"} opacity={0.6} />
                                <Text className={`text-[10px] font-bold ${darkMode ? 'text-slate-300' : 'text-slate-500'} uppercase tracking-tight`}>Estado</Text>
                            </View>
                            <View className="flex-row items-center space-x-2">
                                <Text className="text-2xl">{mood.icon}</Text>
                                <View className="flex-1">
                                    <Text 
                                        numberOfLines={1} 
                                        adjustsFontSizeToFit
                                        className={`text-[13px] font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}
                                    >
                                        {mood.label}
                                    </Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-[10px] font-bold opacity-50 dark:text-slate-400">{Math.round(stats.adherence || 0)}% Precisión</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
            
                        <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm justify-center">
                                <View className="flex-row items-center space-x-1.5 mb-2">
                                    <Pill size={14} color="#3b82f6" />
                                    <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-tight">Progreso</Text>
                                </View>
                            <View className="flex-row items-baseline space-x-1">
                                <Text className="text-2xl font-black text-slate-800 dark:text-white">{stats.taken}/{stats.total}</Text>
                                <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">{Math.round(stats.adherence || 0)}%</Text>
                            </View>
                        </View>
                    </View>
                </>
            )}
    
            {/* TODAY'S DOSES TITLE */}
            <Text className="text-lg font-bold text-slate-800 dark:text-white mb-3">Agenda de Hoy</Text>
    
            {/* LISTA */}
            <FlatList
                data={timeline}
                keyExtractor={item => item.uniqueId}
                renderItem={renderDoseItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                    medications.length > 0 ? (
                        <View className="py-10 items-center">
                            <Text className="text-slate-400 text-center">No hay dosis programadas para hoy.</Text>
                            <Text className="text-slate-300 text-xs text-center mt-1">Revisa la fecha de inicio de tus medicamentos.</Text>
                        </View>
                    ) : null
                }
            />

            {/* DOCTOR CONFIRMATION MODAL */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/70 px-6">
                    <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl items-center border-4 border-blue-500">
                        <View className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full mb-4">
                            <Activity size={40} color="#3b82f6" />
                        </View>
                        
                        <Text className="text-slate-900 dark:text-white font-bold text-xl text-center mb-1">
                            ¡ATENCIÓN!
                        </Text>
                        
                        <Text className="text-slate-600 dark:text-slate-300 text-base text-center mb-6 font-medium">
                            {processingDose?.patientType === 'pet' ? (
                                <>
                                    Es hora de la medicina de <Text className="font-bold text-orange-500 uppercase">{processingDose?.patientName}</Text>.
                                    {"\n\n"}
                                    ¿Ya le diste su <Text className="font-bold">{processingDose?.name}</Text>?
                                </>
                            ) : (
                                <>
                                    Es hora de <Text className="font-bold text-blue-600">{getActionMessage(processingDose?.type)}</Text>.
                                    {"\n\n"}
                                    ¿Ya te tomaste tu <Text className="font-bold">{processingDose?.name}</Text>?
                                </>
                            )}
                        </Text>

                        <TouchableOpacity 
                            onPress={confirmTakeDose}
                            className="bg-green-500 w-full py-4 rounded-2xl mb-3 shadow-lg shadow-green-200"
                        >
                            <Text className="text-white font-bold text-center text-lg uppercase">SÍ, YA LO HICE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={handleAunNo}
                            className="bg-red-50 dark:bg-red-900/20 w-full py-3 rounded-2xl"
                        >
                             <Text className="text-red-500 font-bold text-center uppercase tracking-widest text-xs">Cerrar / Ver después</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
    
          </View>
        </View>
      );
}
