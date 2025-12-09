export type SectorType = 'text' | 'image';

export interface Sector {
    id: string;
    type: SectorType;
    value: string; // Text content or Image URL
    color: string;
    // Image adjustment properties (relative values)
    imageScale?: number; // Default 1.0
    imageX?: number; // Offset X (0 is center)
    imageY?: number; // Offset Y (0 is center)
    imageRotation?: number; // Rotation in degrees
    percentage?: number; // Optional: for non-uniform distribution (not implemented in v1)
}

export interface Template {
    id: string;
    name: string;
    sectors: Sector[];
    timestamp: number;
}

export const DEFAULT_SECTORS: Sector[] = [
    { id: '1', type: 'text', value: 'Pizza', color: '#f87171' },
    { id: '2', type: 'text', value: 'Burger', color: '#fb923c' },
    { id: '3', type: 'text', value: 'Sushi', color: '#facc15' },
    { id: '4', type: 'text', value: 'Ramen', color: '#4ade80' },
    { id: '5', type: 'text', value: 'Curry', color: '#60a5fa' },
    { id: '6', type: 'text', value: 'Pasta', color: '#a78bfa' },
];
