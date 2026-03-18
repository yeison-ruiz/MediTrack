import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase, ArrowRight, Heart } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <StatusBar style="dark" />
      
      {/* Top Bar */}
      <View className="flex-row justify-between items-center px-6 pt-2">
         <View className="bg-brand-blue/5 p-2 rounded-xl">
            <Heart size={24} color="#1f95d5" fill="#1f95d5" />
         </View>
         <Text className="text-brand-blue font-bold">Ayuda</Text>
      </View>

      <View className="flex-1 justify-center items-center px-6">
        
         {/* Central Illustration Card - SCALE UP */}
         <View className="bg-white p-6 rounded-[50px] shadow-2xl shadow-brand-blue/20 mb-8 w-80 h-80 justify-center items-center border border-slate-50">
              <Image 
                 source={require('../assets/logomeditrack.png')} 
                 style={{ width: '100%', height: '100%' }}
                 resizeMode="contain"
              />
         </View>

        <Text className="text-4xl font-black text-brand-dark text-center mb-3 tracking-tighter">
          Bienvenido
        </Text>
        
        <Text className="text-sm text-slate-500 text-center font-medium leading-relaxed px-8 mb-6">
          Tu compañero inteligente para el control preciso de tu medicación.
        </Text>

        {/* Buttons Section */}
        <View className="w-full px-4">
          <TouchableOpacity 
            className="bg-brand-blue py-5 rounded-2xl flex-row justify-center items-center shadow-xl shadow-brand-blue/30 active:scale-95 duration-150"
            onPress={() => navigation.navigate('Register')}
          >
            <Text className="text-white font-black text-xl mr-2">Empezar Ahora</Text>
            <ArrowRight color="white" size={24} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-400 font-medium">¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-brand-blue font-bold">Inicia Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Pagination Dots */}
        <View className="flex-row space-x-2 mt-10 mb-6">
             <View className="w-6 h-1.5 rounded-full bg-brand-blue" />
             <View className="w-1.5 h-1.5 rounded-full bg-slate-200" />
             <View className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        </View>

        {/* Footer */}
        <Text className="text-[10px] text-slate-400 font-bold tracking-widest uppercase text-center pb-4">
            CONFIADO POR PROFESIONALES DE LA SALUD
        </Text>

      </View>
    </SafeAreaView>
  );
}
