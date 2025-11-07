
import React, { useState, useMemo } from 'react';
import { useWardrobe } from '../hooks/useWardrobe';
import { Piece, Outfit, Season } from '../types';

interface DashboardProps {
  setActiveTab: (tab: 'dashboard' | 'wardrobe' | 'outfits' | 'analytics') => void;
  onViewItem: (item: { type: 'piece' | 'outfit', id: string }) => void;
}

const PieceCard: React.FC<{ piece: Piece; onClick: () => void }> = ({ piece, onClick }) => (
  <div onClick={onClick} className="bg-secondary rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
    <img src={piece.images[0]} alt={piece.title} className="w-full h-64 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-lg text-white">{piece.title}</h3>
      <p className="text-sm text-highlight">{piece.brand}</p>
    </div>
  </div>
);

const OutfitCard: React.FC<{ outfit: Outfit; onClick: () => void }> = ({ outfit, onClick }) => (
  <div onClick={onClick} className="bg-secondary rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
    <img src={outfit.images[0]} alt={outfit.title} className="w-full h-64 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-lg text-white">{outfit.title}</h3>
      <p className="text-sm text-highlight">{outfit.pieceIds.length} pieces</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onViewItem }) => {
  const { pieces, outfits } = useWardrobe();
  const [searchTerm, setSearchTerm] = useState('');

  const getCurrentSeason = (): Season => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Autumn';
    return 'Winter';
  };

  const recentlyWornItems = useMemo(() => {
    const allWornItems = [
      ...pieces.flatMap(p => p.wearHistory.map(w => ({ ...p, wearDate: w.date, type: 'piece' }))),
      ...outfits.flatMap(o => o.wearHistory.map(w => ({ ...o, wearDate: w.date, type: 'outfit' })))
    ];
    return allWornItems.sort((a, b) => new Date(b.wearDate).getTime() - new Date(a.wearDate).getTime()).slice(0, 4);
  }, [pieces, outfits]);

  const seasonalSuggestions = useMemo(() => {
    const currentSeason = getCurrentSeason();
    const seasonalPieces = pieces.filter(p => p.season === currentSeason || p.season === 'All');
    return seasonalPieces.sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [pieces]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For simplicity, this will just switch to the relevant tab.
    // A more complex implementation could filter on the tab.
    if(searchTerm.length > 0) {
      setActiveTab('wardrobe'); 
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl font-bold text-white mb-4">Welcome Back!</h1>
        <p className="text-lg text-textdark">What are you looking for today?</p>
        <form onSubmit={handleSearch} className="mt-4 max-w-lg">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a piece, outfit, tag..."
            className="w-full p-3 bg-accent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </section>

      {recentlyWornItems.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Recently Worn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyWornItems.map(item =>
              item.type === 'piece' ? 
              <PieceCard key={`${item.id}-${item.wearDate}`} piece={item as Piece} onClick={() => onViewItem({ type: 'piece', id: item.id })} /> : 
              <OutfitCard key={`${item.id}-${item.wearDate}`} outfit={item as Outfit} onClick={() => onViewItem({ type: 'outfit', id: item.id })} />
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Seasonal Suggestions ({getCurrentSeason()})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {seasonalSuggestions.map(piece => <PieceCard key={piece.id} piece={piece} onClick={() => onViewItem({ type: 'piece', id: piece.id })} />)}
        </div>
      </section>

      {/* Analytics spotlight placeholder */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Analytics Spotlight</h2>
        <div className="bg-secondary p-6 rounded-lg">
          <p className="text-textdark">Interesting analytics coming soon! E.g., Your most worn piece last summer was...</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
