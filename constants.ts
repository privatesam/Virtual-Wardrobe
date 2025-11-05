
import { Piece, Outfit } from './types';

export const INITIAL_PIECES: Piece[] = [
  {
    id: 'p1',
    title: 'Blue Denim Jacket',
    brand: 'Levi\'s',
    color: 'Blue',
    size: 'M',
    season: 'All',
    style: 'Casual',
    tags: ['denim', 'jacket', 'outerwear'],
    images: ['https://picsum.photos/seed/p1/400/600'],
    wearHistory: [],
    createdAt: new Date('2023-01-15T12:00:00Z').toISOString(),
  },
  {
    id: 'p2',
    title: 'White Crewneck T-Shirt',
    brand: 'Uniqlo',
    color: 'White',
    size: 'M',
    season: 'All',
    style: 'Basics',
    tags: ['t-shirt', 'basic', 'top'],
    images: ['https://picsum.photos/seed/p2/400/600'],
    wearHistory: [],
    createdAt: new Date('2023-03-20T12:00:00Z').toISOString(),
  },
  {
    id: 'p3',
    title: 'Black Skinny Jeans',
    brand: 'Topshop',
    color: 'Black',
    size: 'W28/L32',
    season: 'All',
    style: 'Casual',
    tags: ['jeans', 'denim', 'bottoms'],
    images: ['https://picsum.photos/seed/p3/400/600'],
    wearHistory: [],
    createdAt: new Date('2023-02-10T12:00:00Z').toISOString(),
  },
   {
    id: 'p4',
    title: 'Floral Summer Dress',
    brand: 'Zara',
    color: 'Multicolor',
    size: 'S',
    season: 'Summer',
    style: 'Boho',
    tags: ['dress', 'summer', 'floral'],
    images: ['https://picsum.photos/seed/p4/400/600'],
    wearHistory: [],
    createdAt: new Date('2023-06-01T12:00:00Z').toISOString(),
  }
];

export const INITIAL_OUTFITS: Outfit[] = [
    {
        id: 'o1',
        title: 'Classic Casual',
        pieceIds: ['p1', 'p2', 'p3'],
        tags: ['everyday', 'casual', 'classic'],
        images: ['https://picsum.photos/seed/o1/600/400'],
        wearHistory: [],
        notes: 'My go-to outfit for errands.',
        createdAt: new Date('2023-04-01T12:00:00Z').toISOString(),
    }
];
