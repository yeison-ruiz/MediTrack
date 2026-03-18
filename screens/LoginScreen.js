import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { StatusBar } from 'expo-status-bar';
import { Briefcase, ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff, Fingerprint, Smile } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();

  const handleLogin = async () => {
    await login(email, password);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      {/* Background Decor */}
      <View className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-brand-blue/5 rounded-full" />

      {/* Header Section MEGA-IMPACT (Vertical with Overlap) */}
      <View className="px-6 pt-0 items-center z-10">
         <View className="bg-white p-6 rounded-full shadow-2xl shadow-brand-blue/40 border-2 border-slate-50 mb-[-30px]">
            <Image 
                source={require('../assets/logomeditrack.png')} 
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
            />
         </View>
      </View>

      {/* Form Card Ultra-Compact */}
      <View className="flex-1 bg-white rounded-t-[35px] px-8 pt-10 pb-8 shadow-2xl shadow-slate-200 mt-0">
        <View className="items-center mb-4">
            <Text className="text-2xl font-black text-brand-dark">Bienvenido</Text>
            <Text className="text-slate-400 text-[10px] text-center px-8">Tu salud, a tiempo. Inicia sesión.</Text>
        </View>
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined} 
            style={{ flex: 1 }}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
                <View className="space-y-4">
                    
                    {/* Email Input */}
                    <View>
                        <Text className="text-[9px] font-black text-brand-dark/40 tracking-widest mb-1.5 ml-1 uppercase">Correo Electrónico</Text>
                        <View className="flex-row items-center border border-slate-100 rounded-xl px-4 bg-slate-50 h-12">
                            <Mail size={18} color="#94a3b8" />
                            <TextInput
                                className="flex-1 ml-3 text-brand-dark font-bold text-sm h-full"
                                placeholder="tu@correo.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View>
                        <View className="flex-row justify-between items-center mb-1.5 ml-1">
                            <Text className="text-[9px] font-black text-brand-dark/40 tracking-widest uppercase">Contraseña</Text>
                            <TouchableOpacity>
                                <Text className="text-brand-blue font-bold text-[10px]">¿La olvidaste?</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center border border-slate-100 rounded-xl px-4 bg-slate-50 h-12">
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

                    {/* Login Button */}
                    <TouchableOpacity 
                        className="bg-brand-blue py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-brand-blue/20 mt-2 active:scale-95 duration-150"
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text className="text-white font-black text-base mr-2">
                            {loading ? 'Ingresando...' : 'Entrar'}
                        </Text>
                        <ArrowRight color="white" size={20} strokeWidth={3} />
                    </TouchableOpacity>

                    {/* Footer */}
                    <View className="flex-row justify-center mt-2">
                        <Text className="text-slate-400 text-xs">¿No tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text className="text-brand-blue font-bold text-xs">Crear Cuenta</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
