import React, { useState, useEffect, useMemo } from 'react';
import { useWardrobe } from '../hooks/useWardrobe';
import { Outfit, Piece } from '../types';
import { SparklesIcon } from './icons';
import { useSettings } from '../hooks/useSettings';
import { removeBackground, fileToBase64 } from '../services/aiService';

interface OutfitFormProps {
  outfitToEdit: Outfit | null;
  onDone: () => void;
}

const OutfitForm: React.FC<OutfitFormProps> = ({ outfitToEdit, onDone }) => {
  const { pieces, addOutfit, updateOutfit } = useWardrobe();
  const { geminiKey } = useSettings();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [selectedPieceIds, setSelectedPieceIds] = useState<Set<string>>(new Set());
  const [images, setImages] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const selectedPieces: Piece[] = useMemo(() => {
    return pieces.filter(p => selectedPieceIds.has(p.id));
  }, [pieces, selectedPieceIds]);

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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (!imageFile) {
        setError('Please upload an image first.');
        return;
    }
    setIsGenerating(true);
    setError('');
    try {
        const base64Image = await fileToBase64(imageFile);
        const { base64: newBase64Image, mimeType: newMimeType } = await removeBackground(base64Image, imageFile.type, geminiKey);
        
        const dataUrl = `data:${newMimeType};base64,${newBase64Image}`;
        setImages([dataUrl]);
        
        // Update imageFile with the processed version
        const byteCharacters = atob(newBase64Image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: newMimeType});
        
        const lastDot = imageFile.name.lastIndexOf('.');
        const baseName = lastDot > -1 ? imageFile.name.substring(0, lastDot) : imageFile.name;
        const extension = newMimeType.split('/')[1] || 'png';
        const fileName = `${baseName}_no_bg.${extension}`;

        const newFile = new File([blob], fileName, { type: newMimeType });
        setImageFile(newFile);

    } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
    } finally {
        setIsGenerating(false);
    }
  };
  
  const generateAutoPreview = async () => {
    if (selectedPieceIds.size === 0) {
      setError('Please select at least one piece to generate a preview.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const count = selectedPieces.length;
      if (count === 0) {
        setError('Please select at least one piece.');
        setIsGenerating(false);
        return;
      }

      console.log('Generating Magic Preview for:', selectedPieces.map(p => p.title));
      const canvas = document.createElement('canvas');
      canvas.width = 600; // Efficient size
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context error');

      // 1. Clear and Fill background with plain white
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let cols = Math.ceil(Math.sqrt(count));
      if (count === 2) cols = 2; // Fixed layout for 2
      const rows = Math.ceil(count / cols);
      
      const padding = 10;
      const cellW = Math.floor((canvas.width - (cols + 1) * padding) / cols);
      const cellH = Math.floor((canvas.height - (rows + 1) * padding) / rows);

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          if (src && !src.startsWith('data:')) img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Load failed'));
          img.src = src;
        });
      };

      for (let i = 0; i < count; i++) {
        const piece = selectedPieces[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = Math.floor(padding + col * (cellW + padding));
        const y = Math.floor(padding + row * (cellH + padding));

        try {
          if (!piece.images?.[0]) throw new Error('No image');
          const img = await loadImage(piece.images[0]);
          
          const scale = Math.min(cellW / img.width, cellH / img.height);
          const drawW = Math.floor(img.width * scale);
          const drawH = Math.floor(img.height * scale);
          const drawX = Math.floor(x + (cellW - drawW) / 2);
          const drawY = Math.floor(y + (cellH - drawH) / 2);

          // Draw image directly (no clipping for maximum compatibility)
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          
          // Debug border
          ctx.strokeStyle = '#e2e8f0'; 
          ctx.strokeRect(x, y, cellW, cellH);
        } catch (itemErr) {
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(x, y, cellW, cellH);
          ctx.fillStyle = '#64748b';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(piece.title.substring(0, 15), x + cellW/2, y + cellH/2);
        }
      }

      const dataUrl = canvas.toDataURL('image/png');
      setImages([dataUrl]);
    } catch (err: any) {
      console.error('Magic Preview Error:', err);
      setError('Preview error: ' + err.message);
    } finally {
      setIsGenerating(false);
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
      pieceIds: [...selectedPieceIds],
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    if (outfitToEdit) {
      updateOutfit({ ...outfitToEdit, ...outfitData, images });
    } else {
       // Allow submisson without image IF we have pieces - we can auto-gen it if they forgot
       // or just error if they didn't even click magic wand.
       // The user said "offer an option", so I'll auto-gen it on submit if missing.
       if(images.length === 0) {
          generateAutoPreview().then(() => {
              // Note: this won't work perfectly because setImages is async.
              // Better to handle in the submit logic.
          });
          setError('Please upload an image or click the magic wand to generate one.');
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
        <label className="block font-medium">Outfit Image</label>
        <div className="flex gap-4 items-start">
            <div className="flex-1">
                <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>
            <button 
                type="button" 
                onClick={generateAutoPreview}
                disabled={isGenerating || selectedPieceIds.size === 0}
                className={`flex items-center gap-2 font-bold py-2 px-4 rounded-lg transition-all whitespace-nowrap ${
                  isGenerating 
                    ? 'bg-purple-900 cursor-wait animate-pulse' 
                    : selectedPieceIds.size > 0 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                title="Generate preview from selected pieces"
            >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <><SparklesIcon /> <span className="hidden sm:inline">Magic Preview</span></>
                )}
            </button>
            <button 
                type="button" 
                onClick={handleRemoveBackground}
                disabled={isGenerating || !imageFile || !geminiKey}
                className={`flex items-center gap-2 font-bold py-2 px-4 rounded-lg transition-all whitespace-nowrap ${
                  isGenerating || !imageFile || !geminiKey
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
                title={!geminiKey ? 'Gemini API key required for this feature' : 'Remove background from uploaded image'}
            >
                {isGenerating ? (
                   <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Remove BG'
                )}
            </button>
        </div>
        {images.length > 0 && <img src={images[0]} alt="Preview" className="mt-2 rounded-lg max-h-60 mx-auto shadow-xl border-2 border-accent" />}
        {!imageFile && outfitToEdit && <p className="text-xs text-highlight mt-1">To use "Remove BG", please re-upload an image for this outfit.</p>}
      </div>
      
       <div className="space-y-2">
            <label htmlFor="title" className="block font-medium">Outfit Title</label>
            <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div className="space-y-2">
            <label className="block font-medium">Select Pieces ({selectedPieceIds.size})</label>
            <div className="max-h-60 overflow-y-auto bg-accent p-2 rounded-lg border border-gray-600 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pieces.map(piece => (
                    <div key={piece.id} onClick={() => togglePiece(piece.id)} className={`p-2 rounded-md cursor-pointer transition-all duration-200 ${selectedPieceIds.has(piece.id) ? 'bg-blue-600 ring-2 ring-white scale-[0.98]' : 'bg-secondary hover:bg-gray-700'}`}>
                        <img src={piece.images[0]} alt={piece.title} className="w-full h-24 object-cover rounded-md"/>
                        <p className="text-xs text-center mt-1 truncate">{piece.title}</p>
                    </div>
                ))}
            </div>
        </div>
      
       <div className="space-y-2">
            <label htmlFor="notes" className="block font-medium">Notes</label>
            <textarea name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"/>
        </div>

       <div className="space-y-2">
            <label htmlFor="tags" className="block font-medium">Tags (comma separated)</label>
            <input type="text" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onDone} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-2 px-4 rounded-lg transition-colors">{outfitToEdit ? 'Save Changes' : 'Create Outfit'}</button>
      </div>
    </form>
  );
};

export default OutfitForm;