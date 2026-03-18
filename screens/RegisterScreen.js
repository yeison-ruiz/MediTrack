import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { StatusBar } from 'expo-status-bar';
import { Briefcase, ArrowRight, UserPlus, Mail, Lock, Eye, EyeOff, User, Smile, ShieldCheck } from 'lucide-react-native';

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
    <SafeAreaView className="flex-1 bg-slate-50 relative" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      {/* Background Decor */}
      <View className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-teal-100 rounded-full opacity-50" />
      <View className="absolute top-20 left-20 w-40 h-40 bg-teal-200 rounded-full opacity-30 blur-2xl" />

      {/* Header Section */}
      <View className="px-6 pt-8 pb-0">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-100 p-2 rounded-lg">
                <Image 
                    source={require('../assets/logomeditrack.png')} 
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                />
            </TouchableOpacity>
         </View>

         {/* Hero Logo */}
         <View className="items-center mb-4 relative">
             <View className="absolute bg-teal-100 w-32 h-32 rounded-full -z-10 blur-2xl opacity-60 top-0" />
             <View className="bg-white p-5 rounded-full shadow-2xl shadow-teal-200 border-4 border-slate-50">
                <Image 
                    source={require('../assets/logomeditrack.png')} 
                    style={{ width: 90, height: 90 }}
                    resizeMode="contain"
                />
             </View>
         </View>

         <Text className="text-3xl font-extrabold text-slate-900 text-center mb-1">Únete</Text>
         <Text className="text-slate-500 text-center px-8 leading-5 mb-2">
            Crea tu cuenta gratis.
         </Text>

         {/* Avatar Designer Button - ULTRA VISIBLE */}
         <View className="items-center mb-4 mt-2">
             <TouchableOpacity 
                onPress={openAvatarCreator}
                className="items-center justify-center bg-teal-50 px-6 py-4 rounded-2xl border-2 border-teal-100 shadow-sm active:bg-teal-100 w-full"
             >
                 <View className="flex-row items-center">
                    <View className="w-16 h-16 rounded-full bg-white border-2 border-teal-200 items-center justify-center overflow-hidden mr-4 shadow-sm">
                        {avatarUrl && avatarUrl.startsWith('http') ? (
                            <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                        ) : avatarUrl ? (
                            <Text className="text-4xl">{avatarUrl}</Text>
                        ) : (
                            <UserPlus size={32} color="#0d9488" />
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-teal-900 font-bold text-base">
                            {avatarUrl ? '¡Avatar Listo!' : 'Diseñar mi Avatar'}
                        </Text>
                        <Text className="text-teal-600 text-xs mt-1">
                            {avatarUrl ? 'Toca para cambiar estilo' : 'Personaliza tu apariencia única'}
                        </Text>
                    </View>
                    <View className="bg-teal-600 p-2 rounded-full">
                        <Text className="text-white font-bold text-xs">✏️</Text>
                    </View>
                 </View>
             </TouchableOpacity>
         </View>
      </View>

      {/* Form Card */}
      <View className="flex-1 bg-white rounded-t-[40px] px-8 py-8 shadow-2xl shadow-slate-200 mt-4">
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined} 
            keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
            style={{ flex: 1 }}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 200 }}>
                <View className="space-y-4">
                    
                    {/* Name Input */}
                    <View>
                        <Text className="text-[10px] font-bold text-slate-400 tracking-widest mb-1.5 ml-1">NOMBRE COMPLETO</Text>
                        <View className="flex-row items-center border border-slate-200 rounded-xl px-4 bg-slate-50 focus:border-teal-500 active:border-teal-500 h-14">
                            <User size={20} color="#94a3b8" />
                            <TextInput
                                className="flex-1 ml-3 text-slate-800 font-medium text-base h-full"
                                placeholder="Tu Nombre"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>
                    </View>

                    {/* Email Input */}
                    <View>
                        <Text className="text-[10px] font-bold text-slate-400 tracking-widest mb-1.5 ml-1">CORREO ELECTRÓNICO</Text>
                        <View className="flex-row items-center border border-slate-200 rounded-xl px-4 bg-slate-50 focus:border-teal-500 active:border-teal-500 h-14">
                            <Mail size={20} color="#94a3b8" />
                            <TextInput
                                className="flex-1 ml-3 text-slate-800 font-medium text-base h-full"
                                placeholder="nombre@email.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View>
                        <Text className="text-[10px] font-bold text-slate-400 tracking-widest mb-1.5 ml-1">CONTRASEÑA</Text>
                        <View className="flex-row items-center border border-slate-200 rounded-xl px-4 bg-slate-50 focus:border-teal-500 h-14">
                            <Lock size={20} color="#94a3b8" />
                            <TextInput
                                className="flex-1 ml-3 text-slate-800 font-medium text-base h-full"
                                placeholder="Crea una contraseña"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                placeholderTextColor="#cbd5e1"
                            />
                             <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                 {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                             </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sign Up Button */}
                    <TouchableOpacity 
                        className="bg-teal-600 py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-teal-200 mt-2 active:scale-95 duration-150"
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text className="text-white font-bold text-lg mr-2">
                            {loading ? 'Creando...' : 'Crear Cuenta'}
                        </Text>
                        <ArrowRight color="white" size={20} strokeWidth={2.5} />
                    </TouchableOpacity>

                    {/* Footer */}
                    <View className="flex-row justify-center mt-4 mb-10">
                        <Text className="text-slate-400 font-medium">¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-teal-600 font-bold">Inicia Sesión</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
