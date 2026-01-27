'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import uz from './uz';
import en from './en';

type Language = 'uz' | 'en';
type Translations = typeof uz;

interface I18nContextType {
    lang: Language;
    t: Translations;
    setLang: (lang: Language) => void;
    toggleLang: () => void;
}

const translations = { uz, en };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANG_COOKIE_NAME = 'qomus-lang';

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>('uz');

    useEffect(() => {
        // Load language from localStorage on mount
        const savedLang = localStorage.getItem(LANG_COOKIE_NAME) as Language;
        if (savedLang && (savedLang === 'uz' || savedLang === 'en')) {
            setLangState(savedLang);
        }
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem(LANG_COOKIE_NAME, newLang);
        // Update HTML lang attribute
        document.documentElement.lang = newLang;
    };

    const toggleLang = () => {
        setLang(lang === 'uz' ? 'en' : 'uz');
    };

    const t = translations[lang];

    return (
        <I18nContext.Provider value={{ lang, t, setLang, toggleLang }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

// Helper function to get localized content from database entities
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocalizedContent(
    entity: any,
    field: string,
    lang: Language
): string {
    const fieldUz = `${field}Uz`;
    const fieldEn = `${field}En`;
    return lang === 'uz' ? entity[fieldUz] : entity[fieldEn];
}

