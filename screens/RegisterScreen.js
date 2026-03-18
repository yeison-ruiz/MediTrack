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
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* Background Decor subtle */}
      <View className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-blue/5 rounded-full" />

      <View className="flex-1 px-8 pt-10">
          {/* Header Section Vertical */}
          <View className="items-center mb-10">
            <View className="bg-white p-4 rounded-full shadow-2xl shadow-brand-blue/20 mb-4 border-2 border-slate-50">
                <Image 
                    source={require('../assets/logomeditrack.png')} 
                    style={{ width: 120, height: 120 }}
                    resizeMode="contain"
                />
            </View>
            <Text className="text-3xl font-black text-brand-dark">Crea tu Cuenta</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">Gestiona tu salud profesionalmente.</Text>
          </View>

          {/* Form Content */}
          <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : undefined} 
              className="flex-1"
          >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  <View className="space-y-4">
                      
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
                      <View className="space-y-3.5">
                          <View>
                              <Text className="text-[10px] font-black text-brand-dark/40 tracking-widest mb-1.5 ml-1 uppercase">Nombre Completo</Text>
                              <View className="flex-row items-center border border-slate-100 rounded-2xl px-4 bg-slate-50 h-13">
                                  <User size={18} color="#94a3b8" />
                                  <TextInput
                                      className="flex-1 ml-3 text-brand-dark font-bold text-sm h-full"
                                      placeholder="Juan Pérez"
                                      value={name}
                                      onChangeText={setName}
                                  />
                              </View>
                          </View>

                          <View>
                              <Text className="text-[10px] font-black text-brand-dark/40 tracking-widest mb-1.5 ml-1 uppercase">Email</Text>
                              <View className="flex-row items-center border border-slate-100 rounded-2xl px-4 bg-slate-50 h-13">
                                  <Mail size={18} color="#94a3b8" />
                                  <TextInput
                                      className="flex-1 ml-3 text-brand-dark font-bold text-sm h-full"
                                      placeholder="tu@correo.com"
                                      value={email}
                                      onChangeText={setEmail}
                                      autoCapitalize="none"
                                  />
                              </View>
                          </View>

                          <View>
                              <Text className="text-[10px] font-black text-brand-dark/40 tracking-widest mb-1.5 ml-1 uppercase">Contraseña</Text>
                              <View className="flex-row items-center border border-slate-100 rounded-2xl px-4 bg-slate-50 h-13">
                                  <Lock size={18} color="#94a3b8" />
                                  <TextInput
                                      className="flex-1 ml-3 text-brand-dark font-bold text-sm h-full"
                                      placeholder="••••••••"
                                      value={password}
                                      onChangeText={setPassword}
                                      secureTextEntry={!showPassword}
                                  />
                                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                      {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                                  </TouchableOpacity>
                              </View>
                          </View>
                      </View>

                      {/* Action */}
                      <TouchableOpacity 
                          className="bg-brand-blue py-4.5 rounded-2xl flex-row justify-center items-center shadow-xl shadow-brand-blue/20 mt-2"
                          onPress={handleRegister}
                          disabled={loading}
                      >
                          <Text className="text-white font-black text-lg mr-2">
                              {loading ? 'Procesando...' : 'Crear Cuenta'}
                          </Text>
                          <ArrowRight color="white" size={20} strokeWidth={3} />
                      </TouchableOpacity>

                      {/* Footer */}
                      <View className="flex-row justify-center mt-2">
                          <Text className="text-slate-400 font-medium">¿Ya tienes cuenta? </Text>
                          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                              <Text className="text-brand-blue font-bold">Inicia Sesión</Text>
                          </TouchableOpacity>
                      </View>
                  </View>
              </ScrollView>
          </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
