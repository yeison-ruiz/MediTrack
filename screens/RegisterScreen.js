import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { StatusBar } from 'expo-status-bar';
import { Briefcase, ArrowRight, UserPlus, Mail, Lock, Eye, EyeOff, User, Smile, ShieldCheck, Plus, Heart, Stethoscope, Activity } from 'lucide-react-native';

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
      
      {/* High-Visibility Modern Bubble & Icon Background Layer */}
      <View className="absolute top-[-20] left-[-30] w-[250] h-[250] bg-brand-blue/15 rounded-full" />
      <View className="absolute top-[10%] right-[-40] w-[180] h-[180] bg-brand-green/10 rounded-full" />
      <View className="absolute top-[40%] left-[-80] w-[300] h-[300] bg-brand-blue/8 rounded-full" />
      <View className="absolute bottom-[20%] right-[-60] w-[220] h-[220] bg-brand-green/12 rounded-full" />
      <View className="absolute bottom-[-50] left-[10%] w-[350] h-[350] bg-brand-blue/10 rounded-full" />

      {/* Visible Faded Large Medical Icons */}
      <View className="absolute top-[15%] left-[10%] opacity-[0.12] rotate-12">
          <Heart size={110} color="#1f95d5" strokeWidth={1.5} />
      </View>
      <View className="absolute bottom-[30%] right-[10%] opacity-[0.1] -rotate-12">
          <Stethoscope size={130} color="#10b981" strokeWidth={1.5} />
      </View>
      <View className="absolute top-[55%] right-[20%] opacity-[0.08] rotate-45">
          <Activity size={90} color="#1f95d5" strokeWidth={1.5} />
      </View>

      <View className="flex-1 justify-center px-10">
          {/* Central Logo Experience */}
          <View className="items-center mb-12">
            <View className="bg-white p-6 rounded-[35px] shadow-2xl shadow-brand-blue/15 border border-slate-50 mb-6">
                <Image 
                    source={require('../assets/logomeditrack.png')} 
                    style={{ width: 110, height: 110 }}
                    resizeMode="contain"
                />
            </View>
            <Text className="text-4xl font-black text-brand-dark tracking-tighter">Hola!</Text>
            <Text className="text-slate-400 text-sm font-medium mt-1">Crea tu cuenta para empezar</Text>
          </View>

          {/* Premium Form Inputs */}
          <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : undefined} 
          >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  <View className="space-y-5">
                      
                      {/* Avatar Picker Modern */}
                      <TouchableOpacity 
                          onPress={openAvatarCreator}
                          className="flex-row items-center bg-slate-50 border border-slate-100 p-3 rounded-2xl shadow-sm"
                      >
                          <View className="w-12 h-12 rounded-2xl bg-brand-blue/10 items-center justify-center overflow-hidden mr-4">
                              {avatarUrl && avatarUrl.startsWith('http') ? (
                                  <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                              ) : avatarUrl ? (
                                  <Text className="text-2xl">{avatarUrl}</Text>
                              ) : (
                                  <UserPlus size={22} color="#1f95d5" strokeWidth={2.5} />
                              )}
                          </View>
                          <View className="flex-1">
                             <Text className="text-brand-dark font-black text-sm">{avatarUrl ? 'Avatar Listo' : 'Elige tu Avatar'}</Text>
                             <Text className="text-slate-400 text-[10px]">Personaliza tu perfil</Text>
                          </View>
                          <Plus size={16} color="#1f95d5" strokeWidth={3} className="mr-2" />
                      </TouchableOpacity>

                      <View className="space-y-4">
                          <View className="bg-slate-50 border border-slate-100 rounded-2xl px-5 h-15 flex-row items-center shadow-sm">
                              <User size={20} color="#1f95d5" />
                              <TextInput
                                  className="flex-1 ml-4 text-brand-dark font-bold text-base h-full"
                                  placeholder="Nombre completo"
                                  value={name}
                                  onChangeText={setName}
                                  placeholderTextColor="#94a3b8"
                              />
                          </View>

                          <View className="bg-slate-50 border border-slate-100 rounded-2xl px-5 h-15 flex-row items-center shadow-sm">
                              <Mail size={20} color="#1f95d5" />
                              <TextInput
                                  className="flex-1 ml-4 text-brand-dark font-bold text-base h-full"
                                  placeholder="Correo electrónico"
                                  value={email}
                                  onChangeText={setEmail}
                                  autoCapitalize="none"
                                  placeholderTextColor="#94a3b8"
                              />
                          </View>

                          <View className="bg-slate-50 border border-slate-100 rounded-2xl px-5 h-15 flex-row items-center shadow-sm">
                              <Lock size={20} color="#1f95d5" />
                              <TextInput
                                  className="flex-1 ml-4 text-brand-dark font-bold text-base h-full"
                                  placeholder="Contraseña"
                                  value={password}
                                  onChangeText={setPassword}
                                  secureTextEntry={!showPassword}
                                  placeholderTextColor="#94a3b8"
                              />
                              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                  {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                              </TouchableOpacity>
                          </View>
                      </View>

                      {/* Main Action Button */}
                      <TouchableOpacity 
                          className="bg-brand-blue py-5 rounded-[22px] flex-row justify-center items-center shadow-2xl shadow-brand-blue/30 mt-4 active:scale-95 duration-150"
                          onPress={handleRegister}
                          disabled={loading}
                      >
                          <Text className="text-white font-black text-xl mr-3">
                              Registrarme
                          </Text>
                          <ArrowRight color="white" size={24} strokeWidth={3} />
                      </TouchableOpacity>

                      {/* Footer */}
                      <TouchableOpacity 
                        className="flex-row justify-center mt-4 p-2"
                        onPress={() => navigation.navigate('Login')}
                      >
                          <Text className="text-slate-400 font-bold">¿Ya tienes cuenta? </Text>
                          <Text className="text-brand-blue font-black">Entrar</Text>
                      </TouchableOpacity>
                  </View>
              </ScrollView>
          </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
