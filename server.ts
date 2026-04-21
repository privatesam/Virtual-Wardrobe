import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'db.json');

const initialData = {
  pieces: [],
  outfits: [],
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // --- Database Helper Functions ---
  const readDb = async () => {  
    try {
      await fs.access(dbPath);
      const data = await fs.readFile(dbPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(dbPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
  };

  const writeDb = async (data: any) => {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  };

  // --- API Routes ---
  app.get('/api/data', async (req, res) => {
    try {
      const db = await readDb();
      res.json(db);
    } catch (error) {
      res.status(500).json({ message: 'Error reading database', error });
    }
  });

  app.post('/api/pieces', async (req, res) => {
    try {
      const db = await readDb();
      const newPiece = {
        ...req.body,
        id: `p${Date.now()}`,
        wearHistory: [],
        createdAt: new Date().toISOString(),
      };
      db.pieces.unshift(newPiece);
      await writeDb(db);
      res.status(201).json(newPiece);
    } catch (error) {
      res.status(500).json({ message: 'Error adding piece', error });
    }
  });

  app.put('/api/pieces/:id', async (req, res) => {
    try {
      const db = await readDb();
      const pieceId = req.params.id;
      const pieceIndex = db.pieces.findIndex((p: any) => p.id === pieceId);
      if (pieceIndex === -1) {
        return res.status(404).json({ message: 'Piece not found' });
      }
      db.pieces[pieceIndex] = { ...db.pieces[pieceIndex], ...req.body };
      await writeDb(db);
      res.json(db.pieces[pieceIndex]);
    } catch (error) {
      res.status(500).json({ message: 'Error updating piece', error });
    }
  });

  app.delete('/api/pieces/:id', async (req, res) => {
    try {
      const db = await readDb();
      const pieceId = req.params.id;
      db.pieces = db.pieces.filter((p: any) => p.id !== pieceId);
      db.outfits = db.outfits.map((o: any) => ({
        ...o,
        pieceIds: o.pieceIds.filter((id: string) => id !== pieceId),
      }));
      await writeDb(db);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting piece', error });
    }
  });

  app.post('/api/outfits', async (req, res) => {
    try {
      const db = await readDb();
      const newOutfit = {
        ...req.body,
        id: `o${Date.now()}`,
        wearHistory: [],
        createdAt: new Date().toISOString(),
      };
      db.outfits.unshift(newOutfit);
      await writeDb(db);
      res.status(201).json(newOutfit);
    } catch (error) {
      res.status(500).json({ message: 'Error creating outfit', error });
    }
  });

  app.put('/api/outfits/:id', async (req, res) => {
    try {
      const db = await readDb();
      const outfitId = req.params.id;
      const outfitIndex = db.outfits.findIndex((o: any) => o.id === outfitId);
      if (outfitIndex === -1) {
        return res.status(404).json({ message: 'Outfit not found' });
      }
      db.outfits[outfitIndex] = { ...db.outfits[outfitIndex], ...req.body };
      await writeDb(db);
      res.json(db.outfits[outfitIndex]);
    } catch (error) {
      res.status(500).json({ message: 'Error updating outfit', error });
    }
  });

  app.delete('/api/outfits/:id', async (req, res) => {
    try {
      const db = await readDb();
      const outfitId = req.params.id;
      db.outfits = db.outfits.filter((o: any) => o.id !== outfitId);
      await writeDb(db);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting outfit', error });
    }
  });

  app.post('/api/logwear', async (req, res) => {
    try {
      const { id, type } = req.body;
      if (!id || !type) {
        return res.status(400).json({ message: 'ID and type are required' });
      }
      
      const db = await readDb();
      const newLog = {
        id: `w${Date.now()}`,
        date: new Date().toISOString(),
      };

      if (type === 'piece') {
        const piece = db.pieces.find((p: any) => p.id === id);
        if(piece) piece.wearHistory.push(newLog);
      } else if (type === 'outfit') {
        const outfit = db.outfits.find((o: any) => o.id === id);
        if (outfit) {
          outfit.wearHistory.push(newLog);
          db.pieces.forEach((p: any) => {
            if (outfit.pieceIds.includes(p.id)) {
              p.wearHistory.push(newLog);
            }
          });
        }
      } else {
        return res.status(400).json({ message: 'Invalid item type' });
      }

      await writeDb(db);
      res.status(200).json({ message: 'Wear logged successfully' });

    } catch (error) {
      res.status(500).json({ message: 'Error logging wear', error });
    }
  });

  // --- AI Logic Routes ---
  app.post('/api/ai/analyze', async (req, res) => {
    const { provider, base64Image, mimeType, userApiKey } = req.body;
    
    try {
      if (provider === 'gemini') {
        const apiKey = userApiKey || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Gemini API key is not configured.');
        
        // Lazy load Gemini SDK with robust export handling
        const GenAIModule = await import("@google/genai");
        const GoogleGenAI = (GenAIModule as any).GoogleGenAI || (GenAIModule as any).default?.GoogleGenAI || (GenAIModule as any).default;
        const SchemaType = (GenAIModule as any).SchemaType || (GenAIModule as any).default?.SchemaType;
        
        const genAI = new GoogleGenAI(apiKey);
        if (typeof genAI.getGenerativeModel !== 'function') {
          throw new Error('Failed to initialize Gemini SDK correctly. getGenerativeModel is not a function.');
        }
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = "Analyze this image of a clothing item. Describe it in JSON format.";
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { inlineData: { data: base64Image, mimeType } },
                    { text: prompt }
                ]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        title: { type: SchemaType.STRING },
                        color: { type: SchemaType.STRING },
                        style: { type: SchemaType.STRING },
                        season: { type: SchemaType.STRING },
                        tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    },
                    required: ["title", "color", "style", "season", "tags"]
                }
            }
        });

        res.json(JSON.parse(result.response.text()));
      } else if (provider === 'openai') {
        const apiKey = userApiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OpenAI API key is not configured.');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                response_format: { type: "json_object" },
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this image of a clothing item. Describe it in JSON format conforming to this schema: { "title": "string", "color": "string", "style": "string", "season": "string", "tags": ["string"] }.' },
                        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
                    ]
                }],
                max_tokens: 300
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API Error');
        }
        
        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
      } else {
        res.status(400).json({ message: 'Invalid AI provider' });
      }
    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/ai/remove-bg', async (req, res) => {
    const { base64Image, mimeType, userGeminiKey } = req.body;
    const apiKey = userGeminiKey || process.env.GEMINI_API_KEY;

    try {
      if (!apiKey) throw new Error('Gemini API key is required for background removal.');
      
      // Lazy load Gemini SDK with robust export handling
      const GenAIModule = await import("@google/genai");
      const GoogleGenAI = (GenAIModule as any).GoogleGenAI || (GenAIModule as any).default?.GoogleGenAI || (GenAIModule as any).default;
      
      const genAI = new GoogleGenAI(apiKey);
      if (typeof genAI.getGenerativeModel !== 'function') {
        throw new Error('Failed to initialize Gemini SDK correctly. getGenerativeModel is not a function.');
      }
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const result = await model.generateContent({
          contents: [{
              role: 'user',
              parts: [
                  { inlineData: { data: base64Image, mimeType } },
                  { text: 'Isolate the main clothing item in this image by removing the background. The new background should be solid white.' }
              ]
          }],
          generationConfig: {}
      });

      const parts = result.response.candidates?.[0].content?.parts;
      const imagePart = parts?.find(p => p.inlineData);
      
      if (imagePart?.inlineData) {
        res.json({
            base64: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType
        });
      } else {
        throw new Error('No image was returned from the Gemini API.');
      }
    } catch (error: any) {
      console.error('Background Removal Error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
