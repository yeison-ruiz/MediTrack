import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase, ChevronRight, Heart, Activity, Stethoscope, Plus, Info, ShieldCheck, Zap } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAlert } from '../components/AlertSystem';

export default function WelcomeScreen({ navigation }) {
    const { showAlert } = useAlert();

    const handleHelp = () => {
        showAlert(
            "Acerca de MediTrack",
            "Somos tu asistente inteligente para medicamentos.\n\n🔒 Privacidad: Tus datos están seguros.\n🔔 Precisión: Nunca olvides una dosis.\n✨ Simplicidad: Diseñado para ser fácil de usar.",
            [
                { text: "Entendido" }
            ],
            "info"
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar style="dark" />
      
      {/* Ultra-Modern Background Elements */}
      <View className="absolute top-[-40] left-[-40] w-[280] h-[280] bg-brand-blue/15 rounded-full" />
      <View className="absolute top-[15%] right-[-50] w-[200] h-[200] bg-brand-green/10 rounded-full" />
      <View className="absolute top-[45%] left-[-80] w-[300] h-[300] bg-brand-blue/8 rounded-full" />
      <View className="absolute bottom-[25%] right-[-60] w-[240] h-[240] bg-brand-green/12 rounded-full" />
      <View className="absolute bottom-[-80] left-[5%] w-[400] h-[400] bg-brand-blue/10 rounded-full" />

      {/* Faded Large Health Icons */}
      <View className="absolute top-[12%] left-[10%] opacity-[0.12] rotate-12">
          <Heart size={120} color="#1f95d5" strokeWidth={1.5} />
      </View>
      <View className="absolute bottom-[40%] right-[12%] opacity-[0.1] -rotate-12">
          <Stethoscope size={140} color="#10b981" strokeWidth={1.5} />
      </View>
      <View className="absolute top-[60%] left-[15%] opacity-[0.08] rotate-45">
          <Activity size={100} color="#1f95d5" strokeWidth={1.5} />
      </View>
      <View className="absolute bottom-[10%] right-[10%] opacity-[0.1] rotate-90">
          <Plus size={80} color="#10b981" strokeWidth={2} />
      </View>

      <View className="flex-1 justify-between py-6 px-8">
        {/* Top Navbar Experience */}
        <View className="flex-row justify-between items-center mt-2 px-2">
            <View className="bg-brand-blue/10 p-2.5 rounded-2xl border border-brand-blue/15 shadow-sm">
                <Heart size={24} color="#1f95d5" fill="#1f95d5" />
            </View>
            <TouchableOpacity 
                onPress={handleHelp}
                className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm active:bg-slate-100"
            >
                <Text className="text-brand-blue font-black text-sm">Ayuda</Text>
            </TouchableOpacity>
        </View>

        {/* Center Hero Section */}
        <View className="items-center">
            {/* Logo Moderately Increased Size */}
            <View className="bg-white p-5 rounded-[45px] shadow-2xl shadow-brand-blue/20 mb-10 w-56 h-56 justify-center items-center border border-slate-50">
                <Image 
                    source={require('../assets/logo1.png')} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                />
            </View>

            <View className="items-center px-4 mt-4">
                <Text className="text-lg text-slate-500 text-center font-bold px-4 leading-normal">
                    Tu compañero inteligente para el control preciso de tu salud.
                </Text>
            </View>
        </View>

        {/* Bottom Actions Section */}
        <View className="w-full space-y-6">
            <View className="space-y-4">
                <TouchableOpacity 
                    className="bg-brand-blue py-5 rounded-[22px] flex-row justify-center items-center shadow-2xl shadow-brand-blue/30 active:scale-95 duration-150"
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text className="text-white font-black text-xl mr-3 font-outfit">Empezar Ahora</Text>
                    <ChevronRight color="white" size={24} strokeWidth={3} />
                </TouchableOpacity>

                <TouchableOpacity 
                    className="flex-row justify-center p-2"
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text className="text-slate-400 font-bold">¿Ya tienes cuenta? </Text>
                    <Text className="text-brand-blue font-black">Inicia Sesión</Text>
                </TouchableOpacity>
            </View>

            {/* Micro-Pagination & Confidence Tag */}
            <View className="items-center space-y-6 mb-2">
                <View className="flex-row space-x-2.5">
                    <View className="w-8 h-2 rounded-full bg-brand-blue" />
                    <View className="w-2 h-2 rounded-full bg-slate-200" />
                    <View className="w-2 h-2 rounded-full bg-slate-200" />
                </View>
                <Text className="text-[11px] text-slate-400 font-black tracking-widest uppercase opacity-70 text-center">
                    Avalado por profesionales de la salud
                </Text>
            </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
