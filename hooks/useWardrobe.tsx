import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Piece, Outfit } from '../types';

interface WardrobeContextType {
  pieces: Piece[];
  outfits: Outfit[];
  isLoading: boolean;
  error: string | null;
  addPiece: (pieceData: Omit<Piece, 'id' | 'images' | 'wearHistory' | 'createdAt'>, images: string[]) => Promise<void>;
  updatePiece: (updatedPiece: Piece) => Promise<void>;
  deletePiece: (pieceId: string) => Promise<void>;
  getPieceById: (id: string) => Piece | undefined;
  addOutfit: (outfitData: Omit<Outfit, 'id' | 'images' | 'wearHistory' | 'createdAt'>, images: string[]) => Promise<void>;
  updateOutfit: (updatedOutfit: Outfit) => Promise<void>;
  deleteOutfit: (outfitId: string) => Promise<void>;
  getOutfitById: (id: string) => Outfit | undefined;
  logWear: (id: string, type: 'piece' | 'outfit') => Promise<void>;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
      const data = await response.json();
      setPieces(data.pieces || []);
      setOutfits(data.outfits || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data from server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addPiece = async (pieceData: Omit<Piece, 'id' | 'images' | 'wearHistory' | 'createdAt'>, images: string[]) => {
    try {
      const response = await fetch('/api/pieces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pieceData, images }),
      });
      if (!response.ok) throw new Error('Failed to add piece.');
      const newPiece = await response.json();
      setPieces(prev => [newPiece, ...prev]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updatePiece = async (updatedPiece: Piece) => {
     try {
      const response = await fetch(`/api/pieces/${updatedPiece.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPiece),
      });
      if (!response.ok) throw new Error('Failed to update piece.');
      const savedPiece = await response.json();
      setPieces(prev => prev.map(p => p.id === savedPiece.id ? savedPiece : p));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deletePiece = async (pieceId: string) => {
    try {
      const response = await fetch(`/api/pieces/${pieceId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete piece.');
      setPieces(prev => prev.filter(p => p.id !== pieceId));
      // The backend will handle removing the piece from outfits, so we just refetch all data for simplicity
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  
  const getPieceById = useCallback((id: string) => pieces.find(p => p.id === id), [pieces]);

  const addOutfit = async (outfitData: Omit<Outfit, 'id' | 'images' | 'wearHistory' | 'createdAt'>, images: string[]) => {
    try {
      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...outfitData, images }),
      });
      if (!response.ok) throw new Error('Failed to add outfit.');
      const newOutfit = await response.json();
      setOutfits(prev => [newOutfit, ...prev]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateOutfit = async (updatedOutfit: Outfit) => {
    try {
      const response = await fetch(`/api/outfits/${updatedOutfit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOutfit),
      });
      if (!response.ok) throw new Error('Failed to update outfit.');
      const savedOutfit = await response.json();
      setOutfits(prev => prev.map(o => o.id === savedOutfit.id ? savedOutfit : o));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteOutfit = async (outfitId: string) => {
     try {
      const response = await fetch(`/api/outfits/${outfitId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete outfit.');
      setOutfits(prev => prev.filter(o => o.id !== outfitId));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  
  const getOutfitById = useCallback((id: string) => outfits.find(o => o.id === id), [outfits]);

  const logWear = async (id: string, type: 'piece' | 'outfit') => {
     try {
      const response = await fetch(`/api/logwear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      });
      if (!response.ok) throw new Error('Failed to log wear.');
      // Refetch data to get all updated wear histories
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const value = {
    pieces,
    outfits,
    isLoading,
    error,
    addPiece,
    updatePiece,
    deletePiece,
    getPieceById,
    addOutfit,
    updateOutfit,
    deleteOutfit,
    getOutfitById,
    logWear,
  };

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = (): WardrobeContextType => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
