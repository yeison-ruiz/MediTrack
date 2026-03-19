import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedicationStore } from '../store/useMedicationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAlert } from '../components/AlertSystem';
import { ChevronLeft, Save, Clock, X, Plus, Pill, Droplet, Syringe, Archive, RotateCcw, Calendar, User, Dog } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { speak, scheduleMedicationReminder, cancelScheduledNotification } from '../services/notificationService';
import { useSettingsStore } from '../store/useSettingsStore';

export default function AddMedicationScreen({ navigation, route }) {
  const { medToEdit } = route.params || {}; 
  const isEditing = !!medToEdit;
  const darkMode = useSettingsStore(state => state.darkMode);

  // Estados visuales del formulario
  const [name, setName] = useState('');
  const [medType, setMedType] = useState('Tableta'); // Tableta, Jarabe, Inyección
  const [doseValue, setDoseValue] = useState('');
  const [doseUnit, setDoseUnit] = useState('mg'); // mg, ml, pastillas
  const [frequency, setFrequency] = useState('Una vez al día'); 
  const [times, setTimes] = useState([new Date()]); // Array de fechas
  const [notes, setNotes] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [stockCount, setStockCount] = useState('0');

  // Picker States
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('time'); // 'time' or 'date'
  const [currentPickingIndex, setCurrentPickingIndex] = useState(0);
  const [startDate, setStartDate] = useState(new Date()); 
  const [isForPet, setIsForPet] = useState(false);
  const [petName, setPetName] = useState('');

  const { addMedication, updateMedication, loading } = useMedicationStore();
  const { user } = useAuthStore();

  const mapTypeToSpanish = (englishType) => {
      const map = { 'Tablet': 'Tableta', 'Syrup': 'Jarabe', 'Injection': 'Inyección' };
      return map[englishType] || englishType || 'Tableta';
  };

  useEffect(() => {
    if (medToEdit) {
        setName(medToEdit.name);
        setNotes(medToEdit.notes || '');
        setSideEffects(medToEdit.side_effects || '');
        setStockCount(String(medToEdit.stock_count || 0));
        setMedType(mapTypeToSpanish(medToEdit.type));

        const doseMatch = medToEdit.dosage ? medToEdit.dosage.match(/^(\d+)\s*(.*)$/) : null;
        if (doseMatch) {
            setDoseValue(doseMatch[1]);
            setDoseUnit(doseMatch[2] || 'mg');
        } else {
            setDoseValue(medToEdit.dosage || '');
        }

        const freqMap = { 'Once a day': 'Una vez al día', 'Twice a day': 'Dos veces al día', '3 times a day': '3 veces al día', 'Every 8 hours': 'Cada 8 horas' };
        setFrequency(freqMap[medToEdit.frequency] || medToEdit.frequency || 'Una vez al día');

        try {
            if (medToEdit.times) {
                let parsedTimes = typeof medToEdit.times === 'string' ? JSON.parse(medToEdit.times) : medToEdit.times;
                if (!Array.isArray(parsedTimes)) parsedTimes = [medToEdit.times];
                
                const dateObjects = parsedTimes.map(tStr => {
                     if (typeof tStr === 'string' && tStr.includes(':')) {
                         const [h, m] = tStr.split(':').map(Number);
                         const d = new Date(); d.setHours(h, m, 0, 0); return d;
                     }
                     return new Date();
                });
                setTimes(dateObjects);
            }
        } catch (e) {
            console.error(e);
        }

        if (medToEdit.patientType === 'pet') {
            setIsForPet(true);
            setPetName(medToEdit.patientName || '');
        }
    }
  }, [medToEdit]);

  // Lógica inteligente de frecuencia
  const updateFrequencyNum = (num) => {
      // 1. Actualizar etiqueta visual
      const labels = { 1: 'Una vez al día', 2: 'Dos veces al día', 3: '3 veces al día', 4: '4 veces al día', 5: '5 veces al día' };
      setFrequency(labels[num] || `${num} veces al día`);
      
      // 2. Ajustar automáticamente los relojes (Magic Resize)
      const currentLen = times.length;
      if (num > currentLen) {
          const newTimes = [...times];
          for (let i = currentLen; i < num; i++) {
              const d = new Date();
              // Distribución inteligente básica
              if (i === 1) d.setHours(20, 0, 0, 0); // 2da dosis noche
              if (i === 2) d.setHours(14, 0, 0, 0); // 3ra dosis tarde
              newTimes.push(d);
          }
          setTimes(newTimes);
      } else if (num < currentLen) {
          setTimes(times.slice(0, num));
      }
  };

  const getFreqNumber = () => {
      if (typeof frequency === 'string' && frequency.includes('Una')) return 1;
      if (typeof frequency === 'string' && frequency.includes('Dos')) return 2;
      // Intenta sacar el número del string "3 veces al día"
      const match = frequency.match(/^(\d+)/);
      if (match) return parseInt(match[1]);
      return times.length || 1;
  };
  
  const currentFreqNum = getFreqNumber();

  const onTimeChange = (event, selectedDate) => {
    setShowPicker(false);
    if (!selectedDate) return;

    if (pickerMode === 'time') {
        const newTimes = [...times];
        newTimes[currentPickingIndex] = selectedDate;
        setTimes(newTimes);
    } else {
        // Mode 'date' - Fecha de inicio
        setStartDate(selectedDate);
    }
  };

  const addTime = () => {
    setTimes([...times, new Date()]);
  };

  const removeTime = (index) => {
      const newTimes = times.filter((_, i) => i !== index);
      setTimes(newTimes);
  };

  const { showAlert } = useAlert();

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert('Atención', 'Por favor ingresa el nombre del medicamento.', [], 'warning');
      return;
    }

    const fullDosage = `${doseValue} ${doseUnit}`.trim();
    const formattedTimes = times.map(t => {
        const h = t.getHours().toString().padStart(2, '0');
        const m = t.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    });

    try {
        const patientType = isForPet ? 'pet' : 'user';
        const finalPatientName = isForPet ? petName : (user?.name || 'Usuario'); // Opcional: Guardar nombre del usuario

        if (isEditing) {
            const medicationData = {
                name, dosage: fullDosage, frequency, times: formattedTimes, 
                notes, type: medType, patientName: finalPatientName, 
                patientType, side_effects: sideEffects, 
                stock_count: parseInt(stockCount) || 0
            };
            await updateMedication(medToEdit.id, medicationData);
            showAlert("¡Actualizado!", "El medicamento ha sido modificado exitosamente.", [{ text: "Aceptar", onPress: () => navigation.goBack() }], "success");
        } else {
            // Crear string de fecha LOCAL YYYY-MM-DD para evitar saltos de día por Timezone
            const y = startDate.getFullYear();
            const m = String(startDate.getMonth() + 1).padStart(2, '0');
            const d = String(startDate.getDate()).padStart(2, '0');
            const localStartDate = `${y}-${m}-${d}`;

            await addMedication({
                name,
                dosage: fullDosage,
                frequency,
                times: formattedTimes,
                notes,
                type: medType,
                startDate: localStartDate,
                patientName: finalPatientName,
                patientType,
                side_effects: sideEffects,
                stock_count: parseInt(stockCount) || 0
            });
            showAlert("¡Agregado!", "Tu nuevo medicamento ya está en la agenda.", [{ text: "Perfecto", onPress: () => navigation.goBack() }], "success");
        }
        
        formattedTimes.forEach(timeStr => {
            const [h, m] = timeStr.split(':').map(Number);
            scheduleMedicationReminder(name, fullDosage, h, m);
        });

        // navigation.goBack(); // Movido al onPress del alert para que el usuario vea el éxito

    } catch (error) {
        console.error(error);
        showAlert("Error al Guardar", error.message || "Ocurrió un error inesperado.", [], "error");
    }
  };

  return (
    <SafeAreaView 
        className="flex-1 bg-white dark:bg-slate-900 relative"
        edges={['top', 'left', 'right']}
    >
      <StatusBar style={darkMode ? "light" : "dark"} />
      
      {/* HEADER: Botones superiores y Título en fila aparte */}
      <View className="px-6 pt-12 pb-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
          <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
                  <X size={20} color={darkMode ? "#94a3b8" : "#64748b"} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                  onPress={handleSave} 
                  className="bg-blue-600 px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200"
              >
                  <Text className="text-white font-bold text-sm">Guardar</Text>
              </TouchableOpacity>
          </View>
          
          <Text className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isEditing ? 'Editar' : 'Nuevo'}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 font-medium text-lg -mt-1.5">Medicamento</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 bg-[#FAFAFA] dark:bg-slate-950" showsVerticalScrollIndicator={false}>
        
        {/* 0. WHO IS THIS FOR? */}
        <View className="mb-6">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">¿PARA QUIÉN ES?</Text>
            <View className="flex-row space-x-3 mb-3">
                <TouchableOpacity 
                    onPress={() => setIsForPet(false)}
                    className={`flex-1 py-4 rounded-2xl border flex-row items-center justify-center space-x-2 ${!isForPet ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                >
                    <User size={20} color={!isForPet ? 'white' : (darkMode ? '#94a3b8' : '#64748b')} />
                    <Text className={`font-bold ${!isForPet ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>Para Mí</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setIsForPet(true)}
                    className={`flex-1 py-4 rounded-2xl border flex-row items-center justify-center space-x-2 ${isForPet ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                >
                    <Dog size={20} color={isForPet ? 'white' : (darkMode ? '#94a3b8' : '#64748b')} />
                    <Text className={`font-bold ${isForPet ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>Mascota</Text>
                </TouchableOpacity>
            </View>

            {isForPet && (
                <View className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                     <Text className="text-xs text-orange-600 dark:text-orange-400 font-bold mb-1 uppercase">Nombre de la Mascota</Text>
                     <TextInput 
                        className="text-base text-slate-800 dark:text-white border-b border-orange-200 dark:border-orange-800 py-1"
                        placeholder="ej. Firulais"
                        placeholderTextColor={darkMode ? "#fb923c" : "#fdba74"}
                        value={petName}
                        onChangeText={setPetName}
                     />
                </View>
            )}
        </View>

        {/* 1. NAME */}
        <View className="mb-6">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">NOMBRE DEL MEDICAMENTO</Text>
            <TextInput 
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-base text-slate-800 dark:text-white focus:border-blue-500 shadow-sm"
                placeholder="ej. Amoxicilina"
                placeholderTextColor={darkMode ? "#64748b" : "#94a3b8"}
                value={name}
                onChangeText={setName}
            />
        </View>

        {/* 2. TYPE */}
        <View className="mb-6">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">TIPO DE MEDICAMENTO</Text>
            <View className="flex-row bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-transparent dark:border-slate-800">
                {['Tableta', 'Jarabe', 'Inyección'].map((type) => (
                    <TouchableOpacity 
                        key={type}
                        onPress={() => setMedType(type)}
                        className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${medType === type ? 'bg-white dark:bg-slate-800 shadow-sm dark:border dark:border-slate-700' : ''}`}
                    >
                        {type === 'Tableta' && <Pill size={16} color={medType === type ? (darkMode ? 'white' : 'black') : '#94a3b8'} className="mr-2" />}
                        {type === 'Jarabe' && <Droplet size={16} color={medType === type ? (darkMode ? 'white' : 'black') : '#94a3b8'} className="mr-2" />}
                        {type === 'Inyección' && <Syringe size={16} color={medType === type ? (darkMode ? 'white' : 'black') : '#94a3b8'} className="mr-2" />}
                        <Text className={`font-bold text-xs ${medType === type ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* 3. DOSE & UNIT */}
        <View className="flex-row space-x-4 mb-6">
            {/* Dose */}
            <View className="flex-[2]">
                <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">DOSIS</Text>
                <TextInput 
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-base font-bold text-blue-600 dark:text-blue-400 focus:border-blue-500 shadow-sm text-center"
                    placeholder="500"
                    placeholderTextColor={darkMode ? "#64748b" : "#94a3b8"}
                    keyboardType="numeric"
                    value={doseValue}
                    onChangeText={setDoseValue}
                />
            </View>
            {/* Unit */}
            <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">UNIDAD</Text>
                <TouchableOpacity 
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-row justify-between items-center"
                    onPress={() => {
                        const units = ['mg', 'ml', 'pastillas'];
                        const next = units[(units.indexOf(doseUnit) + 1) % units.length];
                        setDoseUnit(next);
                    }}
                >
                    <Text className="font-bold text-slate-700 dark:text-slate-200">{doseUnit}</Text>
                    <ChevronLeft size={16} color="#94a3b8" style={{ transform: [{ rotate: '-90deg' }] }} />
                </TouchableOpacity>
            </View>
        </View>

        {/* 3.1 START DATE */}
        <View className="mb-6">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">FECHA DE INICIO</Text>
            <TouchableOpacity 
                onPress={() => {
                    setDate(startDate);
                    setPickerMode('date');
                    setShowPicker(true);
                }}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex-row justify-between items-center shadow-sm"
            >
                <Text className="text-base font-bold text-slate-800 dark:text-white">
                    {startDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                <Calendar size={20} color={darkMode ? "#94a3b8" : "#64748b"} />
            </TouchableOpacity>
        </View>

        {/* 4. FREQUENCY (NUMERIC BUTTONS) */}
        <View className="mb-6">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">FRECUENCIA (VECES AL DÍA)</Text>
            <View className="flex-row justify-between space-x-3">
                {[1, 2, 3, 4, 5].map((num) => (
                    <TouchableOpacity 
                        key={num}
                        onPress={() => updateFrequencyNum(num)}
                        className={`flex-1 aspect-square items-center justify-center rounded-xl border-2 ${currentFreqNum === num ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'}`}
                    >
                        <Text className={`text-xl font-bold ${currentFreqNum === num ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {num}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* 5. REMINDERS */}
        <View className="mb-6">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">RECORDATORIOS</Text>
            
            {times.map((time, index) => (
                <View key={index} className="flex-row items-center mb-3">
                    <TouchableOpacity 
                        className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-row items-center active:border-blue-500"
                        onPress={() => { 
                            setCurrentPickingIndex(index); 
                            setPickerMode('time');
                            setDate(time);
                            setShowPicker(true); 
                        }}
                    >
                        <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                            <Clock size={16} color="#2563eb" />
                        </View>
                        <View>
                            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">Toma {index + 1}</Text>
                            <Text className="text-lg font-bold text-slate-800 dark:text-white">
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </Text>
                        </View>
                        <View className="flex-1 items-end">
                            <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">Editar</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ))}
        </View>

        {/* 6. INSTRUCTIONS */}
        <View className="mb-24">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">INSTRUCCIONES ESPECIALES</Text>
            <TextInput 
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-base text-slate-800 dark:text-white focus:border-blue-500 shadow-sm h-24 mb-6"
                placeholder="ej. Tomar con comida, evitar alcohol"
                placeholderTextColor={darkMode ? "#64748b" : "#94a3b8"}
                multiline
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
            />

            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">EFECTOS SECUNDARIOS</Text>
            <TextInput 
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-base text-slate-800 dark:text-white focus:border-blue-500 shadow-sm h-24 mb-6"
                placeholder="ej. Somnolencia, mareos"
                placeholderTextColor={darkMode ? "#64748b" : "#94a3b8"}
                multiline
                textAlignVertical="top"
                value={sideEffects}
                onChangeText={setSideEffects}
            />

            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">CANTIDAD EN INVENTARIO (OPCIONAL)</Text>
            <View className="flex-row items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-24">
                <Archive size={20} color={darkMode ? "#94a3b8" : "#64748b"} className="mr-3" />
                <TextInput 
                    className="flex-1 text-base text-slate-800 dark:text-white font-bold"
                    placeholder="ej. 30"
                    placeholderTextColor={darkMode ? "#64748b" : "#94a3b8"}
                    keyboardType="numeric"
                    value={stockCount}
                    onChangeText={setStockCount}
                />
                <Text className="text-slate-400 text-xs ml-2 uppercase font-bold">Unidades</Text>
            </View>
        </View>

      </ScrollView>

      {/* FOOTER */}
      {isEditing && (
          <View className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-row space-x-3">
              <TouchableOpacity className="flex-1 bg-slate-100 dark:bg-slate-800 py-4 rounded-xl items-center">
                  <Text className="font-bold text-slate-600 dark:text-slate-300">Archivar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} className="flex-[2] bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-200 dark:shadow-none">
                  <Text className="font-bold text-white">Actualizar Medicamento</Text>
              </TouchableOpacity>
          </View>
      )}

      {showPicker && (
         <DateTimePicker
           value={date}
           mode={pickerMode}
           is24Hour={false}
           display="spinner"
           onChange={onTimeChange}
           minimumDate={pickerMode === 'date' ? new Date() : undefined}
         />
      )}

    </SafeAreaView>
  );
}
