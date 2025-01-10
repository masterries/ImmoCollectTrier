// src/components/ListingStatusFilter.tsx
import React from 'react';
import { useFilters } from '../contexts/FilterContext';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function ListingStatusFilter() {
  const { filters, setFilters } = useFilters();

  const handleStatusChange = (status: 'active' | 'closed') => (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      listingStatus: {
        ...prev.listingStatus,
        [status]: checked
      }
    }));
  };

  return (
    <div className="flex gap-6">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="active-listings"
          checked={filters.listingStatus.active}
          onCheckedChange={(checked) => handleStatusChange('active')(!!checked)}
        />
        <Label 
          htmlFor="active-listings" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Active Listings
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="closed-listings"
          checked={filters.listingStatus.closed}
          onCheckedChange={(checked) => handleStatusChange('closed')(!!checked)}
        />
        <Label 
          htmlFor="closed-listings" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Closed Listings
        </Label>
      </div>
    </div>
  );
}