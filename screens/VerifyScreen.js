import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { StatusBar } from 'expo-status-bar';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react-native';

export default function VerifyScreen({ navigation }) {
  const [code, setCode] = useState('');
  const { verifyEmail, pendingVerificationUser, loading } = useAuthStore();

  const handleVerify = async () => {
    if (code.length < 6) return Alert.alert("Código Incompleto", "El código debe tener 6 dígitos");
    
    try {
        await verifyEmail(pendingVerificationUser, code);
        // Sin alerta. Si el auto-login del store funcionó, AppNavigator cambiará a Home.
        // Si no (ej. sesión nula), vamos al login manualmente.
        const isAuth = useAuthStore.getState().isAuthenticated;
        if (!isAuth) {
             navigation.navigate('Login');
        }
    } catch (error) {
        Alert.alert("Error de Verificación", error.message);
    }
  };

  if (!pendingVerificationUser) {
    // Si se pierde el estado, redirigir sigilosamente al login
    setTimeout(() => navigation.replace('Login'), 0);
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 relative" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      <View className="flex-1 justify-center px-8">
          <View className="items-center mb-8">
              <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
                  <Mail size={48} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-slate-800 text-center">Revisa tu Correo</Text>
              <Text className="text-slate-500 text-center mt-2 px-4">
                  Hemos enviado un código de verificación de 6 dígitos a:
              </Text>
              <Text className="text-slate-800 font-bold text-lg mt-1">{pendingVerificationUser}</Text>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <View className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                  <Text className="text-xs font-bold text-slate-400 tracking-widest mb-2 text-center">CÓDIGO DE VERIFICACIÓN</Text>
                  
                  <TextInput
                        className="text-center text-3xl font-bold text-slate-800 border-b-2 border-slate-200 py-2 mb-8 tracking-[10px]"
                        placeholder="000000"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={code}
                        onChangeText={setCode}
                        placeholderTextColor="#cbd5e1"
                  />

                  <TouchableOpacity 
                      className="bg-blue-600 py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-blue-200 active:scale-95 duration-150"
                      onPress={handleVerify}
                      disabled={loading}
                  >
                        {loading ? (
                            <Text className="text-white font-bold text-lg">Verificando...</Text>
                        ) : (
                            <>
                                <Text className="text-white font-bold text-lg mr-2">Confirmar Cuenta</Text>
                                <ShieldCheck color="white" size={24} />
                            </>
                        )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => navigation.navigate('Register')} className="mt-6">
                      <Text className="text-slate-400 text-center text-sm">¿Correo incorrecto? <Text className="text-blue-500 font-bold">Volver</Text></Text>
                  </TouchableOpacity>
              </View>
          </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
