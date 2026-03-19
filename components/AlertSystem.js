import React, { createContext, useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react-native';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    type: 'info', // success, error, warning, info
    buttons: [], // [{ text, onPress, style }]
  });

  const showAlert = (title, message, buttons = [], type = 'info') => {
    // Si no hay botones, poner uno por defecto "OK"
    const finalButtons = buttons.length > 0 ? buttons : [
        { text: 'Entendido', onPress: () => {}, style: 'primary' }
    ];
    
    // Auto-detect type based on title keywords if not provided
    let finalType = type;
    if (type === 'info') {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('error') || lowerTitle.includes('falló')) finalType = 'error';
        if (lowerTitle.includes('éxito') || lowerTitle.includes('guardad') || lowerTitle.includes('cread')) finalType = 'success';
        if (lowerTitle.includes('atención') || lowerTitle.includes('seguro')) finalType = 'warning';
    }

    setConfig({ title, message, type: finalType, buttons: finalButtons });
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const getIcon = () => {
      const size = 32;
      switch (config.type) {
          case 'success': return <CheckCircle size={size} color="#10b981" />;
          case 'error': return <XCircle size={size} color="#ef4444" />;
          case 'warning': return <AlertTriangle size={size} color="#f59e0b" />;
          default: return <Info size={size} color="#3b82f6" />;
      }
  };

  const getColor = () => {
        switch (config.type) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'warning': return 'text-amber-500';
            default: return 'text-blue-600';
        }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={hideAlert}
      >
        <View className="flex-1 bg-slate-900/60 justify-center items-center px-6">
            <View className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[40px] p-8 items-center shadow-2xl relative overflow-hidden">
                {/* Decorative background blur */}
                <View className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-xl ${
                    config.type === 'success' ? 'bg-green-500' : 
                    config.type === 'error' ? 'bg-red-500' : 
                    config.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />

                <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 shadow-sm ${
                    config.type === 'success' ? 'bg-green-50' : 
                    config.type === 'error' ? 'bg-red-50' : 
                    config.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                }`}>
                    {getIcon()}
                </View>

                <Text className="text-2xl font-black text-slate-900 dark:text-white text-center mb-2 tracking-tight">
                    {config.title}
                </Text>

                <Text className="text-slate-500 dark:text-slate-400 text-center text-base mb-8 leading-relaxed font-medium">
                    {config.message}
                </Text>

                <View className={`w-full ${config.buttons.length > 1 ? 'flex-row space-x-3' : 'flex-col items-center'}`}>
                    {config.buttons.map((btn, index) => (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.8}
                            className={`py-4 rounded-2xl items-center justify-center ${
                                config.buttons.length > 1 ? 'flex-1' : 'w-full'
                            } ${
                                btn.style === 'cancel' 
                                    ? 'bg-slate-100 dark:bg-slate-700' 
                                    : (config.type === 'error' ? 'bg-red-500' : 'bg-slate-900 shadow-lg shadow-slate-300')
                            }`}
                            onPress={() => {
                                hideAlert();
                                if (btn.onPress) btn.onPress();
                            }}
                        >
                            <Text className={`font-bold text-base ${btn.style === 'cancel' ? 'text-slate-600 dark:text-slate-300' : 'text-white'}`}>
                                {btn.text}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};
