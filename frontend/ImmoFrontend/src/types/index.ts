// src/types.ts
export interface PropertyData {
    Preis_cleaned: number;
    Preis_pro_qm: number;
    Wohnfläche: number;
    Grundstücksfläche: number;
    Zimmer: number;
    Beschreibung: string;
    Latitude: number;  // Updated field name
    Longitude: number;  // Updated field name
    Vorschaubild?: string; // Preview image
    Images?: string; // Semicolon-separated list of image URLs
  }
  
  export interface MapLocation {
    lat: number;
    lng: number;
    radiusKm: number;
  }
  
  export interface DataRanges {
    price: { min: number; max: number };
    pricePerSqm: { min: number; max: number };
    livingSpace: { min: number; max: number };
    plotSize: { min: number; max: number };
    rooms: { min: number; max: number };
  }