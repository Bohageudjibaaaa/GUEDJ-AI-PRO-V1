import React from 'react';
import type { Message as MessageType } from '../types';
import { UserIcon, FileTextIcon, SpeakerOnIcon, SpeakerOffIcon } from './Icons';
import Spinner from './Spinner';
import { getTextColorForBackground } from '../utils';
import { useTheme, useLanguage } from '../contexts/AppContext';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
  onToggleSpeech: (message: MessageType) => void;
  isSpeaking: boolean;
}

const formatText = (text: string) => {
    const html = text
      .replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-md font-mono text-sm">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
          const escapedCode = code.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return `<pre class="bg-gray-800 text-white p-4 rounded-lg my-2 overflow-x-auto"><code class="language-${lang || ''}">${escapedCode}</code></pre>`;
      })
      .replace(/\n/g, '<br />');
    return { __html: html };
  };

const Message: React.FC<MessageProps> = ({ message, isStreaming, onToggleSpeech, isSpeaking }) => {
  const isUser = message.role === 'user';
  const isModel = message.role === 'model';
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  
  const bubbleColor = isUser 
    ? (isDarkMode ? 'var(--user-bubble-dark)' : 'var(--user-bubble-light)')
    : (isDarkMode ? 'var(--model-bubble-dark)' : 'var(--model-bubble-light)');

  const textColor = getTextColorForBackground(bubbleColor);

  return (
    <div className={`group flex items-start gap-4 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isModel && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
          G
        </div>
      )}

      <div 
        className={`max-w-xl p-4 rounded-2xl relative shadow-md ${isUser ? 'rounded-br-lg' : 'rounded-bl-lg'}`}
        style={{ backgroundColor: bubbleColor, color: textColor }}
      >
         {isModel && message.text && (
            <button 
                onClick={() => onToggleSpeech(message)}
                className="absolute -top-2 -right-2 p-1.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={isSpeaking ? t('stopSpeech') : t('readMessageAloud')}
            >
                {isSpeaking ? <SpeakerOnIcon className="w-4 h-4" /> : <SpeakerOffIcon className="w-4 h-4" />}
            </button>
        )}
        {message.image && (
          <img src={message.image} alt="User upload" className="rounded-lg mb-2 max-w-xs" />
        )}
        {message.document && (
          <div className="mb-2 p-2 bg-black/10 dark:bg-black/20 rounded-lg flex items-center gap-2 text-sm border border-white/20 dark:border-gray-500/50">
            <FileTextIcon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate font-medium">{message.document.name}</span>
          </div>
        )}
        <div className="prose prose-sm dark:prose-invert max-w-none" style={{color: 'inherit'}} dangerouslySetInnerHTML={formatText(message.text)}></div>
         {isModel && isStreaming && message.text.length === 0 && <Spinner />}
         {message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/20 dark:border-gray-500/50">
                <h4 className="text-xs font-semibold mb-2" style={{color: textColor, opacity: 0.8}}>{t('sources')}</h4>
                <ol className="list-decimal list-inside space-y-1">
                    {message.groundingChunks.map((chunk, index) => (
                        <li key={index} className="text-xs truncate">
                            <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{color: textColor}}>
                                {chunk.web.title || chunk.web.uri}
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
         )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <UserIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default Message;