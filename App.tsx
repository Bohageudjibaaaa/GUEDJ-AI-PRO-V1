import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageGenerationView from './components/ImageGenerationView';
import VideoGenerationView from './components/VideoGenerationView';
import ImageEditingView from './components/ImageEditingView';
import SettingsModal from './components/SettingsModal';
import LoginView from './components/LoginView';
import { MenuIcon } from './components/Icons';
import { useChat } from './hooks/useChat';
import { useTheme, useView, useAuth, useLanguage } from './contexts/AppContext';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const chatHook = useChat();
  const { view } = useView();
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated, login } = useAuth();
  const { language, t } = useLanguage();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--user-bubble-light', theme.userBubbleColorLight);
    root.style.setProperty('--model-bubble-light', theme.modelBubbleColorLight);
    root.style.setProperty('--background-light', theme.backgroundColorLight);
    root.style.setProperty('--user-bubble-dark', theme.userBubbleColorDark);
    root.style.setProperty('--model-bubble-dark', theme.modelBubbleColorDark);
    root.style.setProperty('--background-dark', theme.backgroundColorDark);
    
    const fontFamilies = {
      sans: 'Inter, sans-serif',
      serif: 'Lora, serif',
      mono: 'Inconsolata, monospace'
    };
    root.style.setProperty('--font-family', fontFamilies[theme.font]);
    
    document.body.className = isDarkMode ? 'dark' : '';
    document.body.style.backgroundColor = isDarkMode ? theme.backgroundColorDark : theme.backgroundColorLight;
    document.body.style.fontFamily = `var(--font-family)`;
    
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

  }, [theme, isDarkMode, language]);

  if (!isAuthenticated) {
    return <LoginView onLogin={login} />;
  }
  
  const viewTitles: Record<string, string> = {
    'chat': chatHook.activeChat?.title || t('appTitle'),
    'image': t('imageGeneration'),
    'video': t('videoGeneration'),
    'image-edit': t('imageEditing'),
  };

  const renderView = () => {
    switch(view) {
      case 'chat':
        return <ChatView {...chatHook} />;
      case 'image':
        return <ImageGenerationView />;
      case 'video':
        return <VideoGenerationView />;
      case 'image-edit':
        return <ImageEditingView />;
      default:
        return <ChatView {...chatHook} />;
    }
  }

  return (
    <>
      <div className="flex h-screen w-full text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
        <div
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:dark:border-r md:border-l-0 dark:border-gray-700`}
        >
          <Sidebar 
            {...chatHook} 
            closeSidebar={() => setSidebarOpen(false)} 
            openSettings={() => setSettingsModalOpen(true)}
          />
        </div>

        <main className="flex-1 flex flex-col h-screen">
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {viewTitles[view]}
            </h1>
            <div></div> {/* Spacer */}
          </div>
          {renderView()}
        </main>
        
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}
      </div>
      <SettingsModal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
    </>
  );
};

export default App;