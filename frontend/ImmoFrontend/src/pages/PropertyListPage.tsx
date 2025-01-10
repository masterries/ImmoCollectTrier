// src/pages/PropertyListPage.tsx
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilters } from '../contexts/FilterContext';
import Layout from '../components/Layout';
import PropertyFilters from '../components/PropertyFilters';
import PropertyList from '../components/PropertyList';

interface Props {
  data: any[];
}

const PropertyListPage: React.FC<Props> = ({ data }) => {
  const { filters, setFilters } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Add non-default filters to URL
    if (filters.propertyType !== 'all') {
      params.set('type', filters.propertyType);
    }
    
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000000) {
      params.set('priceMin', filters.priceRange[0].toString());
      params.set('priceMax', filters.priceRange[1].toString());
    }
    
    if (filters.dateRange.start) {
      params.set('dateStart', filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      params.set('dateEnd', filters.dateRange.end);
    }
    
    if (!filters.listingStatus.active !== !filters.listingStatus.closed) {
      params.set('status', filters.listingStatus.active ? 'active' : 'closed');
    }
    
    if (filters.mapLocation.lat !== 49.7592 || 
        filters.mapLocation.lng !== 6.6417 || 
        filters.mapLocation.radiusKm !== 50) {
      params.set('lat', filters.mapLocation.lat.toString());
      params.set('lng', filters.mapLocation.lng.toString());
      params.set('radius', filters.mapLocation.radiusKm.toString());
    }
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Initialize filters from URL on load
  useEffect(() => {
    const type = searchParams.get('type');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');
    const status = searchParams.get('status');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

    setFilters(prev => ({
      ...prev,
      propertyType: type || 'all',
      priceRange: [
        priceMin ? parseInt(priceMin) : prev.priceRange[0],
        priceMax ? parseInt(priceMax) : prev.priceRange[1]
      ],
      dateRange: {
        start: dateStart || null,
        end: dateEnd || null
      },
      listingStatus: status ? {
        active: status === 'active',
        closed: status === 'closed'
      } : prev.listingStatus,
      mapLocation: {
        lat: lat ? parseFloat(lat) : prev.mapLocation.lat,
        lng: lng ? parseFloat(lng) : prev.mapLocation.lng,
        radiusKm: radius ? parseFloat(radius) : prev.mapLocation.radiusKm
      }
    }));
  }, [searchParams, setFilters]);

  return (
    <Layout>
      <div className="space-y-8">
        <PropertyFilters propertyTypes={[...new Set(data.map(item => item.Beschreibung?.split(' ')[0]))]} ranges={{
          price: { min: 0, max: 1000000 },
          pricePerSqm: { min: 0, max: 5000 },
          livingSpace: { min: 0, max: 500 },
          plotSize: { min: 0, max: 2000 },
          rooms: { min: 0, max: 10 }
        }} />
        <PropertyList data={data} />
      </div>
    </Layout>
  );
};

export default PropertyListPage;