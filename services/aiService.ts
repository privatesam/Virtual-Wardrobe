import * as geminiService from './geminiService';
import { Season } from '../types';

type ApiProvider = 'gemini' | 'openai';

interface AnalysisResult {
  title: string;
  color: string;
  style: string;
  season: Season;
  tags: string[];
}

interface EditedImage {
    base64: string;
    mimeType: string;
}

export const analyzeImage = async (
    apiProvider: ApiProvider,
    base64Image: string,
    mimeType: string,
    apiKey: string
): Promise<AnalysisResult> => {
    const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            provider: apiProvider,
            base64Image,
            mimeType,
            userApiKey: apiKey
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'AI Analysis failed');
    }

    return response.json();
};

export const removeBackground = async (
    base64Image: string,
    mimeType: string,
    geminiKey: string
): Promise<EditedImage> => {
    const response = await fetch('/api/ai/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            base64Image,
            mimeType,
            userGeminiKey: geminiKey
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Background removal failed');
    }

    return response.json();
};

export const fileToBase64 = geminiService.fileToBase64;
