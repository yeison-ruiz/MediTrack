import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { Check, Clock, X, Info, Bell, Briefcase, FileText } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useMedicationStore } from '../store/useMedicationStore';
import { speak } from '../services/notificationService';

const { width } = Dimensions.get('window');

export default function DoseConfirmationScreen({ navigation, route }) {
  const { medication } = route.params || {};
  const { markAsTaken } = useMedicationStore();

  if (!medication) {
      return (
          <SafeAreaView className="flex-1 justify-center items-center bg-white">
              <Text>No medication data found.</Text>
              <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
                  <Text className="text-blue-500">Go Back</Text>
              </TouchableOpacity>
          </SafeAreaView>
      );
  }

  const handleTake = async () => {
      await markAsTaken(medication.id, 'taken');
      speak(`Excelente. Dosis de ${medication.name} registrada. He detenido los recordatorios persistentes para esta toma.`);
      navigation.goBack();
  };

  const handleSnooze = () => {
      // Logic for snooze would go here (reschedule notification)
      alert("Alarma pospuesta 10 minutos (Simulado)");
      navigation.goBack();
  };

  const handleSkip = async () => {
      // Could mark as skipped
       await markAsTaken(medication.id, 'skipped');
       navigation.goBack();
  };

  return (
    <View className="flex-1 bg-black/40 justify-center items-center px-6">
      <StatusBar style="light" />
      
      {/* MAIN CARD */}
      <View className="bg-white w-full rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Header */}
          <View className="flex-row justify-center items-center py-4 border-b border-slate-100 bg-slate-50/50">
              <Bell size={16} color="#64748b" style={{ marginRight: 8 }} />
              <Text className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Recordatorio de Dosis</Text>
          </View>

          {/* Body */}
          <View className="items-center p-6 space-y-6">
              
              {/* Bell Icon Circle */}
              <View className="bg-blue-100 p-6 rounded-full items-center justify-center mb-2 animate-bounce">
                  <Bell size={40} color="#3b82f6" fill="#3b82f6" />
              </View>
              
              {/* Badge */}
              <View className="bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                  <Text className="text-blue-600 font-bold text-[10px] tracking-wider uppercase">Programado Ahora</Text>
              </View>

              {/* Title & Info */}
              <View className="items-center">
                  <Text className="text-3xl font-bold text-slate-800 text-center mb-1">
                      Hora de {medication.name}
                  </Text>
                  
                  <Text className="text-slate-500 font-medium text-base mb-1">
                      {medication.dosage}
                  </Text>

                  <Text className="text-slate-400 text-sm">
                      Programado: {medication.scheduledTime || "Ahora"} • {medication.type || "Medicina"}
                  </Text>
              </View>

              {/* Visual Pill Placeholder */}
              <View className="bg-[#F5F5F0] h-32 w-32 rounded-2xl items-center justify-center shadow-inner mb-2">
                   {/* Here we would put the real image if available */}
                   <View className="bg-white p-4 rounded-full shadow-sm">
                        <View className="w-12 h-6 bg-slate-200 rounded-full rotate-45" /> 
                   </View>
                   <Text className="text-[10px] text-slate-400 mt-3 absolute bottom-2 italic">
                       Imagen referencial
                   </Text>
              </View>

              {/* Info Box */}
              <View className="bg-blue-50 w-full p-4 rounded-xl flex-row items-start border border-blue-100">
                  <Info size={20} color="#3b82f6" className="mt-0.5" />
                  <Text className="flex-1 ml-3 text-blue-800 text-sm leading-5">
                      {medication.notes || "Tome con un vaso lleno de agua. Puede tomarse con o sin alimentos."}
                  </Text>
              </View>

              {/* Actions */}
              <View className="w-full space-y-3 pt-2">
                  <TouchableOpacity 
                      onPress={handleTake}
                      className="bg-blue-600 w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-200 active:bg-blue-700"
                  >
                      <View className="bg-white/20 p-1 rounded-full mr-2">
                          <Check size={16} color="white" strokeWidth={4} />
                      </View>
                      <Text className="text-white font-bold text-lg">Ya me la tomé</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                      onPress={handleSnooze}
                      className="bg-slate-100 w-full py-4 rounded-xl flex-row items-center justify-center border border-slate-200 active:bg-slate-200"
                  >
                      <Clock size={20} color="#334155" className="mr-2" />
                      <Text className="text-slate-700 font-bold text-lg">Posponer 10m</Text>
                  </TouchableOpacity>
              </View>

              {/* Footer Links */}
              <View className="flex-row justify-between w-full pt-2">
                  <TouchableOpacity onPress={handleSkip}>
                      <Text className="text-slate-400 font-bold text-sm">Saltar Dosis</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => navigation.navigate('MedicationDetails', { medication })}>
                      <Text className="text-blue-500 font-bold text-sm">Ver Instrucciones</Text>
                  </TouchableOpacity>
              </View>

          </View>
      </View>
    </View>
  );
}
