import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, AppSettingsContextType } from '../../types';

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
    isMaintenanceMode: false,
    maintenanceMessage: 'التطبيق تحت الصيانة حاليًا. سنعود قريبًا!',
    toolUsageLimit: 0, // 0 means unlimited
    disabledTools: {},
    calculatorSettings: {},
};

export const AppSettingsContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const item = window.localStorage.getItem('app_settings');
            return item ? { ...defaultSettings, ...JSON.parse(item) } : defaultSettings;
        } catch (error) {
            console.error("Failed to parse app settings from localStorage", error);
            return defaultSettings;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('app_settings', JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save app settings to localStorage", error);
        }
    }, [settings]);

    const handleSetAppSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const value: AppSettingsContextType = {
        ...settings,
        setAppSettings: handleSetAppSettings,
    };

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
};

export const useAppSettings = () => {
    const context = useContext(AppSettingsContext);
    if (context === undefined) {
        throw new Error('useAppSettings must be used within an AppSettingsContextProvider');
    }
    return context;
};