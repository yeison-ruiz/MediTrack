import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, User, Smile, Briefcase, Glasses } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '../store/useSettingsStore';

// CATEGORÍAS DE AVATARES NATIVOS (Emojis HD)
const AVATAR_Categories = {
    base: ['👨', '👩', '👱‍♂️', '👱‍♀️', '👴', '👵', '🧔', '👳‍♂️', '🧕'],
    style: ['👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬'],
    fun: ['🦸‍♂️', '🦸‍♀️', '🦹‍♂️', '🕵️‍♂️', '👸', '🤴', '👷‍♂️', '👷‍♀️', '👮‍♂️'],
    fantasy: ['🤖', '👽', '👻', '👾', '🦄', '🐲', '🧟', '🧛‍♂️']
};

const TABS = [
    { id: 'base', icon: User, label: 'BÁSICO' },
    { id: 'style', icon: Briefcase, label: 'ESTILO' },
    { id: 'fun', icon: Smile, label: 'DIVERTIDO' },
    { id: 'fantasy', icon: Glasses, label: 'FANTASÍA' },
];

export default function AvatarCreatorScreen({ navigation, route }) {
    const { onSave } = route.params || {};
    const [selectedAvatar, setSelectedAvatar] = useState('👨‍⚕️'); // Default
    const [activeTab, setActiveTab] = useState('style');
    const [bgColor, setBgColor] = useState('bg-blue-100');
    const darkMode = useSettingsStore(state => state.darkMode);

    // Colores de fondo para personalizar más (con variantes dark si fuera necesario, pero son para el avatar)
    const bgColors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-pink-100', 'bg-slate-200'];

    const handleSave = () => {
        if (onSave) onSave(selectedAvatar); // Guardamos el caracter directamente
        navigation.goBack();
    };

    return (
        <SafeAreaView 
            className="flex-1 bg-white dark:bg-slate-900"
            edges={['top', 'left', 'right']}
        >
            <StatusBar style={darkMode ? "light" : "dark"} />

            {/* Header */}
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-50 dark:border-slate-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center p-2">
                    <X size={24} color={darkMode ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-800 dark:text-white">Elige tu Avatar</Text>
                <TouchableOpacity onPress={handleSave} className="p-2">
                    <Check size={24} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {/* Preview Stage */}
            <View className="items-center justify-center py-10 bg-slate-50 dark:bg-slate-800 relative">
                 <View className={`w-48 h-48 rounded-full items-center justify-center shadow-sm border-4 border-white dark:border-slate-700 ${bgColor}`}>
                      <Text style={{ fontSize: 100 }}>{selectedAvatar}</Text>
                 </View>
                 
                 {/* Color Picker Mini */}
                 <View className="flex-row mt-6 space-x-3">
                     {bgColors.map(color => (
                         <TouchableOpacity 
                            key={color}
                            onPress={() => setBgColor(color)}
                            className={`w-8 h-8 rounded-full border-2 ${bgColor === color ? 'border-slate-800 dark:border-white scale-110' : 'border-white dark:border-slate-600 shadow-sm'} ${color}`}
                         />
                     ))}
                 </View>
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-slate-100 dark:border-slate-700">
                {TABS.map(tab => (
                    <TouchableOpacity 
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        className={`flex-1 items-center py-4 border-b-2 ${activeTab === tab.id ? 'border-blue-500' : 'border-transparent'}`}
                    >
                        <tab.icon size={20} color={activeTab === tab.id ? '#3b82f6' : (darkMode ? '#94a3b8' : '#94a3b8')} />
                        <Text className={`text-[10px] font-bold mt-1 ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Grid */}
            <ScrollView className="flex-1 bg-white dark:bg-slate-900 px-2 pt-4">
                <View className="flex-row flex-wrap justify-center pb-20">
                    {AVATAR_Categories[activeTab].map((avatar, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedAvatar(avatar)}
                            className={`w-20 h-20 items-center justify-center m-2 rounded-2xl border-2 ${selectedAvatar === avatar ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500' : 'bg-slate-50/50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                        >
                            <Text className="text-4xl">{avatar}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer Button */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800">
                <TouchableOpacity 
                    className="bg-blue-600 w-full py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none items-center flex-row justify-center"
                    onPress={handleSave}
                >
                    <Text className="text-white font-bold text-lg mr-2">Usar este Avatar</Text>
                    <Check size={20} color="white" strokeWidth={3} />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
