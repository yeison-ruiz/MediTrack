import { View, Text, TouchableOpacity, Image, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { LogOut, User, ChevronLeft, Shield, Bell } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUserAvatar } = useAuthStore();
  const darkMode = useSettingsStore(state => state.darkMode);

  const openSettings = () => {
    if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
    } else {
        Linking.openSettings();
    }
  };

  const handleEditAvatar = () => {
      navigation.navigate('AvatarCreator', {
          onSave: (newAvatar) => updateUserAvatar(newAvatar)
      });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top', 'left', 'right']}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <View className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 bg-white dark:bg-slate-800 p-2 rounded-full">
                <ChevronLeft size={24} color={darkMode ? "#f1f5f9" : "black"} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-slate-800 dark:text-white">Mi Perfil</Text>
        </View>

        {/* User Card - CLICKABLE */}
        <View className="items-center mb-10">
            <TouchableOpacity onPress={handleEditAvatar} className="relative">
                <View className="h-32 w-32 bg-indigo-50 dark:bg-indigo-900/50 rounded-full items-center justify-center mb-4 border-4 border-white dark:border-slate-800 shadow-md overflow-hidden">
                    {user?.avatar && user.avatar.startsWith('http') ? (
                        <Image source={{ uri: user.avatar }} className="w-full h-full" />
                    ) : (
                        <Text className="text-6xl">{user?.avatar || "👤"}</Text>
                    )}
                </View>
                <View className="absolute bottom-4 right-0 bg-blue-500 p-2 rounded-full border-2 border-white dark:border-slate-800">
                    <Text className="text-white text-xs">✏️</Text>
                </View>
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || "Usuario"}</Text>
            <Text className="text-slate-500 dark:text-slate-400 mb-2">{user?.email || "usuario@medtime.app"}</Text>
            {user?.is_verified ? (
                <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full flex-row items-center border border-green-200 dark:border-green-800">
                    <Shield size={12} color="#16a34a" />
                    <Text className="text-green-700 dark:text-green-400 text-xs font-bold ml-1">Cuenta Verificada</Text>
                </View>
            ) : (
                <Text className="text-orange-500 text-xs font-bold">Sin verificar</Text>
            )}
        </View>

        {/* Menu Items */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm mb-6">
            <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
                onPress={handleEditAvatar}
            >
                <User size={20} color={darkMode ? "#cbd5e1" : "#64748b"} />
                <Text className="flex-1 ml-4 text-slate-700 dark:text-slate-200 font-medium">Editar Datos Personales</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
                onPress={() => navigation.navigate('AlarmSettings')}
            >
                <Bell size={20} color={darkMode ? "#cbd5e1" : "#64748b"} />
                <Text className="flex-1 ml-4 text-slate-700 dark:text-slate-200 font-medium">Configurar Notificaciones</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                className="flex-row items-center p-4 active:bg-slate-50 dark:active:bg-slate-700"
                onPress={() => Alert.alert("Privacidad", "Tus datos se almacenan de forma segura localmente en este dispositivo.")}
            >
                <Shield size={20} color={darkMode ? "#cbd5e1" : "#64748b"} />
                <Text className="flex-1 ml-4 text-slate-700 dark:text-slate-200 font-medium">Privacidad y Seguridad</Text>
            </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
            className="flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/50 mt-4 active:bg-red-100 dark:active:bg-red-900/40"
            onPress={logout}
        >
            <LogOut size={20} color="#ef4444" />
            <Text className="ml-2 text-red-600 dark:text-red-400 font-bold">Cerrar Sesión</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
