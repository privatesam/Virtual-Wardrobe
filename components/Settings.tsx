import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';

const Settings: React.FC = () => {
    const { apiKey, apiProvider, setApiKey, setApiProvider } = useSettings();
    const [localApiKey, setLocalApiKey] = useState('');
    const [localApiProvider, setLocalApiProvider] = useState(apiProvider);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalApiKey(apiKey);
        setLocalApiProvider(apiProvider);
    }, [apiKey, apiProvider]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setApiKey(localApiKey);
        setApiProvider(localApiProvider);
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
                                <p className="text-xs text-textdark mt-1">Uses the Gemini Flash models for fast and accurate analysis, including background removal.</p>
                            </label>
                            <label className={`flex-1 p-4 rounded-lg cursor-pointer transition-all ${localApiProvider === 'openai' ? 'bg-green-600 ring-2 ring-white' : 'bg-accent hover:bg-gray-600'}`}>
                                <input type="radio" name="provider" value="openai" checked={localApiProvider === 'openai'} onChange={() => setLocalApiProvider('openai')} className="hidden" />
                                <span className="font-bold text-lg">OpenAI</span>
                                <p className="text-xs text-textdark mt-1">Uses GPT-4o for image analysis. Note: Background removal is not supported with OpenAI.</p>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="apiKey" className="block font-medium text-lg mb-2">API Key</label>
                        <p className="text-sm text-highlight mb-4">Your API key is stored securely in your browser's local storage and is never sent to our servers.</p>
                        <input
                            id="apiKey"
                            type="password"
                            value={localApiKey}
                            onChange={(e) => setLocalApiKey(e.target.value)}
                            placeholder="Enter your API key"
                            className="w-full p-3 bg-accent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
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
