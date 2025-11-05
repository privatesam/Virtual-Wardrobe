
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Piece, Outfit, WearLog } from '../types';
import { INITIAL_PIECES, INITIAL_OUTFITS } from '../constants';

interface WardrobeContextType {
  pieces: Piece[];
  outfits: Outfit[];
  // FIX: Added 'images' to Omit to correctly type the parameters for addPiece, aligning with its usage.
  addPiece: (piece: Omit<Piece, 'id' | 'wearHistory' | 'createdAt' | 'images'>, images: string[]) => void;
  updatePiece: (piece: Piece) => void;
  deletePiece: (pieceId: string) => void;
  getPieceById: (id: string) => Piece | undefined;
  // FIX: Added 'images' to Omit to correctly type the parameters for addOutfit, resolving error in OutfitForm.tsx.
  addOutfit: (outfit: Omit<Outfit, 'id' | 'wearHistory' | 'createdAt' | 'images'>, images: string[]) => void;
  updateOutfit: (outfit: Outfit) => void;
  deleteOutfit: (outfitId: string) => void;
  getOutfitById: (id: string) => Outfit | undefined;
  logWear: (itemId: string, type: 'piece' | 'outfit', notes?: string) => void;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    try {
      const storedPieces = localStorage.getItem('wardrobe_pieces');
      const storedOutfits = localStorage.getItem('wardrobe_outfits');
      if (storedPieces) {
        setPieces(JSON.parse(storedPieces));
      } else {
        setPieces(INITIAL_PIECES);
      }
      if (storedOutfits) {
        setOutfits(JSON.parse(storedOutfits));
      } else {
        setOutfits(INITIAL_OUTFITS);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setPieces(INITIAL_PIECES);
      setOutfits(INITIAL_OUTFITS);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('wardrobe_pieces', JSON.stringify(pieces));
    } catch (error) {
      console.error("Failed to save pieces to localStorage", error);
    }
  }, [pieces]);

  useEffect(() => {
    try {
      localStorage.setItem('wardrobe_outfits', JSON.stringify(outfits));
    } catch (error) {
      console.error("Failed to save outfits to localStorage", error);
    }
  }, [outfits]);

  // FIX: Updated pieceData type to match the corrected interface definition.
  const addPiece = useCallback((pieceData: Omit<Piece, 'id' | 'wearHistory' | 'createdAt' | 'images'>, images: string[]) => {
    const newPiece: Piece = {
      ...pieceData,
      id: `p${Date.now()}`,
      images,
      wearHistory: [],
      createdAt: new Date().toISOString(),
    };
    setPieces(prev => [...prev, newPiece]);
  }, []);

  const updatePiece = useCallback((updatedPiece: Piece) => {
    setPieces(prev => prev.map(p => p.id === updatedPiece.id ? updatedPiece : p));
  }, []);

  const deletePiece = useCallback((pieceId: string) => {
    setPieces(prev => prev.filter(p => p.id !== pieceId));
    // Also remove from outfits
    setOutfits(prev => prev.map(o => ({ ...o, pieceIds: o.pieceIds.filter(id => id !== pieceId) })));
  }, []);
  
  const getPieceById = useCallback((id: string) => pieces.find(p => p.id === id), [pieces]);

  // FIX: Updated outfitData type to match the corrected interface definition.
  const addOutfit = useCallback((outfitData: Omit<Outfit, 'id' | 'wearHistory' | 'createdAt' | 'images'>, images: string[]) => {
    const newOutfit: Outfit = {
      ...outfitData,
      id: `o${Date.now()}`,
      images,
      wearHistory: [],
      createdAt: new Date().toISOString(),
    };
    setOutfits(prev => [...prev, newOutfit]);
  }, []);
  
  const updateOutfit = useCallback((updatedOutfit: Outfit) => {
    setOutfits(prev => prev.map(o => o.id === updatedOutfit.id ? updatedOutfit : o));
  }, []);
  
  const deleteOutfit = useCallback((outfitId: string) => {
    setOutfits(prev => prev.filter(o => o.id !== outfitId));
  }, []);

  const getOutfitById = useCallback((id: string) => outfits.find(o => o.id === id), [outfits]);

  const logWear = useCallback((itemId: string, type: 'piece' | 'outfit', notes?: string) => {
    const newWearLog: WearLog = {
      id: `w${Date.now()}`,
      date: new Date().toISOString(),
      notes,
    };

    if (type === 'piece') {
      setPieces(prev => prev.map(p => p.id === itemId ? { ...p, wearHistory: [...p.wearHistory, newWearLog] } : p));
    } else { // outfit
      const outfit = outfits.find(o => o.id === itemId);
      if (outfit) {
        setOutfits(prev => prev.map(o => o.id === itemId ? { ...o, wearHistory: [...o.wearHistory, newWearLog] } : o));
        // Also log wear for each piece in the outfit
        setPieces(prevPieces => prevPieces.map(p => outfit.pieceIds.includes(p.id) ? { ...p, wearHistory: [...p.wearHistory, newWearLog] } : p));
      }
    }
  }, [outfits]);

  return (
    <WardrobeContext.Provider value={{ pieces, outfits, addPiece, updatePiece, deletePiece, getPieceById, addOutfit, updateOutfit, deleteOutfit, getOutfitById, logWear }}>
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