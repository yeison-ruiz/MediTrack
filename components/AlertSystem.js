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
        { text: 'OK', onPress: () => {}, style: 'primary' }
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
      switch (config.type) {
          case 'success': return <CheckCircle size={48} color="#10b981" fill="#ecfdf5" />;
          case 'error': return <XCircle size={48} color="#ef4444" fill="#fef2f2" />;
          case 'warning': return <AlertTriangle size={48} color="#f59e0b" fill="#fffbeb" />;
          default: return <Info size={48} color="#3b82f6" fill="#eff6ff" />;
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
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
            <View className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[32px] p-6 items-center shadow-2xl">
                <View className="mb-4 transform scale-125">
                    {getIcon()}
                </View>

                <Text className={`text-xl font-extrabold text-center mb-2 ${getColor()}`}>
                    {config.title}
                </Text>

                <Text className="text-slate-500 dark:text-slate-300 text-center text-base mb-8 leading-6 font-medium">
                    {config.message}
                </Text>

                <View className={`w-full ${config.buttons.length > 1 ? 'flex-row space-x-3' : 'flex-col space-y-3'}`}>
                    {config.buttons.map((btn, index) => (
                        <TouchableOpacity
                            key={index}
                            className={`flex-1 py-4 rounded-2xl items-center justify-center ${
                                btn.style === 'cancel' 
                                    ? 'bg-slate-100 dark:bg-slate-700' 
                                    : (config.type === 'error' ? 'bg-red-500' : 'bg-blue-600')
                            } shadow-sm`}
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
