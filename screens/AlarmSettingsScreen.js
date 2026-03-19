import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Platform, Linking, Alert, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Volume2, User, Play, Bell, Lock, ShieldCheck, Volume1, VolumeX } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import Slider from '@react-native-community/slider';
import * as Speech from 'expo-speech';
import { useSettingsStore } from '../store/useSettingsStore';
import { scheduleTestNotification } from '../services/notificationService';

export default function AlarmSettingsScreen({ navigation }) {
  const { voiceEnabled, volume, setVoiceEnabled, setVolume } = useSettingsStore();

  const handleTestSound = () => {
    if (voiceEnabled) {
      Speech.speak("Hola, es hora de tu medicamento", { rate: 0.9, pitch: 1.0, volume: volume });
    } else {
      // Si el usuario tiene voz desactivada, quizás solo un beep?
      // Por ahora forzamos un speech de prueba para que escuche el volumen
      Speech.speak("Prueba de volumen de alerta", { rate: 0.9, pitch: 1.0, volume: volume });
    }
  };

  return (
    <SafeAreaView 
        className="flex-1 bg-slate-50"
        edges={['top', 'left', 'right']}
    >
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2 rounded-full active:bg-slate-100">
            <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800 flex-1 text-center mr-10">Configuración de Alarmas</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>

        {/* 1. VOICE ALERTS */}
        <Text className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider pl-1">Alertas de Voz</Text>
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100">
            <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1 pr-4">
                    <Text className="text-base font-bold text-slate-800 mb-1">Activar Recordatorios de Voz</Text>
                    <Text className="text-sm text-slate-500 leading-5">
                       Lee "Es hora de tu medicamento" en voz alta junto con la alarma.
                    </Text>
                </View>
                <Switch 
                    trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
                    thumbColor={"#ffffff"}
                    ios_backgroundColor="#e2e8f0"
                    onValueChange={setVoiceEnabled}
                    value={voiceEnabled}
                />
            </View>
        </View>

        {/* 1.5 APARIENCIA (Nuevo) */}
        <Text className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider pl-1">Apariencia</Text>
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100">
            <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-4">
                    <Text className="text-base font-bold text-slate-800 mb-1">Modo Oscuro</Text>
                    <Text className="text-sm text-slate-500 leading-5">
                       Cambia a un tema visual oscuro para reducir la fatiga visual.
                    </Text>
                </View>
                <Switch 
                     trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
                     thumbColor={"#ffffff"}
                     ios_backgroundColor="#e2e8f0"
                     value={useSettingsStore(state => state.darkMode)}
                     onValueChange={(val) => useSettingsStore.getState().setDarkMode(val)}
                />
            </View>
        </View>

        {/* 2. SOUND & VOLUME */}
        <Text className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider pl-1">Sonido y Volumen</Text>
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-medium text-slate-800">Volumen de Alerta</Text>
                <Text className="text-blue-600 font-bold">{Math.round(volume * 100)}%</Text>
            </View>

            <View className="flex-row items-center mb-6 space-x-3">
                <Volume1 size={20} color="#94a3b8" />
                <Slider
                    style={{flex: 1, height: 40}}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    onValueChange={setVolume}
                    minimumTrackTintColor="#3b82f6"
                    maximumTrackTintColor="#e2e8f0"
                    thumbTintColor="#3b82f6"
                />
                <Volume2 size={24} color="#64748b" />
            </View>

            <TouchableOpacity 
                onPress={handleTestSound}
                className="flex-row items-center justify-center py-3 rounded-xl border border-blue-200 bg-blue-50 active:bg-blue-100 mb-2"
            >
                <Play size={18} color="#2563eb" fill="#2563eb" />
                <Text className="ml-2 text-blue-600 font-bold">Probar Voz (TTS)</Text>
            </TouchableOpacity>

             <TouchableOpacity 
                onPress={scheduleTestNotification}
                className="flex-row items-center justify-center py-3 rounded-xl border border-orange-200 bg-orange-50 active:bg-orange-100"
            >
                <Bell size={18} color="#ea580c" />
                <Text className="ml-2 text-orange-600 font-bold">Probar Alarma Real (5s)</Text>
            </TouchableOpacity>
        </View>

        {/* 3. OFFLINE INFO CARD */}
        <View className="bg-blue-50 rounded-2xl p-5 mb-8 border border-blue-100 flex-row">
            <View className="bg-blue-100 p-2 rounded-full h-10 w-10 items-center justify-center mr-4">
               <ShieldCheck size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
                <Text className="text-blue-700 font-bold text-base mb-1">Confiabilidad Offline</Text>
                <Text className="text-blue-600/80 text-sm leading-5">
                    Las alertas de MediTrack se guardan localmente en tu dispositivo. Funcionarán incluso sin internet o en modo avión.
                </Text>
            </View>
        </View>

        {/* 4. SYSTEM SETTINGS */}
        <Text className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider pl-1">Ajustes del Sistema</Text>
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-8">
            <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-slate-100 active:bg-slate-50"
                onPress={() => {
                    if (Platform.OS === 'ios') {
                        Linking.openURL('app-settings:');
                    } else {
                        Linking.openSettings();
                    }
                }}
            >
                <Bell size={20} color="#64748b" />
                <Text className="flex-1 ml-4 text-slate-700 font-medium">Permisos de Notificación</Text>
                <View className="flex-row items-center">
                    <Text className="text-green-600 text-sm font-medium mr-2">Configurar</Text>
                    <ChevronLeft size={16} color="#cbd5e1" style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity 
                className="flex-row items-center p-4 active:bg-slate-50"
                 onPress={() => {
                    if (Platform.OS === 'ios') {
                        Linking.openURL('app-settings:');
                    } else {
                        Linking.openSettings();
                    }
                }}
            >
                <Lock size={20} color="#64748b" />
                <Text className="flex-1 ml-4 text-slate-700 font-medium">Acceso en Pantalla de Bloqueo</Text>
                <View className="flex-row items-center">
                    <Text className="text-slate-400 text-sm font-medium mr-2">Configurar</Text>
                    <ChevronLeft size={16} color="#cbd5e1" style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
            </TouchableOpacity>
        </View>

        <View className="items-center mb-10">
            <Text className="text-xs text-slate-400">MediTrack v1.0.0 • Chequeado hoy 10:45 AM</Text>
        </View>

      </ScrollView>

      {/* FOOTER SAVE BUTTON */}
      <View className="p-4 border-t border-slate-200 bg-white">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-full bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-200 active:bg-blue-700"
          >
              <Text className="text-white font-bold text-lg">Guardar Cambios</Text>
          </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
