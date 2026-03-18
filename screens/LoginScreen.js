import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { StatusBar } from 'expo-status-bar';
import { Briefcase, ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff, Fingerprint, Smile, Activity, Heart } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();

  const handleLogin = async () => {
    await login(email, password);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* High-Visibility Dynamic Background Texture Layer */}
      <View className="absolute top-[-30] right-[-40] w-[280] h-[280] bg-brand-blue/15 rounded-full" />
      <View className="absolute top-[20%] left-[-60] w-[220] h-[220] bg-brand-green/12 rounded-full" />
      <View className="absolute top-[55%] right-[-100] w-[350] h-[350] bg-brand-blue/10 rounded-full" />
      <View className="absolute bottom-[10%] left-[10%] w-[200] h-[200] bg-brand-green/15 rounded-full" />
      <View className="absolute bottom-[-100] right-[-30] w-[450] h-[450] bg-brand-blue/12 rounded-full" />

      {/* Floating Background Medical Icons - Visible */}
      <View className="absolute top-[25%] right-[12%] opacity-[0.14] rotate-12">
          <Activity size={130} color="#1f95d5" strokeWidth={1.5} />
      </View>
      <View className="absolute bottom-[30%] left-[10%] opacity-[0.11] -rotate-45">
          <Heart size={110} color="#10b981" strokeWidth={1.5} />
      </View>

      <View className="flex-1 justify-center px-10">
          {/* Central Animated Hero */}
          <View className="items-center mb-12">
            <View className="bg-white p-6 rounded-[35px] shadow-2xl shadow-brand-blue/15 border border-slate-50 mb-6">
                <Image 
                    source={require('../assets/logomeditrack.png')} 
                    style={{ width: 110, height: 110 }}
                    resizeMode="contain"
                />
            </View>
            <Text className="text-4xl font-black text-brand-dark tracking-tighter">Bienvenido</Text>
            <Text className="text-slate-400 text-sm font-medium mt-1">Gestiona tu salud con un toque</Text>
          </View>

          {/* Form Content */}
          <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : undefined} 
          >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                  <View className="space-y-5">
                      
                      {/* Inputs Space */}
                      <View className="space-y-4">
                          <View className="bg-slate-50 border border-slate-100 rounded-2xl px-5 h-15 flex-row items-center shadow-sm">
                              <Mail size={20} color="#1f95d5" />
                              <TextInput
                                  className="flex-1 ml-4 text-brand-dark font-bold text-base h-full"
                                  placeholder="Correo electrónico"
                                  value={email}
                                  onChangeText={setEmail}
                                  autoCapitalize="none"
                                  keyboardType="email-address"
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

                      {/* Recover Password Link */}
                      <TouchableOpacity className="self-end px-1">
                          <Text className="text-brand-blue font-black text-xs">Olvide mi contraseña</Text>
                      </TouchableOpacity>

                      {/* Action Button */}
                      <TouchableOpacity 
                          className="bg-brand-blue py-5 rounded-[22px] flex-row justify-center items-center shadow-2xl shadow-brand-blue/30 mt-2 active:scale-95 duration-150"
                          onPress={handleLogin}
                          disabled={loading}
                      >
                          <Text className="text-white font-black text-xl mr-3 font-outfit">
                              {loading ? 'Entrando...' : 'Ingresar'}
                          </Text>
                          <ArrowRight color="white" size={24} strokeWidth={3} />
                      </TouchableOpacity>

                      {/* Footer */}
                      <TouchableOpacity 
                        className="flex-row justify-center mt-4 p-2"
                        onPress={() => navigation.navigate('Register')}
                      >
                          <Text className="text-slate-400 font-bold">¿No tienes cuenta? </Text>
                          <Text className="text-brand-blue font-black">Registrarme</Text>
                      </TouchableOpacity>

                  </View>
              </ScrollView>
          </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
