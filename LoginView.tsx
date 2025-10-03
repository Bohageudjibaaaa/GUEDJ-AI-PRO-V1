import React, { useState } from 'react';
import { SparklesIcon } from './Icons';
import { useTheme, useLanguage } from '../contexts/AppContext';

interface LoginViewProps {
    onLogin: (name: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onLogin(name.trim());
        }
    };

    return (
        <div 
            className="flex items-center justify-center h-screen w-screen transition-colors duration-300"
            style={{ backgroundColor: isDarkMode ? theme.backgroundColorDark : theme.backgroundColorLight }}
        >
            <div className="text-center p-8 max-w-md w-full">
                <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full mb-6">
                    <SparklesIcon className="w-10 h-10" />
                </div>

                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{t('welcomeToApp')}</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 mb-8">{t('appSubtitle')}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="sr-only">{t('username')}</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('enterYourName')}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
                        disabled={!name.trim()}
                    >
                        {t('startCreating')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginView;