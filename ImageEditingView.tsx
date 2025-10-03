import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { ImageIcon, DownloadIcon, SparklesIcon, WandIcon } from './Icons';
import { useTheme, useLanguage } from '../contexts/AppContext';

const ImageEditingView: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setEditedImage(null); // Reset edited image on new upload
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || !originalImage) return;
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        try {
            const image = await editImage(originalImage, prompt);
            setEditedImage(image);
        } catch (err) {
            setError(t('failedToEditImage'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col" style={{ backgroundColor: isDarkMode ? theme.backgroundColorDark : theme.backgroundColorLight }}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-semibold">{t('imageEditing')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageEditingDesc')}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    {!originalImage && !isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                            <WandIcon className="w-16 h-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium">{t('editYourImages')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('editYourImagesDesc')}</p>
                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                                {t('uploadAnImage')}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-8">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300">{t('generatingEditedImage')}</p>
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 text-center">{error}</p>}

                    {originalImage && !isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-center font-semibold mb-2">{t('original')}</h4>
                                <img src={originalImage} alt={t('original')} className="w-full h-auto object-contain rounded-lg" />
                            </div>
                             <div>
                                <h4 className="text-center font-semibold mb-2">{t('edited')}</h4>
                                {editedImage ? (
                                    <img src={editedImage} alt={t('edited')} className="w-full h-auto object-contain rounded-lg" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-transparent border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                     <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('editPromptPlaceholder')}
                        rows={2}
                        className="flex-1 bg-white dark:bg-gray-800 p-3 rounded-lg resize-none outline-none focus:ring-2 focus:ring-primary-500 transition"
                        disabled={isLoading || !originalImage}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim() || !originalImage}
                        className="px-6 py-3 flex items-center gap-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {t('edit')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditingView;
