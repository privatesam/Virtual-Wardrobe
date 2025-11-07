import { GoogleGenAI, Type, Modality } from "@google/genai";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};

export const analyzeClothingImage = async (apiKey: string, base64Image: string, mimeType: string) => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add it in settings.");
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: 'Analyze this image of a clothing item. Describe it in JSON format.' }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'A short, descriptive title for the clothing item. e.g., "Blue Denim Jacket".' },
            color: { type: Type.STRING, description: 'The primary color of the item.' },
            style: { type: Type.STRING, description: 'The style category of the item. e.g., "Casual", "Formal", "Streetwear".' },
            season: { type: Type.STRING, description: 'The most appropriate season for this item: "Spring", "Summer", "Autumn", "Winter", or "All".' },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'An array of relevant keywords or tags for the item. e.g., ["denim", "jacket", "outerwear"]'
            }
          },
          required: ['title', 'color', 'style', 'season', 'tags']
        }
      }
    });

    const jsonString = response.text;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze image with Gemini. Please check your API key and try again.");
  }
};

interface EditedImage {
    base64: string;
    mimeType: string;
}

export const removeBackgroundImage = async (apiKey: string, base64Image: string, mimeType: string): Promise<EditedImage> => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add it in settings.");
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: 'Isolate the main clothing item in this image by removing the background. The new background should be solid white.',
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return {
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
        };
      }
    }
    throw new Error("No image was returned from the API.");
  } catch (error) {
    console.error("Error removing background with Gemini:", error);
    throw new Error("Failed to remove background with Gemini. Please check your API key and try again.");
  }
};
