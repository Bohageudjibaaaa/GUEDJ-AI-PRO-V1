import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';
import type { UseChatReturn } from '../hooks/useChat';
import type { Message as MessageType } from '../types';
import PersonalitySelector from './PersonalitySelector';
import { BrainIcon, StopCircleIcon, SearchIcon } from './Icons';
import { useTheme, useLanguage } from '../contexts/AppContext';

type ChatViewProps = UseChatReturn;

const ChatView: React.FC<ChatViewProps> = ({
  activeChat,
  sendMessage,
  isLoading,
  currentPersonality,
  setPersonality,
  stopGeneration,
  toggleSearchMode,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isLoading]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [activeChat?.id]);

  const handleToggleSpeech = (message: MessageType) => {
    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
      window.speechSynthesis.speak(utterance);
      setSpeakingMessageId(message.id);
    }
  };
  
  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8" style={{ backgroundColor: isDarkMode ? theme.backgroundColorDark : theme.backgroundColorLight }}>
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-4">
            <BrainIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{t('howCanIHelp')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('selectChatToBegin')}
          </p>
      </div>
    );
  }

  const isNewChat = activeChat.messages.length === 0;

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: isDarkMode ? theme.backgroundColorDark : theme.backgroundColorLight }}>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {activeChat.messages.map((msg, index) => (
             <Message 
                key={msg.id} 
                message={msg} 
                isStreaming={isLoading && index === activeChat.messages.length - 1}
                onToggleSpeech={handleToggleSpeech}
                isSpeaking={speakingMessageId === msg.id}
             />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="max-w-4xl mx-auto w-full">
         <div className="px-4 pb-2">
           {isLoading && (
              <div className="flex justify-center mb-2">
                <button 
                  onClick={stopGeneration}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <StopCircleIcon className="w-5 h-5" />
                  {t('stopGenerating')}
                </button>
              </div>
           )}
           <div className="flex items-center gap-2 mb-2">
            <PersonalitySelector
              currentPersonality={currentPersonality}
              onPersonalityChange={setPersonality}
              disabled={!isNewChat}
            />
            <div className="flex-shrink-0">
                 <button
                    onClick={toggleSearchMode}
                    disabled={!isNewChat}
                    title={t('enableGoogleSearch')}
                    className={`flex items-center gap-2 w-full text-left p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeChat.isSearchEnabled 
                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' 
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    <SearchIcon className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">{t('googleSearch')}</span>
                </button>
            </div>
           </div>
          </div>
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatView;