import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import type { User, ThemeSettings, Language } from '../types';
import { DEFAULT_USER, DEFAULT_THEME } from '../constants';

// Define types for translations
type Translations = { [key: string]: string };
type TranslationData = {
    en: Translations;
    ar: Translations;
};

type View = 'chat' | 'image' | 'video' | 'image-edit';

interface ViewContextType {
    view: View;
    setView: (view: View) => void;
}

interface UserContextType {
    user: User;
    updateUser: (user: Partial<User>) => void;
}

interface ThemeContextType {
    theme: ThemeSettings;
    updateTheme: (theme: Partial<ThemeSettings>) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

interface AuthContextType {
    isAuthenticated: boolean;
    login: (name: string) => void;
    logout: () => void;
}

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string) => string;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);
const UserContext = createContext<UserContextType | undefined>(undefined);
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });
    
    // View State
    const [view, setView] = useState<View>('chat');

    // User State
    const [user, setUser] = useState<User>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
    });

    const updateUser = (newUser: Partial<User>) => {
        setUser(prev => {
            const updatedUser = { ...prev, ...newUser };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };
    
    const login = (name: string) => {
        if (name.trim()) {
            updateUser({ name: name.trim() });
            localStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
        }
    };

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
    };


    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('isDarkMode');
        return savedTheme ? JSON.parse(savedTheme) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [theme, setTheme] = useState<ThemeSettings>(() => {
        const savedThemeSettings = localStorage.getItem('themeSettings');
        return savedThemeSettings ? JSON.parse(savedThemeSettings) : DEFAULT_THEME;
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newIsDarkMode = !prev;
            localStorage.setItem('isDarkMode', JSON.stringify(newIsDarkMode));
            return newIsDarkMode;
        });
    };
    
    const updateTheme = (newTheme: Partial<ThemeSettings>) => {
        setTheme(prev => {
            const updatedTheme = { ...prev, ...newTheme };
            localStorage.setItem('themeSettings', JSON.stringify(updatedTheme));
            return updatedTheme;
        });
    };
    
    // Language State
    const [language, setLanguageState] = useState<Language>(() => {
        const savedLanguage = localStorage.getItem('language');
        return (savedLanguage as Language) || 'en';
    });
    const [translations, setTranslations] = useState<TranslationData | null>(null);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const [enRes, arRes] = await Promise.all([
                    fetch('./locales/en.json'),
                    fetch('./locales/ar.json')
                ]);
                if (!enRes.ok || !arRes.ok) throw new Error('Failed to fetch translation files');
                const en = await enRes.json();
                const ar = await arRes.json();
                setTranslations({ en, ar });
            } catch (error) {
                console.error("Failed to load translations:", error);
            }
        };
        fetchTranslations();
    }, []);
    
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    }
    
    const t = useCallback((key: string) => {
        if (!translations) {
            return key; // Fallback to key name if translations not loaded
        }
        const langFile = translations[language];
        return langFile?.[key] || key;
    }, [language, translations]);


    useEffect(() => {
        if(isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);
    
    const authValue = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated]);
    const viewValue = useMemo(() => ({ view, setView }), [view]);
    const userValue = useMemo(() => ({ user, updateUser }), [user]);
    const themeValue = useMemo(() => ({ theme, updateTheme, isDarkMode, toggleTheme }), [theme, isDarkMode]);
    const languageValue = useMemo(() => ({ language, setLanguage, t }), [language, t]);
    
    if (!translations) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <AuthContext.Provider value={authValue}>
            <LanguageContext.Provider value={languageValue}>
                <ViewContext.Provider value={viewValue}>
                    <UserContext.Provider value={userValue}>
                        <ThemeContext.Provider value={themeValue}>
                            {children}
                        </ThemeContext.Provider>
                    </UserContext.Provider>
                </ViewContext.Provider>
            </LanguageContext.Provider>
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AppProvider');
    return context;
};

export const useView = () => {
    const context = useContext(ViewContext);
    if (!context) throw new Error('useView must be used within an AppProvider');
    return context;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within an AppProvider');
    return context;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within an AppProvider');
    return context;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within an AppProvider');
    return context;
}