import React, { useState, useMemo, useEffect } from 'react';
import { useWardrobe } from '../hooks/useWardrobe';
import { Piece, WearLog } from '../types';
import Modal from './Modal';
import PieceForm from './PieceForm';
import { PlusIcon } from './icons';

const PieceCard: React.FC<{ piece: Piece; onSelect: () => void }> = ({ piece, onSelect }) => (
    <div
      className="bg-secondary rounded-lg overflow-hidden shadow-lg cursor-pointer group"
      onClick={onSelect}
    >
      <div className="relative">
        <img src={piece.images[0]} alt={piece.title} className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-opacity duration-300"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="font-bold text-xl text-white drop-shadow-md">{piece.title}</h3>
          <p className="text-sm text-textdark drop-shadow-md">{piece.brand}</p>
        </div>
      </div>
    </div>
);

const PieceDetail: React.FC<{ piece: Piece; onClose: () => void; onEdit: () => void; }> = ({ piece, onClose, onEdit }) => {
    const { logWear, deletePiece } = useWardrobe();
    const [mainImage, setMainImage] = useState(piece.images[0]);
    const [isWornToday, setIsWornToday] = useState(false);

    useEffect(() => {
        setMainImage(piece.images[0]);
    }, [piece]);
    
    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to delete "${piece.title}"?`)){
            deletePiece(piece.id);
            onClose();
        }
    }
    
    const handleWearToday = () => {
        logWear(piece.id, 'piece');
        setIsWornToday(true);
        setTimeout(() => {
            setIsWornToday(false);
        }, 2000);
    };


    return (
        <div className="text-textdark">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img src={mainImage} alt={piece.title} className="w-full h-auto object-cover rounded-lg" />
                    {piece.images.length > 1 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {piece.images.map((img, index) => (
                                <img 
                                    key={index}
                                    src={img}
                                    alt={`${piece.title} thumbnail ${index + 1}`}
                                    className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 ${img === mainImage ? 'border-blue-500' : 'border-transparent'}`}
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-highlight">Brand</p>
                        <p>{piece.brand}</p>
                    </div>
                    <div>
                        <p className="text-sm text-highlight">Color</p>
                        <p>{piece.color}</p>
                    </div>
                    <div>
                        <p className="text-sm text-highlight">Size</p>
                        <p>{piece.size}</p>
                    </div>
                    <div>
                        <p className="text-sm text-highlight">Season</p>
                        <p>{piece.season}</p>
                    </div>
                     <div>
                        <p className="text-sm text-highlight">Style</p>
                        <p>{piece.style}</p>
                    </div>
                    <div>
                        <p className="text-sm text-highlight">Tags</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {piece.tags.map(tag => <span key={tag} className="bg-accent text-xs px-2 py-1 rounded-full">{tag}</span>)}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 flex gap-4">
                <button
                    onClick={handleWearToday}
                    disabled={isWornToday}
                    className={`text-white font-bold py-2 px-4 rounded-lg transition-colors ${isWornToday ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isWornToday ? 'Logged!' : 'Wear Today'}
                </button>
                <button onClick={onEdit} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Edit</button>
                <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Delete</button>
            </div>
            
            <div className="mt-6">
                <h4 className="text-lg font-bold mb-2">Wear History ({piece.wearHistory.length})</h4>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {piece.wearHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log: WearLog) => (
                        <li key={log.id} className="bg-accent p-2 rounded-md text-sm">{new Date(log.date).toLocaleDateString()}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

interface WardrobeProps {
    initialPieceId?: string;
    onClearInitialItem: () => void;
}

const Wardrobe: React.FC<WardrobeProps> = ({ initialPieceId, onClearInitialItem }) => {
    const { pieces, getPieceById } = useWardrobe();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPiece, setEditingPiece] = useState<Piece | null>(null);

    useEffect(() => {
        if (initialPieceId) {
            const pieceToView = getPieceById(initialPieceId);
            if (pieceToView) {
                setSelectedPiece(pieceToView);
            }
            onClearInitialItem();
        }
    }, [initialPieceId, getPieceById, onClearInitialItem]);

    const filteredPieces = useMemo(() => {
        return pieces.filter(piece =>
            piece.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            piece.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            piece.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [pieces, searchTerm]);

    const handleOpenForm = (piece: Piece | null) => {
        setEditingPiece(piece);
        setIsFormOpen(true);
        setSelectedPiece(null);
    }
    
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingPiece(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-white">My Wardrobe</h1>
                <div className="flex gap-4 w-full sm:w-auto">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search wardrobe..."
                        className="w-full sm:w-64 p-2 bg-accent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={() => handleOpenForm(null)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        <PlusIcon /> <span className="hidden sm:inline">Add Piece</span>
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPieces.map(piece => (
                    <PieceCard key={piece.id} piece={piece} onSelect={() => setSelectedPiece(piece)} />
                ))}
            </div>

            {selectedPiece && (
                <Modal isOpen={!!selectedPiece} onClose={() => setSelectedPiece(null)} title={selectedPiece.title}>
                    <PieceDetail piece={selectedPiece} onClose={() => setSelectedPiece(null)} onEdit={() => handleOpenForm(selectedPiece)}/>
                </Modal>
            )}

            <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingPiece ? 'Edit Piece' : 'Add New Piece'}>
                <PieceForm pieceToEdit={editingPiece} onDone={handleCloseForm} />
            </Modal>
        </div>
    );
};

export default Wardrobe;