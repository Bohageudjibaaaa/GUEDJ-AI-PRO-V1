import React from 'react';
import { PlusIcon, TrashIcon, MessageSquareIcon, XIcon, ImageIcon, SettingsIcon, VideoIcon, WandIcon } from './Icons';
import type { UseChatReturn } from '../hooks/useChat';
import { useView, useUser, useLanguage } from '../contexts/AppContext';
import { AVATARS } from '../constants';

interface SidebarProps extends UseChatReturn {
  closeSidebar: () => void;
  openSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChat,
  createNewChat,
  selectChat,
  deleteChat,
  closeSidebar,
  openSettings,
}) => {
  const { view, setView } = useView();
  const { user } = useUser();
  const { t } = useLanguage();

  const AvatarComponent = AVATARS[user.avatar] || AVATARS.default;

  const NavButton = ({ currentView, targetView, setView, icon, label }: { currentView: string, targetView: string, setView: (v: any) => void, icon: React.ReactNode, label: string }) => (
    <button 
      onClick={() => setView(targetView)}
      className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-2 rounded-md transition-colors ${currentView === targetView ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-e border-gray-200 dark:border-gray-700">
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('appTitle')}</h1>
        <button onClick={closeSidebar} className="md:hidden text-gray-500 hover:text-gray-700" aria-label="Close sidebar">
            <XIcon className="w-6 h-6" />
        </button>
      </div>

      <nav className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 space-x-1">
          <NavButton currentView={view} targetView="chat" setView={setView} icon={<MessageSquareIcon className="w-5 h-5" />} label={t('chat')} />
          <NavButton currentView={view} targetView="image" setView={setView} icon={<ImageIcon className="w-5 h-5" />} label={t('images')} />
          <NavButton currentView={view} targetView="image-edit" setView={setView} icon={<WandIcon className="w-5 h-5" />} label={t('imageEdit')} />
          <NavButton currentView={view} targetView="video" setView={setView} icon={<VideoIcon className="w-5 h-5" />} label={t('videos')} />
        </div>
      </nav>

      {view === 'chat' && (
        <>
        <div className="p-2">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            {t('newChat')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                activeChat?.id === chat.id
                  ? 'bg-primary-100 dark:bg-primary-900/50'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquareIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {chat.title === 'New Chat' ? t('newChat') : chat.title}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(t('confirmDeleteChat'))) {
                    deleteChat(chat.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                aria-label={t('deleteChat')}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        </>
      )}
      
      {(view === 'image' || view === 'video' || view === 'image-edit') && (
        <div className="flex-1 p-4 text-center text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center">
          {view === 'image' && <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />}
          {view === 'video' && <VideoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />}
          {view === 'image-edit' && <WandIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />}
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{t(view === 'image' ? 'imageGeneration' : view === 'video' ? 'videoGeneration' : 'imageEditing')}</h3>
          <p className="mt-1 text-xs">{t(view === 'image' ? 'createAnythingDesc' : view === 'video' ? 'bringIdeasToLifeDesc' : 'editYourImagesDesc')}</p>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                     <AvatarComponent className="w-full h-full object-cover" />
                 </div>
                 <div>
                     <p className="font-semibold text-sm">{user.name}</p>
                     <p className="text-xs text-gray-500">{t('freePlan')}</p>
                 </div>
            </div>
            <button onClick={openSettings} className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label={t('openSettings')}>
              <SettingsIcon className="w-5 h-5" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;