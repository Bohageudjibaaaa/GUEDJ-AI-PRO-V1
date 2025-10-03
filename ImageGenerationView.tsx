import React, { useState } from 'react';
import { generateImages } from '../services/geminiService';
import { ImageIcon, DownloadIcon, SparklesIcon } from './Icons';
import { useTheme, useLanguage } from '../contexts/AppContext';

const ImageGenerationView: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        try {
            const images = await generateImages(prompt);
            setGeneratedImages(images);
        } catch (err) {
            setError(t('failedToGenerateImages'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = (base64Image: string, index: number) => {
        const link = document.createElement('a');
        link.href = base64Image;
        link.download = `generated_image_${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="flex-1 flex flex-col" style={{ backgroundColor: isDarkMode ? theme.backgroundColorDark : theme.backgroundColorLight }}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-semibold">{t('imageGeneration')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageGenerationDesc')}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    {generatedImages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                            <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium">{t('createAnything')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('createAnythingDesc')}</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-8">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300">{t('generatingImages')}</p>
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 text-center">{error}</p>}

                    {generatedImages.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {generatedImages.map((img, index) => (
                                <div key={index} className="group relative rounded-lg overflow-hidden">
                                    <img src={img} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                        <button 
                                            onClick={() => handleDownload(img, index)}
                                            className="opacity-0 group-hover:opacity-100 p-3 rounded-full bg-white/80 text-black hover:bg-white transition-opacity"
                                            aria-label={t('downloadImage')}
                                        >
                                            <DownloadIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-transparent border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('imagePromptPlaceholder')}
                        rows={2}
                        className="flex-1 bg-white dark:bg-gray-800 p-3 rounded-lg resize-none outline-none focus:ring-2 focus:ring-primary-500 transition"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="px-6 py-3 flex items-center gap-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {t('generate')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageGenerationView;