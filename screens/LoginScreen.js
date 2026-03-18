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
    <SafeAreaView className="flex-1 bg-slate-50 relative" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      {/* Background Decor Circles */}
      <View className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-100 rounded-full opacity-50" />
      <View className="absolute top-20 left-20 w-40 h-40 bg-blue-200 rounded-full opacity-30 blur-2xl" />

      {/* Header Section */}
      <View className="px-6 pt-6 pb-6">
         {/* Top Nav */}
         <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-100 p-2 rounded-lg">
                <Image 
                    source={require('../assets/logomeditrack.png')} 
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                />
            </TouchableOpacity>
         </View>

         {/* Hero Logo */}
         <View className="items-center mb-6 relative">
             <View className="absolute bg-blue-100 w-40 h-40 rounded-full -z-10 blur-2xl opacity-60 top-0" />
             <View className="bg-white p-4 rounded-full shadow-2xl shadow-blue-200 border-4 border-slate-50">
                <Image 
                    source={require('../assets/logomeditrack.png')} 
                    style={{ width: 100, height: 100 }}
                    resizeMode="contain"
                />
             </View>
         </View>

         <Text className="text-3xl font-extrabold text-slate-900 text-center mb-2">Bienvenido</Text>
         <Text className="text-slate-500 text-center px-8 leading-5">
            Tu salud, a tiempo. Por favor inicia sesión.
         </Text>
      </View>

      {/* Form Card */}
      <View className="flex-1 bg-white rounded-t-[40px] px-8 py-8 shadow-2xl shadow-slate-200">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <View className="space-y-4">
                
                {/* Email Input */}
                <View>
                    <Text className="text-[11px] font-bold text-slate-400 tracking-widest mb-2 ml-1">CORREO ELECTRÓNICO</Text>
                    <View className="flex-row items-center border border-slate-200 rounded-xl px-4 bg-slate-50 focus:border-blue-500 active:border-blue-500 h-14">
                        <Mail size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 ml-3 text-slate-800 font-medium text-base h-full"
                            placeholder="nombre@clinica.com"
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
                    <View className="flex-row justify-between items-center mb-2 ml-1">
                        <Text className="text-[11px] font-bold text-slate-400 tracking-widest">CONTRASEÑA</Text>
                        <TouchableOpacity>
                            <Text className="text-blue-500 font-bold text-xs">¿Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center border border-slate-200 rounded-xl px-4 bg-slate-50 h-14">
                        <Lock size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 ml-3 text-slate-800 font-medium text-base h-full"
                            placeholder="••••••••"
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

                {/* Login Button */}
                <TouchableOpacity 
                    className="bg-blue-600 py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-blue-200 mt-2 active:scale-95 duration-150"
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text className="text-white font-bold text-lg mr-2">
                        {loading ? 'Ingresando...' : 'Entrar'}
                    </Text>
                    <ArrowRight color="white" size={20} strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Footer */}
                <View className="flex-row justify-center mt-8">
                    <Text className="text-slate-400 font-medium">¿Nuevo en MediTrack? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text className="text-blue-500 font-bold">Crear Cuenta</Text>
                    </TouchableOpacity>
                </View>

            </View>
         </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
