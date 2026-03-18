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
         <View className="bg-teal-50 p-2 rounded-xl">
            <Heart size={24} color="#0d9488" fill="#0d9488" />
         </View>
         <Text className="text-teal-700 font-bold">Ayuda</Text>
      </View>

      <View className="flex-1 justify-center items-center px-6">
        
         {/* Central Illustration Card */}
         <View className="bg-white p-12 rounded-[50px] shadow-sm mb-10 w-72 h-72 justify-center items-center border border-slate-50 shadow-slate-200">
              <Image 
                 source={require('../assets/logomeditrack.png')} 
                 style={{ width: '100%', height: '100%' }}
                 resizeMode="contain"
              />
         </View>

        <Text className="text-4xl font-extrabold text-slate-900 text-center mb-4 tracking-tight">
          Bienvenido
        </Text>
        
        <Text className="text-base text-slate-500 text-center font-medium leading-relaxed px-4 mb-4">
          Tu compañero de bienestar diario para el control de tu medicación.
        </Text>

        {/* Buttons Section */}
        <View className="w-full px-4 mb-2">
          <TouchableOpacity 
            className="bg-brand-blue py-5 rounded-2xl flex-row justify-center items-center shadow-xl shadow-brand-blue/30 active:scale-95 duration-150"
            onPress={() => navigation.navigate('Register')}
          >
            <Text className="text-white font-extrabold text-xl mr-2">Empezar</Text>
            <ArrowRight color="white" size={24} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-4">
          <Text className="text-slate-400 font-medium text-base">¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-brand-blue font-bold text-base">Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Pagination Dots */}
        <View className="flex-row space-x-2 mt-10 mb-6">
             <View className="w-6 h-1.5 rounded-full bg-teal-600" />
             <View className="w-1.5 h-1.5 rounded-full bg-slate-300" />
             <View className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        </View>

        {/* Footer */}
        <Text className="text-[10px] text-slate-400 font-bold tracking-widest uppercase text-center pb-4">
            CONFIADO POR PROFESIONALES DE LA SALUD
        </Text>

      </View>
    </SafeAreaView>
  );
}
