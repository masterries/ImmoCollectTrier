import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useFilters } from '../contexts/FilterContext';
import { calculateDistance } from '../utils/geo';
import type { PropertyData } from '../types';

interface Props {
  data: PropertyData[];
}

const HousingAnalytics = ({ data }: Props) => {
  const { filters } = useFilters();

  const filteredData = data.filter(item => {
    // First apply existing filters
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

    // Apply geo filter if location is set
    // Apply geo filter if location is set
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
      return false; // No status selected, show nothing
    }
    if (!filters.listingStatus.active && !hasClosedDate) {
      return false; // Active listings not selected, and this is an active listing
    }
    if (!filters.listingStatus.closed && hasClosedDate) {
      return false; // Closed listings not selected, and this is a closed listing
    }

    // Apply date range filter based on listing status and selected dates
    if (filters.dateRange.start || filters.dateRange.end) {
      // If both statuses are selected, apply date filter to both created and closed dates
      if (filters.listingStatus.active && filters.listingStatus.closed) {
        const itemCreatedDate = new Date(item.created_date);
        const itemClosedDate = item.closed_date ? new Date(item.closed_date) : null;
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (itemClosedDate) {
            // For closed listings, check if closed date is after start date
            if (itemClosedDate < startDate) return false;
          } else {
            // For active listings, check if created date is after start date
            if (itemCreatedDate < startDate) return false;
          }
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          if (itemClosedDate) {
            // For closed listings, check if closed date is before end date
            if (itemClosedDate > endDate) return false;
          } else {
            // For active listings, check if created date is before end date
            if (itemCreatedDate > endDate) return false;
          }
        }
      }
      // If only closed listings are selected, filter by closed date
      else if (filters.listingStatus.closed && hasClosedDate) {
        const itemClosedDate = new Date(item.closed_date);
        
        if (filters.dateRange.start && itemClosedDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && itemClosedDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }
      // If only active listings are selected, filter by created date
      else if (filters.listingStatus.active && !hasClosedDate) {
        const itemCreatedDate = new Date(item.created_date);
        
        if (filters.dateRange.start && itemCreatedDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && itemCreatedDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }
    }

    return true;
  });

  // Rest of the component remains the same...
  const getPriceRanges = () => {
    if (!filteredData.length) return [];
    
    const min = Math.min(...filteredData.map(d => d.Preis_cleaned));
    const max = Math.max(...filteredData.map(d => d.Preis_cleaned));
    const step = (max - min) / 10;
    
    const ranges = Array.from({ length: 10 }, (_, i) => ({
      range: `${Math.round((min + step * i) / 1000)}k-${Math.round((min + step * (i + 1)) / 1000)}k`,
      count: 0
    }));
    
    filteredData.forEach(item => {
      if (item.Preis_cleaned !== undefined && item.Preis_cleaned !== null) {
        const index = Math.min(
          Math.floor((item.Preis_cleaned - min) / step),
          9
        );
        if (index >= 0 && index < ranges.length) {
          ranges[index].count = (ranges[index].count || 0) + 1;
        }
      }
    });
    
    return ranges;
  };

  const priceStats = {
    avg: filteredData.reduce((acc, curr) => acc + curr.Preis_cleaned, 0) / filteredData.length,
    avgPerSqm: filteredData.reduce((acc, curr) => acc + (curr.Preis_pro_qm || 0), 0) / filteredData.length,
    count: filteredData.length
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-700">Listed Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{priceStats.count}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-700">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {priceStats.avg.toLocaleString('de-DE', { 
                style: 'currency', 
                currency: 'EUR',
                maximumFractionDigits: 0
              })}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-700">Avg. Price per m²</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {priceStats.avgPerSqm.toLocaleString('de-DE', { 
                style: 'currency', 
                currency: 'EUR',
                maximumFractionDigits: 0
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-700">Price Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getPriceRanges()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HousingAnalytics;