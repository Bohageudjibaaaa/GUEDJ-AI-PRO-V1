import { GoogleGenAI, Chat, Content, Part, Role, Modality } from "@google/genai";
import { AI_PERSONALITIES } from '../constants';
import type { AIPersonalityType, Message } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const chats: Record<string, Chat> = {};

function getFileParts(image: string): Part[] {
  const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.*)$/);
  if (!match) {
    console.error("Invalid image data URL");
    return [];
  }
  const mimeType = match[1];
  const data = match[2];
  return [{ inlineData: { mimeType, data } }];
}

function mapMessagesToContent(messages: Message[]): Content[] {
    return messages.map(msg => {
        let promptText = msg.text;
        if (msg.role === 'user' && msg.document) {
            promptText = `Please analyze the following document named "${msg.document.name}".\n\nDocument Content:\n---\n${msg.document.content}\n---\n\nMy request is: ${msg.text}`;
        }

        const parts: Part[] = [{ text: promptText }];

        if (msg.image) {
            parts.push(...getFileParts(msg.image));
        }

        return {
            role: msg.role as Role,
            parts: parts
        };
    });
}


export async function generateResponseStream(
  chatId: string,
  messages: Message[],
  personality: AIPersonalityType,
  newPrompt: string,
  isSearchEnabled: boolean,
  image?: string
) {
  const personalityConfig = AI_PERSONALITIES[personality];
  const modelConfig: any = {
    systemInstruction: personalityConfig.systemInstruction,
  };
  
  if (isSearchEnabled) {
    modelConfig.tools = [{googleSearch: {}}];
  }

  // If the chat history is empty and search is enabled, create a new non-chat session
  if (messages.length === 0 && isSearchEnabled) {
     const contents = mapMessagesToContent(messages);
     contents.push({ role: 'user', parts: [{ text: newPrompt }] });
     const stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: modelConfig,
     });
     return stream;
  }
  
  if (!chats[chatId]) {
    const history = mapMessagesToContent(messages);
    chats[chatId] = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: modelConfig,
      history: history,
    });
  } else {
    // This is a simplistic way to handle config changes. 
    // In a real app, you might need a more robust way to re-init chat if config changes.
    // For now, we assume config (like search) doesn't change mid-chat.
  }

  const chat = chats[chatId];
  const userMessageParts: Part[] = [{ text: newPrompt }];
  if (image) {
    userMessageParts.push(...getFileParts(image));
  }

  const stream = await chat.sendMessageStream({ message: userMessageParts });

  return stream;
}

export async function generateImages(prompt: string): Promise<string[]> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 4,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
    } catch (error) {
        console.error("Error generating images:", error);
        throw error;
    }
}

export async function editImage(base64ImageData: string, prompt: string): Promise<string> {
    try {
        const match = base64ImageData.match(/^data:(image\/(?:jpeg|png|webp));base64,(.*)$/);
        if (!match) {
            throw new Error("Invalid image data URL");
        }
        const mimeType = match[1];
        const data = match[2];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image was generated in the response.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw error;
    }
}


export async function generateVideos(prompt: string, onProgress: (message: string) => void): Promise<string> {
    try {
        onProgress("Starting video generation process...");
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });
        
        onProgress("Warming up the digital film... This may take a few minutes.");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onProgress("Rendering pixels... please wait.");
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        onProgress("Finalizing the masterpiece!");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        // The API key must be appended to the download URI
        const videoUrlWithKey = `${downloadLink}&key=${API_KEY}`;
        
        // Fetch the video as a blob and create a local URL for playback
        const response = await fetch(videoUrlWithKey);
        if (!response.ok) {
            throw new Error(`Failed to fetch video data: ${response.statusText}`);
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Error generating video:", error);
        throw error;
    }
}


export function clearChatHistory(chatId: string) {
    if(chats[chatId]) {
        delete chats[chatId];
    }
}