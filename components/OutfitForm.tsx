import React, { useState, useEffect } from 'react';
import { useWardrobe } from '../hooks/useWardrobe';
import { Outfit } from '../types';

interface OutfitFormProps {
  outfitToEdit: Outfit | null;
  onDone: () => void;
}

const OutfitForm: React.FC<OutfitFormProps> = ({ outfitToEdit, onDone }) => {
  const { pieces, addOutfit, updateOutfit } = useWardrobe();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [selectedPieceIds, setSelectedPieceIds] = useState<Set<string>>(new Set());
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (outfitToEdit) {
      setTitle(outfitToEdit.title);
      setNotes(outfitToEdit.notes || '');
      setTags(outfitToEdit.tags.join(', '));
      setSelectedPieceIds(new Set(outfitToEdit.pieceIds));
      setImages(outfitToEdit.images);
    }
  }, [outfitToEdit]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const togglePiece = (pieceId: string) => {
    setSelectedPieceIds(prev => {
        const newSet = new Set(prev);
        if(newSet.has(pieceId)) {
            newSet.delete(pieceId);
        } else {
            newSet.add(pieceId);
        }
        return newSet;
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || selectedPieceIds.size === 0) {
        setError('Title and at least one piece are required.');
        return;
    }
    
    const outfitData = {
      title,
      notes,
      // FIX: Changed from Array.from to spread syntax to ensure correct type inference for pieceIds from Set<string> to string[].
      pieceIds: [...selectedPieceIds],
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    if (outfitToEdit) {
      updateOutfit({ ...outfitToEdit, ...outfitData, images });
    } else {
       if(images.length === 0) {
        setError('An image is required.');
        return;
      }
      addOutfit(outfitData, images);
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-textdark">
      {error && <div className="bg-red-500 text-white p-3 rounded-md">{error}</div>}
      
      <div className="space-y-2">
        <label htmlFor="image" className="block font-medium">Outfit Image</label>
        <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        {images.length > 0 && <img src={images[0]} alt="Preview" className="mt-2 rounded-lg max-h-40" />}
      </div>
      
       <div className="space-y-2">
            <label htmlFor="title" className="block font-medium">Outfit Title</label>
            <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div className="space-y-2">
            <label className="block font-medium">Select Pieces</label>
            <div className="max-h-60 overflow-y-auto bg-accent p-2 rounded-lg border border-gray-600 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pieces.map(piece => (
                    <div key={piece.id} onClick={() => togglePiece(piece.id)} className={`p-2 rounded-md cursor-pointer ${selectedPieceIds.has(piece.id) ? 'bg-blue-600' : 'bg-secondary'}`}>
                        <img src={piece.images[0]} alt={piece.title} className="w-full h-24 object-cover rounded-md"/>
                        <p className="text-xs text-center mt-1 truncate">{piece.title}</p>
                    </div>
                ))}
            </div>
        </div>
      
       <div className="space-y-2">
            <label htmlFor="notes" className="block font-medium">Notes</label>
            <input type="text" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

       <div className="space-y-2">
            <label htmlFor="tags" className="block font-medium">Tags (comma separated)</label>
            <input type="text" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onDone} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">{outfitToEdit ? 'Save Changes' : 'Create Outfit'}</button>
      </div>
    </form>
  );
};

export default OutfitForm;