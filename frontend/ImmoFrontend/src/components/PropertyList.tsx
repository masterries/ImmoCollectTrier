// src/components/PropertyList.tsx
import React from 'react';
import { useFilters } from '../contexts/FilterContext';
import { Card } from "@/components/ui/card";
import { Home, Euro, Calendar } from 'lucide-react';
import type { PropertyData } from '../types';
import { calculateDistance } from '../utils/geo';

interface Props {
  data: PropertyData[];
}

const PropertyList = ({ data }: Props) => {
  const { filters } = useFilters();

  const filteredData = data.filter(item => {
    // Apply all existing filters (same logic as in HousingAnalytics)
    if (filters.propertyType !== 'all' && !item.Beschreibung?.startsWith(filters.propertyType)) {
      return false;
    }
    if (item.Preis_cleaned < filters.priceRange[0] || item.Preis_cleaned > filters.priceRange[1]) {
      return false;
    }
    if (item.Preis_pro_qm < filters.pricePerSqmRange[0] || item.Preis_pro_qm > filters.pricePerSqmRange[1]) {
      return false;
    }
    if (item.Wohnfläche && (item.Wohnfläche < filters.livingSpaceRange[0] || item.Wohnfläche > filters.livingSpaceRange[1])) {
      return false;
    }
    if (item.Grundstücksfläche && (item.Grundstücksfläche < filters.plotSizeRange[0] || item.Grundstücksfläche > filters.plotSizeRange[1])) {
      return false;
    }
    if (item.Zimmer && (item.Zimmer < filters.roomsRange[0] || item.Zimmer > filters.roomsRange[1])) {
      return false;
    }

    // Apply geo filter
    if (filters.mapLocation && item.Latitude && item.Longitude) {
      const distance = calculateDistance(
        filters.mapLocation.lat,
        filters.mapLocation.lng,
        item.Latitude,
        item.Longitude
      );
      if (distance > filters.mapLocation.radiusKm) {
        return false;
      }
    }

    // Apply listing status filter
    const hasClosedDate = !!item.closed_date;
    if (!filters.listingStatus.active && !filters.listingStatus.closed) {
      return false;
    }
    if (!filters.listingStatus.active && !hasClosedDate) {
      return false;
    }
    if (!filters.listingStatus.closed && hasClosedDate) {
      return false;
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      if (filters.listingStatus.active && filters.listingStatus.closed) {
        const itemCreatedDate = new Date(item.created_date);
        const itemClosedDate = item.closed_date ? new Date(item.closed_date) : null;
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (itemClosedDate) {
            if (itemClosedDate < startDate) return false;
          } else {
            if (itemCreatedDate < startDate) return false;
          }
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          if (itemClosedDate) {
            if (itemClosedDate > endDate) return false;
          } else {
            if (itemCreatedDate > endDate) return false;
          }
        }
      } else if (filters.listingStatus.closed && hasClosedDate) {
        const itemClosedDate = new Date(item.closed_date);
        if (filters.dateRange.start && itemClosedDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && itemClosedDate > new Date(filters.dateRange.end)) return false;
      } else if (filters.listingStatus.active && !hasClosedDate) {
        const itemCreatedDate = new Date(item.created_date);
        if (filters.dateRange.start && itemCreatedDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && itemCreatedDate > new Date(filters.dateRange.end)) return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {filteredData.map((property, index) => (
        <Card key={index} className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{property.Beschreibung}</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-gray-600">
                  <Home className="w-4 h-4 mr-2" />
                  <span>{property.Wohnfläche}m² • {property.Zimmer} Rooms</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Euro className="w-4 h-4 mr-2" />
                  <span>{property.Preis_cleaned.toLocaleString('de-DE')}€ ({property.Preis_pro_qm}€/m²)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Listed: {new Date(property.created_date).toLocaleDateString()}</span>
                  {property.closed_date && (
                    <span className="ml-2">• Closed: {new Date(property.closed_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              {property.Features && (
                <p className="mt-2 text-sm text-gray-500">{property.Features}</p>
              )}
            </div>
            <div className="flex-shrink-0 flex flex-col justify-between">
              <a
                href={property.Link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                View Details
              </a>
            </div>
          </div>
        </Card>
      ))}
      
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No properties match your current filters.
        </div>
      )}
    </div>
  );
};

export default PropertyList;