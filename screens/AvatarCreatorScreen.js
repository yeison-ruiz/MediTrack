import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, User, Smile, Briefcase, Glasses, Star, Heart } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '../store/useSettingsStore';

// CATEGORÍAS DE AVATARES NATIVOS (Emojis HD)
const AVATAR_Categories = {
    base: ['👨', '👩', '👱‍♂️', '👱‍♀️', '👴', '👵', '🧔', '👳‍♂️', '🧕'],
    style: ['👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬'],
    fun: ['🦸‍♂️', '🦸‍♀️', '🦹‍♂️', '🕵️‍♂️', '👸', '🤴', '👷‍♂️', '👷‍♀️', '👮‍♂️', '🧗‍♂️', '🚴‍♀️'],
    fantasy: ['🤖', '👽', '👻', '👾', '🦄', '🐲', '🧟', '🧛‍♂️', '🧚‍♀️', '🧜‍♂️']
};

const TABS = [
    { id: 'style', icon: Briefcase, label: 'PROFESIÓN' },
    { id: 'base', icon: User, label: 'ESENCIAL' },
    { id: 'fun', icon: Smile, label: 'DIVERSIÓN' },
    { id: 'fantasy', icon: Star, label: 'MÁGICO' },
];

const BG_GRADIENTS = [
    { colors: ['#eff6ff', '#dbeafe'], name: 'Blue Sky' },
    { colors: ['#f0fdf4', '#dcfce7'], name: 'Soft Green' },
    { colors: ['#faf5ff', '#f3e8ff'], name: 'Lavender' },
    { colors: ['#fff7ed', '#ffedd5'], name: 'Sunset' },
    { colors: ['#fdf2f8', '#fce7f3'], name: 'Pink Rose' },
    { colors: ['#f8fafc', '#f1f5f9'], name: 'Slate' },
    { colors: ['#fff1f2', '#ffe4e6'], name: 'Rose' },
    { colors: ['#ecfdf5', '#d1fae5'], name: 'Emerald' }
];

export default function AvatarCreatorScreen({ navigation, route }) {
    const { onSave } = route.params || {};
    const [selectedAvatar, setSelectedAvatar] = useState('👨‍⚕️'); 
    const [activeTab, setActiveTab] = useState('style');
    const [selectedGradient, setSelectedGradient] = useState(BG_GRADIENTS[0]);
    const darkMode = useSettingsStore(state => state.darkMode);

    const handleSave = () => {
        if (onSave) {
            // Pasamos un objeto con el avatar y los colores de fondo para persistencia
            onSave(selectedAvatar); 
        }
        navigation.goBack();
    };

    return (
        <SafeAreaView 
            className="flex-1 bg-white dark:bg-slate-900"
            edges={['top', 'left', 'right']}
        >
            <StatusBar style={darkMode ? "light" : "dark"} />

            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full">
                    <X size={20} color={darkMode ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Tu Identidad</Text>
                <TouchableOpacity onPress={handleSave} className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                    <Check size={20} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {/* Preview Stage - More Premium */}
            <View className="items-center justify-center py-12 bg-slate-50 dark:bg-slate-800/50">
                <View className="relative">
                    {/* Outer Glow */}
                    <View className="absolute -inset-4 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl" />
                    
                    <LinearGradient
                        colors={selectedGradient.colors}
                        className="w-52 h-52 rounded-[60px] items-center justify-center shadow-2xl shadow-blue-200 dark:shadow-none border-4 border-white dark:border-slate-700"
                    >
                        <Text style={{ fontSize: 110 }}>{selectedAvatar}</Text>
                        
                        {/* Status Bubble Decorative */}
                        <View className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg border border-slate-50 dark:border-slate-700">
                             <Heart size={20} color="#ef4444" fill="#ef4444" />
                        </View>
                    </LinearGradient>
                </View>

                {/* Gradient Picker */}
                <View className="flex-row mt-10 px-6 space-x-3 items-center">
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">FONDO</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 40 }}>
                        <View className="flex-row space-x-3">
                            {BG_GRADIENTS.map((grad, idx) => (
                                <TouchableOpacity 
                                    key={idx}
                                    onPress={() => setSelectedGradient(grad)}
                                    className={`w-10 h-10 rounded-2xl border-2 overflow-hidden ${selectedGradient === grad ? 'border-blue-500 scale-110 shadow-lg' : 'border-white dark:border-slate-600 shadow-sm'}`}
                                >
                                    <LinearGradient colors={grad.colors} className="flex-1" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Tabs - Modernized */}
            <View className="flex-row px-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                {TABS.map(tab => (
                    <TouchableOpacity 
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        className="flex-1 items-center py-5 relative"
                    >
                        <View className={`p-2.5 rounded-2xl ${activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-transparent'}`}>
                             <tab.icon size={18} color={activeTab === tab.id ? '#3b82f6' : (darkMode ? '#64748b' : '#94a3b8')} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        </View>
                        <Text className={`text-[9px] font-black mt-2 tracking-widest uppercase ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {tab.label}
                        </Text>
                        {activeTab === tab.id && (
                            <View className="absolute bottom-0 w-8 h-1 bg-blue-500 rounded-t-full" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Grid - Enhanced */}
            <ScrollView className="flex-1 bg-white dark:bg-slate-900 px-4 pt-6" showsVerticalScrollIndicator={false}>
                <View className="flex-row flex-wrap justify-between pb-32">
                    {AVATAR_Categories[activeTab].map((avatar, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedAvatar(avatar)}
                            className={`w-[30%] aspect-square items-center justify-center mb-6 rounded-[28px] border-2 ${selectedAvatar === avatar ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-xl shadow-blue-100' : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-50 dark:border-slate-800 shadow-sm'}`}
                        >
                            <Text style={{ fontSize: 42 }}>{avatar}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Float Action Button */}
            <View className="absolute bottom-10 left-6 right-6">
                <TouchableOpacity 
                    className="bg-blue-600 w-full py-5 rounded-2xl shadow-xl shadow-blue-400/30 dark:shadow-none items-center flex-row justify-center active:scale-[0.98] transition-all"
                    onPress={handleSave}
                >
                    <Text className="text-white font-black text-lg mr-3">Guardar Avatar</Text>
                    <View className="bg-white/20 p-1 rounded-lg">
                        <Check size={18} color="white" strokeWidth={4} />
                    </View>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
