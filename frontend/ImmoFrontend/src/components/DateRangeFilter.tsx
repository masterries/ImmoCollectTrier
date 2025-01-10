// src/components/DateRangeFilter.tsx
import React from 'react';
import { useFilters } from '../contexts/FilterContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DateRangeFilter() {
  const { filters, setFilters } = useFilters();

  const handleDateChange = (type: 'start' | 'end') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: e.target.value || null
      }
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="startDate" className="text-sm text-gray-600">
          From Date
        </Label>
        <Input
          id="startDate"
          type="date"
          value={filters.dateRange.start || ''}
          onChange={handleDateChange('start')}
          className="w-full"
        />
      </div>
      
      <div className="flex flex-col space-y-2">
        <Label htmlFor="endDate" className="text-sm text-gray-600">
          To Date
        </Label>
        <Input
          id="endDate"
          type="date"
          value={filters.dateRange.end || ''}
          onChange={handleDateChange('end')}
          className="w-full"
        />
      </div>
    </div>
  );
}