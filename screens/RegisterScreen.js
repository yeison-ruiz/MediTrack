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
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />      {/* Background Decor */}
      <View className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-blue/5 rounded-full" />
      <View className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-brand-green/5 rounded-full" />

      <View className="flex-1 justify-center px-6">
          {/* Logo Center Overlap */}
          <View className="items-center z-10 -mb-12">
            <View className="bg-white p-5 rounded-full shadow-2xl shadow-brand-blue/30 border-4 border-slate-50">
                <Image 
                    source={require('../assets/logomeditrack.png')} 
                    style={{ width: 110, height: 110 }}
                    resizeMode="contain"
                />
            </View>
          </View>

          {/* Form Card Floating */}
          <View className="bg-white rounded-[40px] px-6 pt-14 pb-6 shadow-2xl shadow-slate-200">
            <View className="items-center mb-4">
                <Text className="text-2xl font-black text-brand-dark">Crea tu Cuenta</Text>
                <Text className="text-slate-400 text-[10px] text-center px-4">Gestiona tu salud profesionalmente.</Text>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : undefined} 
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                    <View className="space-y-3">
                        
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
                                <View className="flex-row items-center border border-slate-100 rounded-xl px-3 bg-slate-50 h-11">
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
                                <View className="flex-row items-center border border-slate-100 rounded-xl px-3 bg-slate-50 h-11">
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
                                <View className="flex-row items-center border border-slate-100 rounded-xl px-3 bg-slate-50 h-11">
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
                            <Text className="text-slate-400 text-xs text-center">
                                ¿Ya tienes cuenta?{' '}
                                <Text onPress={() => navigation.navigate('Login')} className="text-brand-blue font-bold">Inicia Sesión</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
          </View>
      </View>
    </SafeAreaView>
  );
}
