import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { StatusBar } from 'expo-status-bar';
import { Briefcase, ArrowRight, UserPlus, Mail, Lock, Eye, EyeOff, User, Smile, ShieldCheck, Plus } from 'lucide-react-native';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null); // URL de DiceBear
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading } = useAuthStore();

  const handleRegister = async () => {
    // 1. Limpieza
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 2. Validaciones Individuales
    if (!cleanName) return Alert.alert("Falta Nombre", "Por favor ingresa tu nombre");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) return Alert.alert("Correo Inválido", "Por favor ingresa un correo electrónico válido");

    if (!cleanPassword || cleanPassword.length < 6) return Alert.alert("Contraseña Débil", "La contraseña debe tener al menos 6 caracteres");

    // 3. Registro
    try {
        const finalAvatar = avatarUrl || '👤';
        const result = await register(cleanName, cleanEmail, cleanPassword, finalAvatar);

        if (result && result.success) {
            // Navegación directa sin popup
            navigation.navigate('Verify');
        }
    } catch (error) {
        Alert.alert("Error de Registro", error.message);
    }
  };

  const openAvatarCreator = () => {
    navigation.navigate('AvatarCreator', {
      onSave: (url) => setAvatarUrl(url)
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      {/* Background Decor */}
      <View className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-brand-blue/5 rounded-full" />

      {/* Header Section Ultra-Compact */}
      <View className="px-6 pt-1 items-center">
         <View className="bg-white p-5 rounded-full shadow-2xl shadow-brand-blue/20 mb-1 border-2 border-slate-50">
            <Image 
                source={require('../assets/logomeditrack.png')} 
                style={{ width: 90, height: 90 }}
                resizeMode="contain"
            />
         </View>
         <Text className="text-2xl font-black text-brand-dark">Crea tu Cuenta</Text>
         <Text className="text-slate-400 text-[10px] text-center px-4">Gestiona tu salud profesionalmente.</Text>
      </View>

      {/* Form Card Compact */}
      <View className="flex-1 bg-white rounded-t-[35px] px-6 py-6 shadow-2xl shadow-slate-200 mt-4">
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined} 
            style={{ flex: 1 }}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
                <View className="space-y-3.5">
                    
                    {/* AVATAR MINI */}
                    <TouchableOpacity 
                        onPress={openAvatarCreator}
                        className="flex-row items-center bg-brand-blue/5 p-2 rounded-xl border border-brand-blue/10"
                    >
                        <View className="w-10 h-10 rounded-full bg-white border border-brand-blue/20 items-center justify-center overflow-hidden mr-3">
                            {avatarUrl && avatarUrl.startsWith('http') ? (
                                <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                            ) : avatarUrl ? (
                                <Text className="text-xl">{avatarUrl}</Text>
                            ) : (
                                <UserPlus size={18} color="#1f95d5" />
                            )}
                        </View>
                        <Text className="flex-1 text-brand-dark font-bold text-sm">{avatarUrl ? 'Avatar Listo' : 'Elige tu Avatar'}</Text>
                        <Plus size={14} color="#1f95d5" strokeWidth={3} className="mr-2" />
                    </TouchableOpacity>

                    {/* Inputs set */}
                    <View className="space-y-2.5">
                        <View>
                            <Text className="text-[9px] font-black text-brand-dark/40 tracking-widest mb-1 ml-1 uppercase">Nombre</Text>
                            <View className="flex-row items-center border border-slate-100 rounded-xl px-3 bg-slate-50 h-12">
                                <User size={16} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 ml-2 text-brand-dark font-bold text-sm"
                                    placeholder="Tu nombre completo"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-[9px] font-black text-brand-dark/40 tracking-widest mb-1 ml-1 uppercase">Email</Text>
                            <View className="flex-row items-center border border-slate-100 rounded-xl px-3 bg-slate-50 h-12">
                                <Mail size={16} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 ml-2 text-brand-dark font-bold text-sm"
                                    placeholder="tu@correo.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-[9px] font-black text-brand-dark/40 tracking-widest mb-1 ml-1 uppercase">Contraseña</Text>
                            <View className="flex-row items-center border border-slate-100 rounded-xl px-3 bg-slate-50 h-12">
                                <Lock size={16} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 ml-2 text-brand-dark font-bold text-sm"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Action */}
                    <TouchableOpacity 
                        className="bg-brand-blue py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-brand-blue/20 mt-2"
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text className="text-white font-black text-base mr-2">
                            {loading ? 'Procesando...' : 'Crear Cuenta'}
                        </Text>
                        <ArrowRight color="white" size={18} strokeWidth={3} />
                    </TouchableOpacity>

                    {/* Footer */}
                    <View className="flex-row justify-center mt-1">
                        <Text className="text-slate-400 text-xs">¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-brand-blue font-bold text-xs">Inicia Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
