import { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat, Message, AIPersonalityType } from '../types';
import { AIPersonalityType as PersonalityEnum } from '../types';
import { generateResponseStream, clearChatHistory } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState<AIPersonalityType>(PersonalityEnum.ASSISTANT);
  const stopGenerationRef = useRef(false);
  
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
    const savedActiveChatId = localStorage.getItem('activeChatId');
    if(savedActiveChatId) {
        setActiveChatId(savedActiveChatId);
    }
  }, []);

  useEffect(() => {
    if(chats.length > 0) {
        localStorage.setItem('chats', JSON.stringify(chats));
    }
    if(activeChatId){
        localStorage.setItem('activeChatId', activeChatId);
    }
  }, [chats, activeChatId]);

  const activeChat = chats.find(chat => chat.id === activeChatId);
  
  const setPersonality = (personality: AIPersonalityType) => {
    if (activeChat && activeChat.messages.length === 0) {
        setCurrentPersonality(personality);
        setChats(prev => prev.map(c => c.id === activeChatId ? {...c, personality} : c));
    }
  };

  const toggleSearchMode = () => {
    if (activeChat && activeChat.messages.length === 0) {
      setChats(prev => prev.map(c => c.id === activeChatId ? {...c, isSearchEnabled: !c.isSearchEnabled} : c));
    }
  }
  
  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      personality: PersonalityEnum.ASSISTANT,
      isSearchEnabled: false,
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setCurrentPersonality(PersonalityEnum.ASSISTANT);
  }, []);

  const selectChat = useCallback((id: string) => {
    const chat = chats.find(c => c.id === id);
    if(chat) {
        setActiveChatId(id);
        setCurrentPersonality(chat.personality);
    }
  }, [chats]);
  
  const deleteChat = useCallback((id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    clearChatHistory(id);
    if (activeChatId === id) {
        const remainingChats = chats.filter(c => c.id !== id);
        if (remainingChats.length > 0) {
           setActiveChatId(remainingChats[0].id);
        } else {
           setActiveChatId(null);
           localStorage.removeItem('activeChatId');
        }
    }
  }, [activeChatId, chats]);
  
  const stopGeneration = () => {
      stopGenerationRef.current = true;
  }

  const sendMessage = async (text: string, image?: string, document?: { name: string; content: string }) => {
    if (!activeChatId) return;
    const currentChat = chats.find(c => c.id === activeChatId);
    if (!currentChat) return;

    stopGenerationRef.current = false;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      image,
      document,
      timestamp: Date.now(),
    };

    setChats(prev => prev.map(chat =>
      chat.id === activeChatId
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ));
    setIsLoading(true);

    const modelMessage: Message = {
      id: `msg-${Date.now()}-model`,
      role: 'model',
      text: '',
      timestamp: Date.now(),
    };

    setChats(prev => prev.map(chat =>
      chat.id === activeChatId
        ? { ...chat, messages: [...chat.messages, modelMessage] }
        : chat
    ));
    
    try {
        let finalPrompt = text;
        if (document) {
          finalPrompt = `Please analyze the following document named "${document.name}".\n\nDocument Content:\n---\n${document.content}\n---\n\nMy request is: ${text}`;
        }

        const stream = await generateResponseStream(
            activeChatId,
            currentChat.messages,
            currentPersonality,
            finalPrompt,
            currentChat.isSearchEnabled || false,
            image
        );

        let fullResponse = '';
        let groundingMetadata: any = null;
        for await (const chunk of stream) {
            if (stopGenerationRef.current) break;

            fullResponse += chunk.text;
            
            if (chunk.candidates?.[0]?.groundingMetadata) {
                groundingMetadata = chunk.candidates[0].groundingMetadata;
            }

            setChats(prev =>
                prev.map(chat =>
                    chat.id === activeChatId
                        ? {
                            ...chat,
                            messages: chat.messages.map(msg =>
                                msg.id === modelMessage.id
                                    ? { ...msg, text: fullResponse }
                                    : msg
                            ),
                        }
                        : chat
                )
            );
        }
        
        // Final update with grounding metadata
        setChats(prev => prev.map(chat => {
            if (chat.id === activeChatId) {
                // FIX: `newTitle` was a const, preventing modification. Changed to let.
                // Also corrected the logic to safely set the chat title from the first message
                // if it's a new chat, which was the likely original intent.
                let newTitle = chat.title;
                if (chat.title === 'New Chat' && chat.messages.length > 0) {
                    const firstMessageText = chat.messages[0].text;
                    newTitle = firstMessageText.substring(0, 30);
                    if (firstMessageText.length > 30) {
                        newTitle += '...';
                    }
                }
                
                return {
                    ...chat,
                    title: newTitle,
                    messages: chat.messages.map(msg =>
                        msg.id === modelMessage.id
                            ? { ...msg, text: fullResponse, groundingChunks: groundingMetadata?.groundingChunks }
                            : msg
                    ),
                };
            }
            return chat;
        }));

    } catch(error) {
        console.error("Error sending message:", error);
        setChats(prev =>
            prev.map(chat =>
                chat.id === activeChatId
                    ? {
                        ...chat,
                        messages: chat.messages.map(msg =>
                            msg.id === modelMessage.id
                                ? { ...msg, text: "Sorry, I encountered an error." }
                               : msg
                        ),
                    }
                    : chat
            )
        );
    } finally {
        setIsLoading(false);
        stopGenerationRef.current = false;
    }
  };

  return {
    chats,
    activeChat,
    activeChatId,
    isLoading,
    currentPersonality,
    setPersonality,
    toggleSearchMode,
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    stopGeneration
  };
};

export type UseChatReturn = ReturnType<typeof useChat>;