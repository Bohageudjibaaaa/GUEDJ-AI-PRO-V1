import React from 'react';
import type { AIPersonality, ThemeSettings, User } from './types';
import { AIPersonalityType } from './types';
import { BrainIcon, CodeIcon, PartyPopperIcon, SparklesIcon, UserIcon } from './components/Icons';

export const AI_PERSONALITIES: Record<AIPersonalityType, AIPersonality> = {
  [AIPersonalityType.ASSISTANT]: {
    id: AIPersonalityType.ASSISTANT,
    name: 'Helpful Assistant',
    systemInstruction: 'You are a helpful and friendly assistant. Be concise and clear in your responses.',
    icon: <BrainIcon className="w-5 h-5" />,
  },
  [AIPersonalityType.CREATIVE]: {
    id: AIPersonalityType.CREATIVE,
    name: 'Creative Writer',
    systemInstruction: 'You are a creative writer. Generate imaginative stories, poems, or scripts when asked.',
    icon: <SparklesIcon className="w-5 h-5" />,
  },
  [AIPersonalityType.CODE_HELPER]: {
    id: AIPersonalityType.CODE_HELPER,
    name: 'Coding Helper',
    systemInstruction: 'You are an expert programmer. Provide clean, efficient, and well-explained code. Use markdown for code blocks.',
    icon: <CodeIcon className="w-5 h-5" />,
  },
  [AIPersonalityType.FRIEND]: {
    id: AIPersonalityType.FRIEND,
    name: 'Friendly Chatbot',
    systemInstruction: 'You are a friendly chatbot. Your goal is to be a good conversational partner. Use emojis and a casual tone.',
    icon: <PartyPopperIcon className="w-5 h-5" />,
  },
};

export const DEFAULT_USER: User = {
  name: 'Guest User',
  avatar: 'default',
};

export const AVATARS: Record<string, React.FC<{className?: string}>> = {
    'default': (props) => <UserIcon {...props} />,
    'avatar1': (props) => <img {...props} src="https://source.boringavatars.com/beam/120/avatar1?colors=264653,2a9d8f,e9c46a,f4a261,e76f51" alt="avatar" />,
    'avatar2': (props) => <img {...props} src="https://source.boringavatars.com/beam/120/avatar2?colors=ffadad,ffd6a5,fdffb6,caffbf,9bf6ff" alt="avatar" />,
    'avatar3': (props) => <img {...props} src="https://source.boringavatars.com/beam/120/avatar3?colors=f94144,f3722c,f8961e,f9c74f,90be6d" alt="avatar" />,
    'avatar4': (props) => <img {...props} src="https://source.boringavatars.com/beam/120/avatar4?colors=8ecae6,219ebc,023047,ffb703,fb8500" alt="avatar" />,
}

export const DEFAULT_THEME: ThemeSettings = {
    userBubbleColorLight: '#4a6ef5',
    modelBubbleColorLight: '#ffffff',
    backgroundColorLight: '#f3f4f6',
    userBubbleColorDark: '#4a6ef5',
    modelBubbleColorDark: '#374151',
    backgroundColorDark: '#111827',
    font: 'sans'
};

export const FONTS = [
    { id: 'sans', name: 'Inter (Sans-serif)' },
    { id: 'serif', name: 'Lora (Serif)' },
    { id: 'mono', name: 'Inconsolata (Monospace)' },
] as const;

export const LANGUAGES = [
    { id: 'en', name: 'English' },
    { id: 'ar', name: 'العربية' },
] as const;
