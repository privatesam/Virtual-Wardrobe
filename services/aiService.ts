import * as geminiService from './geminiService';
import * as openAIService from './openAIService';
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
    if (apiProvider === 'gemini') {
        const result = await geminiService.analyzeClothingImage(base64Image, mimeType, apiKey);
        return result as AnalysisResult;
    } else if (apiProvider === 'openai') {
        const result = await openAIService.analyzeClothingImage(base64Image, mimeType, apiKey);
        return result as AnalysisResult;
    } else {
        throw new Error(`Unsupported API provider: ${apiProvider}`);
    }
};

export const removeBackground = async (
    base64Image: string,
    mimeType: string,
    geminiKey: string
): Promise<EditedImage> => {
    if (!geminiKey) {
        throw new Error("Gemini API key is required for background removal. Please add it in Settings.");
    }
    return geminiService.removeBackgroundImage(base64Image, mimeType, geminiKey);
};


export const fileToBase64 = geminiService.fileToBase64;
