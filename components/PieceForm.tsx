import React, { useState, useEffect } from 'react';
import { useWardrobe } from '../hooks/useWardrobe';
import { Piece, Season } from '../types';
import { useSettings } from '../hooks/useSettings';
import { analyzeImage, fileToBase64, removeBackground } from '../services/aiService';


interface PieceFormProps {
  pieceToEdit: Piece | null;
  onDone: () => void;
}

const PieceForm: React.FC<PieceFormProps> = ({ pieceToEdit, onDone }) => {
  const { addPiece, updatePiece } = useWardrobe();
  const { apiKey, apiProvider } = useSettings();
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    color: '',
    size: '',
    season: 'All' as Season,
    style: '',
    tags: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pieceToEdit) {
      setFormData({
        title: pieceToEdit.title,
        brand: pieceToEdit.brand,
        color: pieceToEdit.color,
        size: pieceToEdit.size,
        season: pieceToEdit.season,
        style: pieceToEdit.style,
        tags: pieceToEdit.tags.join(', '),
      });
      setImages(pieceToEdit.images);
      setImageFiles([]); // Clear file objects as they can't be reconstructed from URLs
    }
  }, [pieceToEdit]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(filesArray);
      
      const filePromises = filesArray.map(file => {
        return new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(newImages => {
        setImages(newImages);
      });
    }
  };

  const handleSetPrimary = (indexToMakePrimary: number) => {
    if (indexToMakePrimary === 0) return;

    setImages(currentImages => {
        const newImages = [...currentImages];
        const [item] = newImages.splice(indexToMakePrimary, 1);
        newImages.unshift(item);
        return newImages;
    });

    setImageFiles(currentFiles => {
        const newFiles = [...currentFiles];
        const [item] = newFiles.splice(indexToMakePrimary, 1);
        newFiles.unshift(item);
        return newFiles;
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(currentImages => currentImages.filter((_, index) => index !== indexToRemove));
    setImageFiles(currentFiles => currentFiles.filter((_, index) => index !== indexToRemove));
  };
  
  const handleAnalyzeImage = async () => {
    if (imageFiles.length === 0) {
        setError('Please upload a new image first.');
        return;
    }
    if (!apiKey) {
        setError('API Key not found. Please add it in the Admin Settings tab.');
        return;
    }
    setIsAnalyzing(true);
    setError('');
    try {
        const primaryImageFile = imageFiles[0];
        const base64Image = await fileToBase64(primaryImageFile);
        const result = await analyzeImage(apiKey, apiProvider, base64Image, primaryImageFile.type);
        if (result) {
            setFormData({
                title: result.title || '',
                brand: formData.brand,
                color: result.color || '',
                size: formData.size,
                season: (result.season as Season) || 'All',
                style: result.style || '',
                tags: (result.tags || []).join(', '),
            });
        }
    } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (imageFiles.length === 0) {
        setError('Please upload a new image first.');
        return;
    }
     if (!apiKey) {
        setError('API Key not found. Please add it in the Admin Settings tab.');
        return;
    }
    setIsAnalyzing(true);
    setError('');
    try {
        const primaryImageFile = imageFiles[0];
        const base64Image = await fileToBase64(primaryImageFile);
        const { base64: newBase64Image, mimeType: newMimeType } = await removeBackground(apiKey, apiProvider, base64Image, primaryImageFile.type);
        
        const dataUrl = `data:${newMimeType};base64,${newBase64Image}`;
        setImages(currentImages => [dataUrl, ...currentImages.slice(1)]);
        
        // FIX: Manually converting the base64 string to a Blob to avoid potential type inference issues with `fetch` on data URLs, which can lead to an 'unknown' type error when creating a new File.
        const byteCharacters = atob(newBase64Image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: newMimeType});
        
        const lastDot = primaryImageFile.name.lastIndexOf('.');
        const baseName = lastDot > -1 ? primaryImageFile.name.substring(0, lastDot) : primaryImageFile.name;
        const extension = newMimeType.split('/')[1] || 'png';
        const fileName = `${baseName}.${extension}`;

        const newFile = new File([blob], fileName, { type: newMimeType });
        setImageFiles(currentFiles => [newFile, ...currentFiles.slice(1)]);

    } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
        setError('Title is required.');
        return;
    }

    const pieceData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    if (pieceToEdit) {
      updatePiece({ ...pieceToEdit, ...pieceData, images });
    } else {
      if(images.length === 0) {
        setError('An image is required.');
        return;
      }
      addPiece(pieceData, images);
    }
    onDone();
  };

  const isRemoveBgDisabled = isAnalyzing || imageFiles.length === 0 || apiProvider !== 'gemini';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-textdark">
      {error && <div className="bg-red-500 text-white p-3 rounded-md">{error}</div>}
      
      <div className="space-y-2">
        <label htmlFor="image" className="block font-medium">Images</label>
        <input type="file" id="image" accept="image/*" multiple onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        {images.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-highlight mb-2">Click an image to set it as the main thumbnail.</p>
            <div className="flex flex-wrap gap-2">
              {images.map((imgSrc, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imgSrc}
                    alt={`Preview ${index + 1}`}
                    className={`w-24 h-24 object-cover rounded-lg cursor-pointer border-2 ${index === 0 ? 'border-blue-500' : 'border-transparent hover:border-gray-500'}`}
                    onClick={() => handleSetPrimary(index)}
                  />
                  {index === 0 && <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">Main</span>}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <button type="button" onClick={handleAnalyzeImage} disabled={isAnalyzing || imageFiles.length === 0} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">
              {isAnalyzing ? 'Processing...' : 'Analyze Details'}
            </button>
            <button type="button" onClick={handleRemoveBackground} disabled={isRemoveBgDisabled} title={apiProvider !== 'gemini' ? 'Only available with Gemini provider' : ''} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
              {isAnalyzing ? 'Processing...' : 'Remove Background'}
            </button>
        </div>
         {imageFiles.length === 0 && pieceToEdit && <p className="text-xs text-highlight mt-1">To use AI tools, please re-upload images for this item.</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label htmlFor="title" className="block font-medium">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div className="space-y-2">
            <label htmlFor="brand" className="block font-medium">Brand</label>
            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div className="space-y-2">
            <label htmlFor="color" className="block font-medium">Color</label>
            <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div className="space-y-2">
            <label htmlFor="size" className="block font-medium">Size</label>
            <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div className="space-y-2">
            <label htmlFor="season" className="block font-medium">Season</label>
            <select name="season" value={formData.season} onChange={handleChange} className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All</option>
                <option>Spring</option>
                <option>Summer</option>
                <option>Autumn</option>
                <option>Winter</option>
            </select>
        </div>
        <div className="space-y-2">
            <label htmlFor="style" className="block font-medium">Style</label>
            <input type="text" name="style" value={formData.style} onChange={handleChange} className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
      </div>
      
       <div className="space-y-2">
            <label htmlFor="tags" className="block font-medium">Tags (comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full p-2 bg-accent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onDone} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">{pieceToEdit ? 'Save Changes' : 'Add Piece'}</button>
      </div>
    </form>
  );
};

export default PieceForm;
