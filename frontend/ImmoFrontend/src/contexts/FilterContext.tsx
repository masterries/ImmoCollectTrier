// src/contexts/FilterContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { TRIER_COORDS, DEFAULT_RADIUS } from '../utils/geo';
import type { MapLocation } from '../types';

interface Filters {
  propertyType: string;
  priceRange: [number, number];
  pricePerSqmRange: [number, number];
  livingSpaceRange: [number, number];
  plotSizeRange: [number, number];
  roomsRange: [number, number];
  mapLocation: MapLocation;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  listingStatus: {
    active: boolean;
    closed: boolean;
  };
}

const initialState: Filters = {
  propertyType: 'all',
  priceRange: [0, 1000000],
  pricePerSqmRange: [0, 5000],
  livingSpaceRange: [0, 500],
  plotSizeRange: [0, 2000],
  roomsRange: [0, 10],
  mapLocation: {
    lat: TRIER_COORDS.lat,
    lng: TRIER_COORDS.lng,
    radiusKm: DEFAULT_RADIUS
  },
  dateRange: {
    start: null,
    end: null
  },
  listingStatus: {
    active: true,
    closed: true
  }
};

interface FilterContextType {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<Filters>(initialState);

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}