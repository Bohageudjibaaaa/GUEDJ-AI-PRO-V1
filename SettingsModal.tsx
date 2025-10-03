import React, { useState } from 'react';
import { XIcon, UserIcon, PaletteIcon, GlobeIcon } from './Icons';
import { useTheme, useUser, useLanguage } from '../contexts/AppContext';
import { AVATARS, FONTS, LANGUAGES } from '../constants';
import type { Language } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'language'>('profile');
    const { user, updateUser } = useUser();
    const { theme, updateTheme, isDarkMode } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const [currentName, setCurrentName] = useState(user.name);
    const [currentAvatar, setCurrentAvatar] = useState(user.avatar);
    const [currentTheme, setCurrentTheme] = useState(theme);
    const [currentLanguage, setCurrentLanguage] = useState(language);

    const handleSaveProfile = () => {
        updateUser({ name: currentName, avatar: currentAvatar });
        onClose();
    };
    
    const handleSaveTheme = () => {
        updateTheme(currentTheme);
        onClose();
    };
    
    const handleSaveLanguage = () => {
        setLanguage(currentLanguage);
        onClose();
    };

    const handleThemeChange = (field: string, value: string) => {
        setCurrentTheme(prev => ({ ...prev, [field]: value }));
    }

    if (!isOpen) return null;

    const renderProfileTab = () => (
        <div className="space-y-6">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('username')}</label>
                <input
                    type="text"
                    id="username"
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('avatar')}</label>
                <div className="mt-2 grid grid-cols-4 gap-4">
                    {Object.entries(AVATARS).map(([key, Component]) => (
                        <button key={key} onClick={() => setCurrentAvatar(key)} className={`rounded-full h-16 w-16 flex items-center justify-center overflow-hidden border-2 ${currentAvatar === key ? 'border-primary-500 ring-2 ring-primary-500' : 'border-transparent hover:border-gray-400'}`}>
                           <Component className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <button onClick={handleSaveProfile} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{t('saveChanges')}</button>
            </div>
        </div>
    );
    
    const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
        <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">{label}</label>
            <input type="color" value={value} onChange={onChange} className="w-10 h-10 rounded border-none bg-transparent cursor-pointer" />
        </div>
    )

    const renderThemeTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorInput label={t('backgroundColor')} value={isDarkMode ? currentTheme.backgroundColorDark : currentTheme.backgroundColorLight} onChange={e => handleThemeChange(isDarkMode ? 'backgroundColorDark' : 'backgroundColorLight', e.target.value)} />
                <ColorInput label={t('myBubbleColor')} value={isDarkMode ? currentTheme.userBubbleColorDark : currentTheme.userBubbleColorLight} onChange={e => handleThemeChange(isDarkMode ? 'userBubbleColorDark' : 'userBubbleColorLight', e.target.value)} />
                <ColorInput label={t('aiBubbleColor')} value={isDarkMode ? currentTheme.modelBubbleColorDark : currentTheme.modelBubbleColorLight} onChange={e => handleThemeChange(isDarkMode ? 'modelBubbleColorDark' : 'modelBubbleColorLight', e.target.value)} />
            </div>
             <div>
                <label htmlFor="font" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('fontStyle')}</label>
                 <select
                    id="font"
                    value={currentTheme.font}
                    onChange={e => handleThemeChange('font', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                    {FONTS.map(font => <option key={font.id} value={font.id}>{font.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end pt-4">
                <button onClick={handleSaveTheme} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{t('saveChanges')}</button>
            </div>
        </div>
    );
    
    const renderLanguageTab = () => (
        <div className="space-y-6">
            <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('language')}</label>
                <select
                    id="language"
                    value={currentLanguage}
                    onChange={e => setCurrentLanguage(e.target.value as Language)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                    {LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end pt-4">
                <button onClick={handleSaveLanguage} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{t('saveChanges')}</button>
            </div>
        </div>
    );


    const TabButton: React.FC<{ tabId: 'profile' | 'theme' | 'language', children: React.ReactNode }> = ({ tabId, children }) => (
        <button 
            onClick={() => setActiveTab(tabId)} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${activeTab === tabId ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold">{t('settings')}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="flex space-x-2 border-b-2 border-gray-200 dark:border-gray-700">
                        <TabButton tabId="profile"><UserIcon className="w-5 h-5"/> {t('profile')}</TabButton>
                        <TabButton tabId="theme"><PaletteIcon className="w-5 h-5"/> {t('theme')}</TabButton>
                        <TabButton tabId="language"><GlobeIcon className="w-5 h-5"/> {t('language')}</TabButton>
                    </div>
                </div>
                <div className="p-6">
                    {activeTab === 'profile' && renderProfileTab()}
                    {activeTab === 'theme' && renderThemeTab()}
                    {activeTab === 'language' && renderLanguageTab()}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;