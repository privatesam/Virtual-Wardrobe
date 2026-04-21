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
    apiProvider: ApiProvider,
    base64Image: string,
    mimeType: string,
    apiKey: string
): Promise<EditedImage> => {
    if (apiProvider === 'gemini') {
        return geminiService.removeBackgroundImage(base64Image, mimeType, apiKey);
    } else {
        throw new Error("Background removal is only supported by the Gemini provider.");
    }
};

export const fileToBase64 = geminiService.fileToBase64;
