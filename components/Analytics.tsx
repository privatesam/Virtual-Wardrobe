
import React, { useMemo } from 'react';
import { useWardrobe } from '../hooks/useWardrobe';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Piece, Outfit } from '../types';

const Analytics: React.FC = () => {
    const { pieces, outfits } = useWardrobe();

    const wearDataByMonth = useMemo(() => {
        const monthMap = Array(12).fill(0).map((_, i) => ({
            name: new Date(0, i).toLocaleString('default', { month: 'short' }),
            wears: 0
        }));

        [...pieces, ...outfits].forEach(item => {
            item.wearHistory.forEach(wear => {
                const month = new Date(wear.date).getMonth();
                monthMap[month].wears++;
            });
        });

        return monthMap;
    }, [pieces, outfits]);
    
    const totalWears = useMemo(() => {
        return pieces.reduce((sum, p) => sum + p.wearHistory.length, 0);
    }, [pieces]);

    const mostWornPiece = useMemo<Piece | null>(() => {
        if (pieces.length === 0) return null;
        return [...pieces].sort((a, b) => b.wearHistory.length - a.wearHistory.length)[0];
    }, [pieces]);

    const mostWornOutfit = useMemo<Outfit | null>(() => {
        if (outfits.length === 0) return null;
        return [...outfits].sort((a, b) => b.wearHistory.length - a.wearHistory.length)[0];
    }, [outfits]);


    return (
        <div className="space-y-8 text-white">
            <h1 className="text-3xl font-bold">Wear Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-highlight text-sm font-semibold">Total Pieces</h3>
                    <p className="text-3xl font-bold">{pieces.length}</p>
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-highlight text-sm font-semibold">Total Outfits</h3>
                    <p className="text-3xl font-bold">{outfits.length}</p>
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-highlight text-sm font-semibold">Total Wears Logged</h3>
                    <p className="text-3xl font-bold">{totalWears}</p>
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-highlight text-sm font-semibold">Cost Per Wear (Avg)</h3>
                    <p className="text-3xl font-bold">N/A</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Most Worn Piece</h2>
                    {mostWornPiece ? (
                        <div className="flex items-center gap-4">
                            <img src={mostWornPiece.images[0]} alt={mostWornPiece.title} className="w-24 h-24 object-cover rounded-md" />
                            <div>
                                <p className="font-bold">{mostWornPiece.title}</p>
                                <p className="text-highlight">{mostWornPiece.wearHistory.length} wears</p>
                            </div>
                        </div>
                    ) : <p className="text-highlight">No pieces worn yet.</p>}
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Most Worn Outfit</h2>
                     {mostWornOutfit ? (
                        <div className="flex items-center gap-4">
                            <img src={mostWornOutfit.images[0]} alt={mostWornOutfit.title} className="w-24 h-24 object-cover rounded-md" />
                            <div>
                                <p className="font-bold">{mostWornOutfit.title}</p>
                                <p className="text-highlight">{mostWornOutfit.wearHistory.length} wears</p>
                            </div>
                        </div>
                    ) : <p className="text-highlight">No outfits worn yet.</p>}
                </div>
            </div>

            <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Wears Per Month</h2>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={wearDataByMonth}
                            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="name" tick={{ fill: '#a0aec0' }} />
                            <YAxis tick={{ fill: '#a0aec0' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}
                                labelStyle={{ color: '#f7fafc' }}
                            />
                            <Legend wrapperStyle={{ color: '#f7fafc' }} />
                            <Bar dataKey="wears" fill="#4299e1" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
