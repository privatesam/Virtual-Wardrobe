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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
