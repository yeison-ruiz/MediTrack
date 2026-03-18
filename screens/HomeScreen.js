import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, Dimensions, Modal, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Bell, Check, Pill, TrendingUp, CheckCircle, AlertTriangle, Activity } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useMedicationStore } from '../store/useMedicationStore';
import { useSettingsStore } from '../store/useSettingsStore';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const { user } = useAuthStore();
    const { getDosesByDate, markAsTaken, medications, fetchMedications } = useMedicationStore();
    const darkMode = useSettingsStore(state => state.darkMode);

    // Safety Fetch
    useEffect(() => {
        if (user && medications.length === 0) {
            fetchMedications();
        }
    }, [user]);

    const [timeline, setTimeline] = useState([]);
    const [nextDose, setNextDose] = useState(null);
    const [stats, setStats] = useState({ taken: 0, total: 0, adherence: 0 });
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
    
    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [processingDose, setProcessingDose] = useState(null);

    const loadData = async () => {
        // Cargar dosis de HOY
        const { agenda } = await getDosesByDate(new Date());
        
        // Mapear para UI (añadir isTaken flag basado en status)
        const uiTimeline = agenda.map(item => ({
            ...item,
            isTaken: item.status === 'taken'
        }));

        setTimeline(uiTimeline);

        // Calcular Stats
        const total = uiTimeline.length;
        const taken = uiTimeline.filter(i => i.isTaken).length;
        const adherence = total > 0 ? (taken / total) * 100 : 100;
        setStats({ taken, total, adherence });

        // Calcular Próxima Dosis (primera pendiente)
        const pending = uiTimeline.find(i => !i.isTaken && i.status !== 'missed');
        setNextDose(pending || null);
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
            const [h, m] = nextDose.scheduledTime.split(':');
            const target = new Date();
            target.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
            
            let diff = target - now;
            
            // Auto-Popup cuando llega la hora
            if (diff <= 0) {
                 diff = 0;
                 
                 // Solo abrir si no se ha abierto ya para estai dosis específica
                 if (lastAutoPromptId.current !== nextDose.uniqueId && !modalVisible) {
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
        setProcessingDose(dose);
        setModalVisible(true);
    };

    const confirmTakeDose = async () => {
        if (processingDose) {
            await markAsTaken(processingDose.id, 'taken');
            setModalVisible(false);
            setProcessingDose(null);
            loadData(); // Recargar para actualizar UI
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

    // Card de Estado de Ánimo (Simulado)
    const mood = { label: 'Muy Bien', icon: '😄', color: 'bg-green-100' };

    const renderDoseItem = ({ item }) => {
        // Estilo 1: Tomado
        if (item.isTaken) {
            return (
                <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-700 opacity-60">
                    <View className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full mr-4">
                        <Check size={20} color={darkMode ? "#94a3b8" : "#64748b"} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">TOMADA • {item.scheduledTime}</Text>
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
                       <View className="flex-row items-center mb-0.5">
                           <Text className={`text-xs font-bold uppercase tracking-wider ${isMissed ? 'text-red-400' : 'text-slate-400'}`}>
                               {isMissed ? 'OLVIDADA • ' : 'PENDIENTE • '} {item.scheduledTime}
                           </Text>
                           {item.patientType === 'pet' && (
                                <View className="bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded ml-2 flex-row items-center">
                                    <Text className="text-[10px] mr-1">🐾</Text>
                                    <Text className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase">{item.patientName}</Text>
                                </View>
                           )}
                       </View>
                       <Text className="text-lg font-bold text-slate-800 dark:text-white">{item.name}</Text>
                       <Text className="text-slate-500 dark:text-slate-400 text-sm">{item.dosage}</Text>
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
                        <Text className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">BIENVENIDO</Text>
                        <Text className="text-lg font-bold text-slate-800 dark:text-white">{user?.name || "Paciente"}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm" onPress={() => navigation.navigate('AlarmSettings')}>
                    <Bell size={20} color={darkMode ? "#e2e8f0" : "#64748b"} />
                </TouchableOpacity>
            </View>
    
            {/* HERO CARD (Timer) */}
            {/* HERO CARD (Timer / Welcome / All Done) */}
            {medications.length === 0 ? (
                 <View className="bg-indigo-600 dark:bg-indigo-700 w-full rounded-3xl p-6 shadow-xl shadow-indigo-200 dark:shadow-none mb-6 relative overflow-hidden">
                    <View className="absolute -right-10 -top-10 bg-white opacity-10 w-40 h-40 rounded-full" />
                    <View className="absolute -left-10 -bottom-10 bg-white opacity-10 w-32 h-32 rounded-full" />
                    
                    <View className="mb-4">
                        <View className="flex-row items-center mb-1">
                             <Image 
                                source={require('../assets/logomeditrack.png')} 
                                style={{ width: 16, height: 16, marginRight: 6 }}
                                resizeMode="contain"
                             />
                             <Text className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">¡BIENVENIDO A MEDITRACK!</Text>
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
                <View className="bg-blue-600 dark:bg-blue-700 w-full rounded-3xl p-6 shadow-xl shadow-blue-200 dark:shadow-none mb-6 relative overflow-hidden">
                    <View className="absolute -right-10 -top-10 bg-white opacity-10 w-40 h-40 rounded-full" />
                    <View className="absolute -left-10 -bottom-10 bg-white opacity-10 w-32 h-32 rounded-full" />
    
                    <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-4 flex-row items-center">
                        ⏱  PRÓXIMA DOSIS: {nextDose.name.toUpperCase()}
                    </Text>
    
                    <View className="flex-row justify-between mb-6">
                        {['HORAS', 'MIN', 'SEG'].map((label, idx) => {
                            const val = idx === 0 ? timeLeft.h : idx === 1 ? timeLeft.m : timeLeft.s;
                            return (
                                <View key={label} className="items-center">
                                    <View className="bg-blue-500/50 rounded-xl w-20 h-16 items-center justify-center mb-1 border border-blue-400/30">
                                        <Text className="text-white text-2xl font-bold">{val.toString().padStart(2, '0')}</Text>
                                    </View>
                                    <Text className="text-blue-200 text-[10px] font-bold">{label}</Text>
                                </View>
                            );
                        })}
                    </View>
    
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-white font-bold text-lg">{nextDose.scheduledTime} • {nextDose.dosage}</Text>
                            <Text className="text-blue-200 text-sm">{nextDose.notes || "Según receta"}</Text>
                        </View>
                        
                        {/* Lógica de Botón Inteligente: Prevenir tomas tempranas */}
                        {timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0 ? (
                            <TouchableOpacity 
                                className="bg-white px-6 py-3 rounded-xl shadow-sm"
                                onPress={() => handleOpenConfirm(nextDose)}
                            >
                                <Text className="text-blue-600 font-bold uppercase text-xs">Registrar Toma</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                className="bg-blue-500/30 border border-blue-400/30 px-6 py-3 rounded-xl"
                                onPress={() => navigation.navigate('MedicationDetails', { medication: nextDose })}
                            >
                                <Text className="text-blue-100 font-bold uppercase text-xs">Ver Detalles</Text>
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
            
                    <View className="flex-row space-x-4 mb-6">
                        <View className={`flex-1 p-4 rounded-2xl border border-slate-100 dark:border-none shadow-sm ${mood.color.split(' ')[0]} dark:bg-slate-800`}>
                            <View className="flex-row items-center space-x-2 mb-2">
                                <TrendingUp size={16} color={darkMode ? "white" : "black"} opacity={0.5} />
                                <Text className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600/70'}`}>Estado</Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-4xl">{mood.icon}</Text>
                                <View className="items-end">
                                    <Text className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{mood.label}</Text>
                                    <Text className="text-xs font-bold opacity-50 dark:text-slate-400">{Math.round(stats.adherence)}%</Text>
                                </View>
                            </View>
                        </View>
            
                        <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <View className="flex-row items-center space-x-2 mb-2">
                                    <Pill size={16} color="#3b82f6" />
                                    <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold">Progreso Diario</Text>
                                </View>
                            <View className="flex-row items-baseline space-x-2 gap-2">
                                <Text className="text-2xl font-bold text-slate-800 dark:text-white">{stats.taken}/{stats.total}</Text>
                                <Text className="text-slate-400 text-xs font-bold">{Math.round(stats.adherence || 0)}%</Text>
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
                            onPress={() => setModalVisible(false)}
                            className="bg-red-50 dark:bg-red-900/20 w-full py-3 rounded-2xl"
                        >
                             <Text className="text-red-500 font-bold text-center">NO, AÚN NO</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
    
          </View>
        </View>
      );
}
