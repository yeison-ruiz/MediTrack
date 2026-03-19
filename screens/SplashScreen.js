import React, { useEffect } from 'react';
import { View, Image, Animated, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Heart, Activity, Stethoscope } from 'lucide-react-native';

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Initial Animation Sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();

    // Transition to Welcome screen after 3 seconds
    const timer = setTimeout(() => {
        navigation.replace('Welcome');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <StatusBar style="dark" />

      {/* Modern Designed Background - Bubbles & Medical Icons */}
      <View className="absolute top-[-50] left-[-30] w-[300] h-[300] bg-brand-blue/15 rounded-full" />
      <View className="absolute top-[10%] right-[-60] w-[200] h-[200] bg-brand-green/10 rounded-full" />
      <View className="absolute bottom-[-100] right-[-30] w-[450] h-[450] bg-brand-blue/12 rounded-full" />
      <View className="absolute bottom-[10%] left-[-40] w-[220] h-[220] bg-brand-green/12 rounded-full" />

      {/* Large Floating Health Icons (Blurred look) */}
      <View className="absolute top-[20%] right-[15%] opacity-[0.14] rotate-12">
          <Activity size={120} color="#1f95d5" strokeWidth={1} />
      </View>
      <View className="absolute bottom-[25%] left-[10%] opacity-[0.11] -rotate-45">
          <Heart size={100} color="#10b981" strokeWidth={1} />
      </View>
      <View className="absolute top-[50%] left-[5%] opacity-[0.05] rotate-90">
          <Stethoscope size={80} color="#1f95d5" strokeWidth={1} />
      </View>

      <Animated.View 
        style={{ 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
        }}
        className="items-center"
      >
        <View className="bg-white p-7 rounded-[45px] shadow-2xl shadow-brand-blue/20 border border-slate-50 mb-6">
            <Image 
                source={require('../assets/logomeditrack.png')} 
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
            />
        </View>
        <View className="items-center">
            <Text className="text-5xl font-black text-brand-dark tracking-tighter">MedTime</Text>
            <View className="h-1.5 w-12 bg-brand-blue rounded-full mt-2" />
        </View>
      </Animated.View>

      {/* Bottom Loading Indicator Style Tag */}
      <View className="absolute bottom-12 items-center">
         <Text className="text-[10px] text-slate-300 font-bold tracking-[4px] uppercase">
            Loading your health assistant
         </Text>
      </View>
    </SafeAreaView>
  );
}
