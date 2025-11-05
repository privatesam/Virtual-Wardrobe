
import React, { useState, useEffect } from 'react';
import { useWardrobe } from '../hooks/useWardrobe';
import { Piece, Season } from '../types';
import { analyzeClothingImage, fileToBase64 } from '../services/geminiService';

interface PieceFormProps {
  pieceToEdit: Piece | null;
  onDone: () => void;
}

const PieceForm: React.FC<PieceFormProps> = ({ pieceToEdit, onDone }) => {
  const { addPiece, updatePiece } = useWardrobe();
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
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    }
  }, [pieceToEdit]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
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
  
  const handleAnalyzeImage = async () => {
    if (!imageFile) {
        setError('Please select an image first.');
        return;
    }
    setIsAnalyzing(true);
    setError('');
    try {
        const base64Image = await fileToBase64(imageFile);
        const result = await analyzeClothingImage(base64Image, imageFile.type);
        if (result) {
            setFormData({
                title: result.title || '',
                brand: formData.brand, // Keep brand as it cannot be guessed
                color: result.color || '',
                size: formData.size, // Keep size
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-textdark">
      {error && <div className="bg-red-500 text-white p-3 rounded-md">{error}</div>}
      
      <div className="space-y-2">
        <label htmlFor="image" className="block font-medium">Image</label>
        <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        {images.length > 0 && <img src={images[0]} alt="Preview" className="mt-2 rounded-lg max-h-40" />}
        <button type="button" onClick={handleAnalyzeImage} disabled={isAnalyzing || !imageFile} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">
          {isAnalyzing ? 'Analyzing with AI...' : 'Analyze Image with AI'}
        </button>
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
