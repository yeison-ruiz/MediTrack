import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, DeviceEventEmitter, Image } from 'react-native';
import { Bell, X } from 'lucide-react-native';

export default function InAppNotification({ onData }) {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState(null);
    const slideAnim = useRef(new Animated.Value(-150)).current; // Empezar arriba, fuera de pantalla

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('MOCK_NOTIFICATION', (notificationData) => {
            setData(notificationData);
            setVisible(true);
            
            // Animar entrada hacia abajo
            Animated.spring(slideAnim, {
                toValue: 50, // Posición visible (top)
                useNativeDriver: true,
                speed: 12,
                bounciness: 8,
            }).start();

            // Auto ocultar después de 5s
            const timer = setTimeout(() => {
                hide();
            }, 6000);

            return () => clearTimeout(timer);
        });

        return () => subscription.remove();
    }, []);

    const hide = () => {
        Animated.timing(slideAnim, {
            toValue: -200,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    const handlePress = () => {
        if (data && onData) {
            onData(data); // Navegar
            hide();
        }
    };

    if (!visible || !data) return null;

    return (
        <Animated.View 
            style={{ 
                transform: [{ translateY: slideAnim }],
                position: 'absolute', 
                top: 0, 
                left: 10, 
                right: 10, 
                zIndex: 9999 
            }}
        >
            <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={handlePress}
                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-blue-100 flex-row items-center"
            >
                {/* ICON */}
                <View className="bg-blue-100 p-3 rounded-full mr-3">
                    <Bell size={24} color="#2563eb" fill="#2563eb" />
                </View>
                
                {/* CONTENT */}
                <View className="flex-1">
                    <View className="flex-row justify-between">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">MEDTIME • AHORA</Text>
                    </View>
                    <Text className="text-base font-bold text-slate-800 leading-5">{data.title}</Text>
                    <Text className="text-sm text-slate-500 mt-0.5">{data.body}</Text>
                </View>

                {/* DISMISS */}
                 <TouchableOpacity onPress={hide} className="p-2 -mr-2 -mt-2">
                    <X size={16} color="#94a3b8" />
                 </TouchableOpacity>

            </TouchableOpacity>
        </Animated.View>
    );
}
