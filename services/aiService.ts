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
    apiKey: string,
    apiProvider: ApiProvider,
    base64Image: string,
    mimeType: string
): Promise<AnalysisResult> => {
    if (apiProvider === 'gemini') {
        const result = await geminiService.analyzeClothingImage(apiKey, base64Image, mimeType);
        return result as AnalysisResult;
    } else if (apiProvider === 'openai') {
        const result = await openAIService.analyzeClothingImage(apiKey, base64Image, mimeType);
        return result as AnalysisResult;
    } else {
        throw new Error(`Unsupported API provider: ${apiProvider}`);
    }
};

export const removeBackground = async (
    apiKey: string,
    apiProvider: ApiProvider,
    base64Image: string,
    mimeType: string
): Promise<EditedImage> => {
    if (apiProvider === 'gemini') {
        return geminiService.removeBackgroundImage(apiKey, base64Image, mimeType);
    } else {
        throw new Error("Background removal is only supported by the Gemini provider.");
    }
};

export const fileToBase64 = geminiService.fileToBase64;
