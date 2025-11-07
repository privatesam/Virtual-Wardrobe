// Note: OpenAI types are not available via CDN, so we'll use a basic interface.
interface OpenAIResponse {
    title: string;
    color: string;
    style: string;
    season: string;
    tags: string[];
}

export const analyzeClothingImage = async (apiKey: string, base64Image: string, mimeType: string): Promise<OpenAIResponse> => {
    if (!apiKey) {
        throw new Error("OpenAI API key is not configured. Please add it in settings.");
    }

    const API_URL = 'https://api.openai.com/v1/chat/completions';

    const payload = {
        model: 'gpt-4o',
        response_format: { type: "json_object" },
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze this image of a clothing item. Describe it in JSON format. The JSON object must conform to this schema: { "title": "A short, descriptive title", "color": "The primary color", "style": "The style category (e.g., Casual, Formal)", "season": "The most appropriate season (Spring, Summer, Autumn, Winter, or All)", "tags": ["array", "of", "relevant", "keywords"] }.`
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:${mimeType};base64,${base64Image}`
                        }
                    }
                ]
            }
        ],
        max_tokens: 300,
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API error:", errorData);
            throw new Error(`OpenAI API request failed: ${errorData.error.message}`);
        }

        const data = await response.json();
        const jsonString = data.choices[0].message.content;
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error analyzing image with OpenAI:", error);
        throw new Error("Failed to analyze image with OpenAI. Please check your API key and try again.");
    }
};
