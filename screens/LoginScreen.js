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
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* Background Decor */}
      <View className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-blue/5 rounded-full" />
      <View className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-brand-green/5 rounded-full" />

      <View className="flex-1 justify-center px-8">
          {/* Hero Section */}
          <View className="items-center mb-10">
            <View className="bg-white p-5 rounded-full shadow-2xl shadow-brand-blue/20 border-4 border-white mb-4">
                <Image 
                    source={require('../assets/logomeditrack.png')} 
                    style={{ width: 100, height: 100 }}
                    resizeMode="contain"
                />
            </View>
            <Text className="text-3xl font-black text-brand-dark">Bienvenido</Text>
            <Text className="text-slate-400 text-xs text-center mt-1 px-8">Tu salud, a tiempo. Inicia sesión para continuar.</Text>
          </View>

          {/* Form Content directly on background */}
          <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : undefined} 
          >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                  <View className="space-y-5">
                      
                      {/* Email Input */}
                      <View>
                          <Text className="text-[10px] font-black text-brand-dark/40 tracking-widest mb-1.5 ml-1 uppercase">Correo Electrónico</Text>
                          <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 h-14 shadow-sm">
                              <Mail size={18} color="#94a3b8" />
                              <TextInput
                                  className="flex-1 ml-3 text-brand-dark font-bold text-base h-full"
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
                              <Text className="text-[10px] font-black text-brand-dark/40 tracking-widest uppercase">Contraseña</Text>
                              <TouchableOpacity>
                                  <Text className="text-brand-blue font-bold text-xs">¿La olvidaste?</Text>
                              </TouchableOpacity>
                          </View>
                          <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 h-14 shadow-sm">
                              <Lock size={18} color="#94a3b8" />
                              <TextInput
                                  className="flex-1 ml-3 text-brand-dark font-bold text-base h-full"
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
                          className="bg-brand-blue py-4.5 rounded-2xl flex-row justify-center items-center shadow-xl shadow-brand-blue/30 mt-2 active:scale-95 duration-150"
                          onPress={handleLogin}
                          disabled={loading}
                      >
                          <Text className="text-white font-black text-lg mr-2">
                              {loading ? 'Ingresando...' : 'Entrar'}
                          </Text>
                          <ArrowRight color="white" size={22} strokeWidth={3} />
                      </TouchableOpacity>

                      {/* Footer */}
                      <View className="flex-row justify-center mt-2">
                          <Text className="text-slate-400 font-medium">¿No tienes cuenta? </Text>
                          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                              <Text className="text-brand-blue font-bold">Crear Cuenta</Text>
                          </TouchableOpacity>
                      </View>

                  </View>
              </ScrollView>
          </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
