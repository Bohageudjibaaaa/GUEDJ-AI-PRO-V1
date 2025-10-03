import React, { useState } from 'react';
import { generateVideos } from '../services/geminiService';
import { VideoIcon, SparklesIcon } from './Icons';
import { useTheme, useLanguage } from '../contexts/AppContext';

const VideoGenerationView: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState('');
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setGeneratedVideo(null);
        try {
            const videoUrl = await generateVideos(prompt, setProgressMessage);
            setGeneratedVideo(videoUrl);
        } catch (err) {
            setError(t('failedToGenerateVideo'));
            console.error(err);
        } finally {
            setIsLoading(false);
            setProgressMessage('');
        }
    };

    return (
        <div className="flex-1 flex flex-col" style={{ backgroundColor: isDarkMode ? theme.backgroundColorDark : theme.backgroundColorLight }}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-semibold">{t('videoGeneration')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('videoGenerationDesc')}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    {!generatedVideo && !isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                            <VideoIcon className="w-16 h-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium">{t('bringIdeasToLife')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('bringIdeasToLifeDesc')}</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-8">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300 font-semibold">{progressMessage}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('generatingVideo')}</p>
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 text-center">{error}</p>}

                    {generatedVideo && (
                        <div>
                            <video controls src={generatedVideo} className="w-full rounded-lg shadow-lg" />
                             <a 
                                href={generatedVideo} 
                                download={`generated_video_${Date.now()}.mp4`}
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600"
                            >
                                {t('downloadVideo')}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-transparent border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('videoPromptPlaceholder')}
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

export default VideoGenerationView;