import React, { useEffect } from 'react';
import { View, Image, Animated, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Heart, Activity, Stethoscope, Briefcase } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(20);
  const scale = new Animated.Value(0.9);

  useEffect(() => {
    // Animación de entrada suave y profesional - Acelerada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      })
    ]).start();

    // Navegar después de 1.5 segundos (Antes 3)
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <StatusBar style="dark" />

      {/* Modern High-End Background Layer */}
      <View className="absolute top-[-30] left-[-40] w-[300] h-[300] bg-brand-blue/12 rounded-full" />
      <View className="absolute top-[20%] right-[-60] w-[220] h-[220] bg-brand-green/10 rounded-full" />
      <View className="absolute bottom-[-80] right-[-40] w-[400] h-[400] bg-brand-blue/10 rounded-full" />
      <View className="absolute bottom-[15%] left-[-40] w-[250] h-[250] bg-brand-green/8 rounded-full" />

      {/* Floating Designed Healthcare Textures */}
      <View className="absolute top-[18%] right-[10%] opacity-[0.14] rotate-12">
        <Heart size={width * 0.3} color="#1f95d5" strokeWidth={1.5} />
      </View>
      <View className="absolute bottom-[25%] left-[8%] opacity-[0.12] -rotate-12">
        <Stethoscope size={width * 0.35} color="#10b981" strokeWidth={1.2} />
      </View>
      <View className="absolute top-[45%] left-[5%] opacity-[0.08] rotate-45">
        <Activity size={width * 0.25} color="#1f95d5" strokeWidth={1.5} />
      </View>

      {/* Central Branded Content */}
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [
            { translateY: translateY },
            { scale: scale }
          ]
        }}
        className="items-center"
      >
        <View className="bg-white p-8 rounded-[48px] shadow-2xl shadow-brand-blue/20 border border-slate-50 mb-8 overflow-hidden">
            <View className="absolute inset-0 bg-brand-blue/5 opacity-40" />
            <Image 
                source={require('../assets/logomeditrack.png')} 
                style={{ width: 140, height: 140 }}
                resizeMode="contain"
            />
        </View>

        <View className="items-center px-4">
            <Text className="text-5xl font-black text-brand-dark tracking-tighter leading-tight">
                MedTime
            </Text>
            <View className="h-1.5 w-14 bg-brand-blue rounded-full mt-2" />
            <Text className="text-slate-400 font-bold mt-4 tracking-[4px] uppercase text-[10px]">
                Health Precision Assistant
            </Text>
        </View>
      </Animated.View>

      {/* Loading Experience */}
      <View className="absolute bottom-12 w-full items-center">
         <View className="flex-row space-x-2">
            <View className="w-1.5 h-1.5 rounded-full bg-brand-blue/40" />
            <View className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
            <View className="w-1.5 h-1.5 rounded-full bg-brand-blue/40" />
         </View>
      </View>
    </SafeAreaView>
  );
}
