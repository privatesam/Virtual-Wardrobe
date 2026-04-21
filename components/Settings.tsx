import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';

const Settings: React.FC = () => {
    const { 
        apiProvider, setApiProvider, 
        geminiKey, setGeminiKey, 
        openaiKey, setOpenaiKey 
    } = useSettings();
    const [localApiProvider, setLocalApiProvider] = useState(apiProvider);
    const [localGeminiKey, setLocalGeminiKey] = useState(geminiKey);
    const [localOpenaiKey, setLocalOpenaiKey] = useState(openaiKey);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalApiProvider(apiProvider);
        setLocalGeminiKey(geminiKey);
        setLocalOpenaiKey(openaiKey);
    }, [apiProvider, geminiKey, openaiKey]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setApiProvider(localApiProvider);
        setGeminiKey(localGeminiKey);
        setOpenaiKey(localOpenaiKey);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="space-y-8 text-white max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">Admin Settings</h1>
            <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-2">AI Provider</h2>
                        <p className="text-sm text-highlight mb-4">Choose which AI service to use for analyzing your clothing images.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <label className={`flex-1 p-4 rounded-lg cursor-pointer transition-all ${localApiProvider === 'gemini' ? 'bg-blue-600 ring-2 ring-white' : 'bg-accent hover:bg-gray-600'}`}>
                                <input type="radio" name="provider" value="gemini" checked={localApiProvider === 'gemini'} onChange={() => setLocalApiProvider('gemini')} className="hidden" />
                                <span className="font-bold text-lg">Google Gemini</span>
                                <p className="text-xs text-textdark mt-1">Uses Gemini 2.0 Flash for fast analysis and background removal.</p>
                            </label>
                            <label className={`flex-1 p-4 rounded-lg cursor-pointer transition-all ${localApiProvider === 'openai' ? 'bg-green-600 ring-2 ring-white' : 'bg-accent hover:bg-gray-600'}`}>
                                <input type="radio" name="provider" value="openai" checked={localApiProvider === 'openai'} onChange={() => setLocalApiProvider('openai')} className="hidden" />
                                <span className="font-bold text-lg">OpenAI</span>
                                <p className="text-xs text-textdark mt-1">Uses GPT-4o for image analysis.</p>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-2">API Configuration</h2>
                        <p className="text-sm text-highlight">You can provide keys here (persisted in your browser) or via server environment variables (<code>GEMINI_API_KEY</code>, <code>OPENAI_API_KEY</code>).</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Gemini API Key</label>
                                <input 
                                    type="password" 
                                    value={localGeminiKey} 
                                    onChange={(e) => setLocalGeminiKey(e.target.value)}
                                    placeholder="Enter your Google Gemini API key"
                                    className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-highlight mt-1">Required for Gemini provider and background removal.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
                                <input 
                                    type="password" 
                                    value={localOpenaiKey} 
                                    onChange={(e) => setLocalOpenaiKey(e.target.value)}
                                    placeholder="Enter your OpenAI API key"
                                    className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-highlight mt-1">Required for OpenAI provider.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                         <button type="submit" className={`font-bold py-2 px-6 rounded-lg transition-colors ${isSaved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {isSaved ? 'Saved!' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
