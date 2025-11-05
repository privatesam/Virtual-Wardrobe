
export interface WearLog {
  id: string;
  date: string; // ISO string
  notes?: string;
}

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'All';

export interface Piece {
  id: string;
  title: string;
  color: string;
  brand: string;
  size: string;
  season: Season;
  style: string;
  tags: string[];
  images: string[]; // URLs or base64 strings, first is the main image
  wearHistory: WearLog[];
  createdAt: string; // ISO string
}

export interface Outfit {
  id: string;
  title: string;
  pieceIds: string[];
  tags: string[];
  images: string[]; // URLs or base64 strings
  wearHistory: WearLog[];
  notes?: string;
  createdAt: string; // ISO string
}
