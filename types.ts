// FIX: Import React to provide the 'React' namespace for types like React.ReactNode.
import type React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 string
  document?: {
    name: string;
    content: string;
  };
  timestamp: number;
  groundingChunks?: { web: { uri: string; title: string; } }[];
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  personality: AIPersonalityType;
  createdAt: number;
  isSearchEnabled?: boolean;
}

export interface AIPersonality {
  id: AIPersonalityType;
  name: string;
  systemInstruction: string;
  icon: React.ReactNode;
}

export enum AIPersonalityType {
  ASSISTANT = 'assistant',
  CREATIVE = 'creative',
  CODE_HELPER = 'code_helper',
  FRIEND = 'friend',
}

export interface User {
  name: string;
  avatar: string;
}

export interface ThemeSettings {
  userBubbleColorLight: string;
  modelBubbleColorLight: string;
  backgroundColorLight: string;
  userBubbleColorDark: string;
  modelBubbleColorDark: string;
  backgroundColorDark: string;
  font: 'sans' | 'serif' | 'mono';
}

export type Language = 'en' | 'ar';