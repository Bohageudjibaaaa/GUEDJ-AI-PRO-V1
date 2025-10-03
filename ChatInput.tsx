import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, XIcon, FileTextIcon, MicrophoneIcon } from './Icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useLanguage } from '../contexts/AppContext';

interface ChatInputProps {
  onSendMessage: (message: string, image?: string, document?: { name: string; content: string }) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [document, setDocument] = useState<{ name: string; content: string } | null>(null);
  const { t } = useLanguage();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
        setText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);
  
  const handleSendMessage = () => {
    if ((text.trim() || image || document) && !isLoading) {
      onSendMessage(text.trim(), image || undefined, document || undefined);
      setText('');
      setImage(null);
      setImageName('');
      setDocument(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (documentInputRef.current) documentInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' && file.size < 1000000) { // Limit size to 1MB
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setDocument({ name: file.name, content });
        };
        reader.readAsText(file);
      } else {
        alert('File must be a .txt file and under 1MB.');
        if (documentInputRef.current) documentInputRef.current.value = '';
      }
    }
  };

  const removeDocument = () => {
      setDocument(null);
      if (documentInputRef.current) documentInputRef.current.value = '';
  }
  
  const toggleListening = () => {
      if (isListening) {
          stopListening();
      } else {
          startListening();
      }
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 flex items-end">
        {(image || document) && (
            <div className="absolute bottom-full left-2 mb-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col gap-2 w-auto max-w-sm">
             {image && (
                <div className="flex items-center gap-2 p-1">
                    <img src={image} alt={t('imagePreview')} className="w-10 h-10 object-cover rounded-md" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{imageName}</span>
                    <button onClick={() => { setImage(null); setImageName(''); if (imageInputRef.current) imageInputRef.current.value = ''; }} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                    <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
             {document && (
                <div className="flex items-center gap-2 p-1">
                    <FileTextIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{document.name}</span>
                    <button onClick={removeDocument} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            </div>
        )}
       
        <button
          onClick={() => documentInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('uploadDocument')}
        >
          <FileTextIcon className="w-6 h-6" />
        </button>
         <input
          type="file"
          ref={documentInputRef}
          onChange={handleDocumentChange}
          className="hidden"
          accept=".txt"
        />
        <button
          onClick={() => imageInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('uploadImage')}
        >
          <PaperclipIcon className="w-6 h-6" />
        </button>
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('typeYourMessage')}
          rows={1}
          className="flex-1 bg-transparent px-4 py-2 resize-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 max-h-48"
          disabled={isLoading}
        />
         <button
          onClick={toggleListening}
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isListening ? 'text-red-500' : 'text-gray-500 hover:text-primary-500'}`}
        >
          <MicrophoneIcon className="w-6 h-6" />
        </button>
        <button
          onClick={handleSendMessage}
          disabled={isLoading || (!text.trim() && !image && !document)}
          className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 ms-2"
          aria-label={t('sendMessage')}
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SendIcon className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;