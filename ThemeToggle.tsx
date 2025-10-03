import React from 'react';
import { SunIcon, MoonIcon } from './Icons';
import { useTheme, useLanguage } from '../contexts/AppContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={isDarkMode ? t('switchToLightMode') : t('switchToDarkMode')}
    >
      {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;