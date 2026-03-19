import React, { useEffect } from 'react';
import { View, Image, Animated, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Heart, Activity, Stethoscope, Briefcase } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(30);
  const logoScale = new Animated.Value(0.2);
  const dot1 = new Animated.Value(0);
  const dot2 = new Animated.Value(0);
  const dot3 = new Animated.Value(0);

  useEffect(() => {
    // 1. Entrada fluida inicial
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true })
    ]).start();

    // 2. Loop de puntitos cargando
    const createDotAnim = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: -10, duration: 300, delay, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(400)
        ])
      );
    };
    createDotAnim(dot1, 0).start();
    createDotAnim(dot2, 100).start();
    createDotAnim(dot3, 200).start();

    // 3. Salida y navegación
    const exitTimer = setTimeout(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(logoScale, { toValue: 1.1, duration: 300, useNativeDriver: true })
        ]).start(() => {
            navigation.replace('Welcome');
        });
    }, 2000);

    return () => clearTimeout(exitTimer);
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
            { scale: logoScale }
          ]
        }}
        className="items-center"
      >
        <View className="bg-white p-8 rounded-[48px] shadow-2xl shadow-brand-blue/20 border border-slate-50 mb-8 overflow-hidden">
            <View className="absolute inset-0 bg-brand-blue/5 opacity-40" />
            <Image 
                source={require('../assets/logo1.png')} 
                style={{ width: 140, height: 140 }}
                resizeMode="contain"
            />
        </View>

        <View className="items-center px-4 mt-6">
            <View className="h-1.5 w-14 bg-brand-blue rounded-full" />
            <Text className="text-slate-400 font-bold mt-4 tracking-[4px] uppercase text-[10px]">
                Asistente de Precisión en Salud
            </Text>
        </View>
      </Animated.View>

      {/* Loading Experience */}
      <View className="absolute bottom-12 w-full items-center">
         <View className="flex-row space-x-2">
            <Animated.View style={{ transform: [{ translateY: dot1 }] }} className="w-1.5 h-1.5 rounded-full bg-brand-blue/40" />
            <Animated.View style={{ transform: [{ translateY: dot2 }] }} className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
            <Animated.View style={{ transform: [{ translateY: dot3 }] }} className="w-1.5 h-1.5 rounded-full bg-brand-blue/40" />
         </View>
      </View>
    </SafeAreaView>
  );
}
