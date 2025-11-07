import React, { useState, useMemo, useEffect } from 'react';
import { useWardrobe } from '../hooks/useWardrobe';
import { Outfit, WearLog, Piece } from '../types';
import Modal from './Modal';
import OutfitForm from './OutfitForm';
import { PlusIcon } from './icons';

const OutfitCard: React.FC<{ outfit: Outfit; onSelect: () => void }> = ({ outfit, onSelect }) => (
    <div
      className="bg-secondary rounded-lg overflow-hidden shadow-lg cursor-pointer group"
      onClick={onSelect}
    >
      <div className="relative">
        <img src={outfit.images[0]} alt={outfit.title} className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-opacity duration-300"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="font-bold text-xl text-white drop-shadow-md">{outfit.title}</h3>
          <p className="text-sm text-textdark drop-shadow-md">{outfit.pieceIds.length} Pieces</p>
        </div>
      </div>
    </div>
);

const OutfitDetail: React.FC<{ outfit: Outfit; onClose: () => void; onEdit: () => void; }> = ({ outfit, onClose, onEdit }) => {
    const { logWear, getPieceById, deleteOutfit } = useWardrobe();
    const outfitPieces = useMemo(() => outfit.pieceIds.map(id => getPieceById(id)).filter((p): p is Piece => p !== undefined), [outfit.pieceIds, getPieceById]);
    const [isWornToday, setIsWornToday] = useState(false);

    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to delete "${outfit.title}"?`)){
            deleteOutfit(outfit.id);
            onClose();
        }
    }

    const handleWearToday = () => {
        logWear(outfit.id, 'outfit');
        setIsWornToday(true);
        setTimeout(() => {
            setIsWornToday(false);
        }, 2000);
    };

    return (
        <div className="text-textdark">
            <img src={outfit.images[0]} alt={outfit.title} className="w-full h-auto object-cover rounded-lg mb-6" />
            
            <div className="space-y-4">
                 <div>
                    <p className="text-sm text-highlight">Notes</p>
                    <p>{outfit.notes || 'No notes for this outfit.'}</p>
                </div>
                 <div>
                    <p className="text-sm text-highlight">Tags</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {outfit.tags.map(tag => <span key={tag} className="bg-accent text-xs px-2 py-1 rounded-full">{tag}</span>)}
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h4 className="text-lg font-bold mb-2">Pieces in this Outfit</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {outfitPieces.map(piece => (
                        <div key={piece.id} className="text-center">
                            <img src={piece.images[0]} alt={piece.title} className="w-full h-32 object-cover rounded-md" />
                            <p className="text-xs mt-1">{piece.title}</p>
                        </div>
                    ))}
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
                <h4 className="text-lg font-bold mb-2">Wear History ({outfit.wearHistory.length})</h4>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {outfit.wearHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log: WearLog) => (
                        <li key={log.id} className="bg-accent p-2 rounded-md text-sm">{new Date(log.date).toLocaleDateString()}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

interface OutfitsProps {
    initialOutfitId?: string;
    onClearInitialItem: () => void;
}

const Outfits: React.FC<OutfitsProps> = ({ initialOutfitId, onClearInitialItem }) => {
    const { outfits, getOutfitById } = useWardrobe();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);

     useEffect(() => {
        if (initialOutfitId) {
            const outfitToView = getOutfitById(initialOutfitId);
            if (outfitToView) {
                setSelectedOutfit(outfitToView);
            }
            onClearInitialItem();
        }
    }, [initialOutfitId, getOutfitById, onClearInitialItem]);

    const filteredOutfits = useMemo(() => {
        return outfits.filter(outfit =>
            outfit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            outfit.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [outfits, searchTerm]);

    const handleOpenForm = (outfit: Outfit | null) => {
        setEditingOutfit(outfit);
        setIsFormOpen(true);
        setSelectedOutfit(null);
    }
    
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingOutfit(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-white">My Outfits</h1>
                <div className="flex gap-4 w-full sm:w-auto">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search outfits..."
                        className="w-full sm:w-64 p-2 bg-accent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     <button 
                        onClick={() => handleOpenForm(null)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        <PlusIcon /> <span className="hidden sm:inline">New Outfit</span>
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredOutfits.map(outfit => (
                    <OutfitCard key={outfit.id} outfit={outfit} onSelect={() => setSelectedOutfit(outfit)} />
                ))}
            </div>

            {selectedOutfit && (
                <Modal isOpen={!!selectedOutfit} onClose={() => setSelectedOutfit(null)} title={selectedOutfit.title}>
                    <OutfitDetail outfit={selectedOutfit} onClose={() => setSelectedOutfit(null)} onEdit={() => handleOpenForm(selectedOutfit)} />
                </Modal>
            )}

            <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingOutfit ? 'Edit Outfit' : 'Create New Outfit'}>
                <OutfitForm outfitToEdit={editingOutfit} onDone={handleCloseForm} />
            </Modal>
        </div>
    );
};

export default Outfits;