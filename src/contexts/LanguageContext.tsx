
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, TFunction } from '../../types';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TFunction;
    isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to get nested properties from an object using a string path
const getNestedValue = (obj: any, path: string): any => {
    if (!path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const storedLang = localStorage.getItem('language');
        return (storedLang === 'ar' || storedLang === 'en') ? storedLang : 'ar';
    });
    const [translations, setTranslations] = useState<Record<string, any> | null>(null);

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                // The path should be relative to the root of the served files (index.html)
                const response = await fetch(`./locales/${language}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error(`Could not load translations for language: ${language}`, error);
                setTranslations({}); // Set to empty to avoid breaking the app
            }
        };
        loadTranslations();
    }, [language]);

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = useCallback((key: string, options?: Record<string, string | number | boolean>): any => {
        if (!translations) return key; // Return key if translations are not loaded yet
        
        let translation = getNestedValue(translations, key);

        if (options && (options as any).returnObjects) {
            return translation;
        }

        if (translation === undefined) {
            console.warn(`Translation key not found: ${key}`);
            return key; // Return the key itself as a fallback
        }

        if (options) {
            Object.keys(options).forEach(optionKey => {
                const regex = new RegExp(`{${optionKey}}`, 'g');
                translation = String(translation).replace(regex, String((options as any)[optionKey]));
            });
        }

        return String(translation);
    }, [translations]);

    const value = { language, setLanguage, t, isRtl: language === 'ar' };
    
    // Render children only after translations are loaded to prevent FOUC
    if (!translations) {
        return null; 
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};