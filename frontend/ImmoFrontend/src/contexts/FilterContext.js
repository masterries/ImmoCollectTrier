import { jsx as _jsx } from "react/jsx-runtime";
// src/contexts/FilterContext.tsx
import { createContext, useContext, useState } from 'react';
import { TRIER_COORDS, DEFAULT_RADIUS } from '../utils/geo';
const initialState = {
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
const FilterContext = createContext(undefined);
export function FilterProvider({ children }) {
    const [filters, setFilters] = useState(initialState);
    return (_jsx(FilterContext.Provider, { value: { filters, setFilters }, children: children }));
}
export function useFilters() {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
}
