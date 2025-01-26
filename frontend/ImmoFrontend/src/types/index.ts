// src/types.ts
export interface PropertyData {
  Link: string;
  Preis_cleaned: number;
  Beschreibung?: string;
  Details?: string;
  Adresse?: string;
  Features?: string;
  Vollständige_Adresse?: string;
  Latitude: number;
  Longitude: number;
  created_date?: string;
  closed_date?: string;
  Wohnfläche?: number;
  Grundstücksfläche?: number;
  Zimmer?: number;
  Preis_pro_qm?: number;
  Vorschaubild?: string | null;
  Images?: string | null;
  allImages?: string[];
}

export interface DataRanges {
  price: { min: number; max: number };
  pricePerSqm: { min: number; max: number };
  livingSpace: { min: number; max: number };
  plotSize: { min: number; max: number };
  rooms: { min: number; max: number };
}

  export interface MapLocation {
    lat: number;
    lng: number;
    radiusKm: number;
  }
  
