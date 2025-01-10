// src/components/PropertyFilters.tsx

import React, { useState } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DateRangeFilter from "./DateRangeFilter";
import MapRadiusFilter from "./MapRadiusFilter";
import ListingStatusFilter from "./ListingStatusFilter";
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DataRanges } from '../types';

// Example breakpoints for Price per m²
const pricePerSqmOptions = [0, 1000, 2000, 3000, 4000, 5000, 10000];
const roomDropdownOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const NO_MAX_ROOMS = "NoMax";

interface Props {
  propertyTypes: string[];
  ranges: DataRanges;
  isComparisonSet?: boolean;
  comparisonSetIndex?: number;
  comparisonFilters?: any;
  onComparisonFilterChange?: (updater: any) => void;
}

export default function PropertyFilters({ 
  propertyTypes, 
  ranges,
  isComparisonSet = false,
  comparisonFilters,
  onComparisonFilterChange
}: Props) {
  // Pull from context only if not comparison set
  const { filters: contextFilters, setFilters: setContextFilters } = useFilters();

  // If this is a comparison set, use the passed-in filters; otherwise use context
  const filters = isComparisonSet ? comparisonFilters : contextFilters;

  // Similarly, define how to set filters
  const setFilters = isComparisonSet
    ? (newFiltersOrFn: any) => {
        // Call the parent's comparison filter change handler if provided
        if (onComparisonFilterChange) {
          onComparisonFilterChange((prevFilters: any) => {
            // If newFiltersOrFn is a function, pass prevFilters to it
            if (typeof newFiltersOrFn === "function") {
              return newFiltersOrFn(prevFilters);
            }
            // Otherwise, just return the new object
            return newFiltersOrFn;
          });
        }
      }
    : setContextFilters;

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Basic price range state (local text inputs)
  const [basicPriceMin, setBasicPriceMin] = useState(ranges.price.min.toString());
  const [basicPriceMax, setBasicPriceMax] = useState(ranges.price.max.toString());

  const handleBasicPriceApply = () => {
    const minVal = Number(basicPriceMin) || 0;
    const maxVal = Number(basicPriceMax) || 0;
    const finalMin = Math.min(minVal, maxVal);
    const finalMax = Math.max(minVal, maxVal);

    setFilters((prev: any) => ({
      ...prev,
      priceRange: [finalMin, finalMax],
    }));
  };

  // Helper functions
  const toDropdownValue = (val: number) =>
    val === Infinity ? "NoMax" : val.toString();

  const fromDropdownValue = (str: string) => {
    if (str === "NoMax") return Infinity;
    const parsed = Number(str);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Price per sqm handlers
  const handlePricePerSqmChange = (which: "min" | "max") => (selected: string) => {
    setFilters((prev: any) => {
      const [oldMin, oldMax] = prev.pricePerSqmRange;
      const newVal = fromDropdownValue(selected);

      if (which === "min") {
        const correctedMax = newVal > oldMax ? newVal : oldMax;
        return { ...prev, pricePerSqmRange: [newVal, correctedMax] };
      } else {
        const correctedMin = newVal < oldMin ? newVal : oldMin;
        return { ...prev, pricePerSqmRange: [correctedMin, newVal] };
      }
    });
  };

  // Living space handlers
  const handleLivingSpaceChange = (which: "min" | "max") => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = Number(e.target.value) || 0;

    setFilters((prev: any) => {
      const [oldMin, oldMax] = prev.livingSpaceRange;
      if (which === "min") {
        const finalMin = Math.min(val, oldMax);
        const finalMax = Math.max(val, oldMax);
        return { ...prev, livingSpaceRange: [finalMin, finalMax] };
      } else {
        const finalMin = Math.min(oldMin, val);
        const finalMax = Math.max(oldMin, val);
        return { ...prev, livingSpaceRange: [finalMin, finalMax] };
      }
    });
  };

  // Rooms handlers
  const handleRoomsChange = (which: "min" | "max") => (selected: string) => {
    setFilters((prev: any) => {
      const [oldMin, oldMax] = prev.roomsRange;
      const newVal = selected === NO_MAX_ROOMS ? Infinity : Number(selected);

      if (which === "min") {
        const correctedMax = newVal > oldMax ? newVal : oldMax;
        return { ...prev, roomsRange: [newVal, correctedMax] };
      } else {
        const correctedMin = newVal < oldMin ? newVal : oldMin;
        return { ...prev, roomsRange: [correctedMin, newVal] };
      }
    });
  };

  const livingSpaceMinValue = filters.livingSpaceRange[0];
  const livingSpaceMaxValue = filters.livingSpaceRange[1];
  const roomsMinString = toDropdownValue(filters.roomsRange[0]);
  const roomsMaxString = toDropdownValue(filters.roomsRange[1]);
  const roomMaxOptions = [
    ...roomDropdownOptions.map((n) => n.toString()),
    NO_MAX_ROOMS,
  ];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        {/* Basic Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Property Type Select */}
          <div className="w-64">
            <Select
              value={filters.propertyType}
              onValueChange={(value) =>
                setFilters((prev: any) => ({ ...prev, propertyType: value }))
              }
            >
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Input
                type="number"
                placeholder="Min price"
                className="w-32 pr-8"
                value={basicPriceMin}
                onChange={(e) => {
                  const val = e.target.value;
                  setBasicPriceMin(val);
                  if (Number(val) > Number(basicPriceMax)) {
                    setBasicPriceMax(val);
                  }
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                €
              </span>
            </div>
            <span className="text-gray-500">-</span>
            <div className="relative">
              <Input
                type="number"
                placeholder="Max price"
                className="w-32 pr-8"
                value={basicPriceMax}
                onChange={(e) => {
                  const val = e.target.value;
                  setBasicPriceMax(val);
                  if (Number(val) < Number(basicPriceMin)) {
                    setBasicPriceMin(val);
                  }
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                €
              </span>
            </div>

            <Button
              variant="secondary"
              onClick={handleBasicPriceApply}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600"
            >
              Apply
            </Button>
          </div>

          {/* Advanced Toggle */}
          <Button
            variant="ghost"
            className="ml-auto text-gray-600 hover:bg-gray-100"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Advanced Filters
            {showAdvanced ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
            <ListingStatusFilter filters={filters} setFilters={setFilters} />
            <DateRangeFilter filters={filters} setFilters={setFilters} />

            {/* Price per m² */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Price per m² (€)</label>
              <div className="flex gap-2">
                <Select
                  value={toDropdownValue(filters.pricePerSqmRange[0])}
                  onValueChange={handlePricePerSqmChange("min")}
                >
                  <SelectTrigger className="w-32 bg-white border-gray-200">
                    <SelectValue placeholder="Min p/m²" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {pricePerSqmOptions.map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                          {val.toLocaleString("de-DE")}€
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <span className="text-gray-500 self-center">-</span>

                <Select
                  value={toDropdownValue(filters.pricePerSqmRange[1])}
                  onValueChange={handlePricePerSqmChange("max")}
                >
                  <SelectTrigger className="w-32 bg-white border-gray-200">
                    <SelectValue placeholder="Max p/m²" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {pricePerSqmOptions.map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                          {val.toLocaleString("de-DE")}€
                        </SelectItem>
                      ))}
                      <SelectItem value="NoMax">No Max</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-gray-500">
                Current:{" "}
                {filters.pricePerSqmRange[0] === Infinity
                  ? "∞"
                  : filters.pricePerSqmRange[0].toLocaleString("de-DE")}
                € -{" "}
                {filters.pricePerSqmRange[1] === Infinity
                  ? "∞"
                  : filters.pricePerSqmRange[1].toLocaleString("de-DE")}
                €
              </div>
            </div>

            {/* Living Space */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Living Space (m²)</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min m²"
                  className="w-24"
                  value={livingSpaceMinValue}
                  onChange={handleLivingSpaceChange("min")}
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="number"
                  placeholder="Max m²"
                  className="w-24"
                  value={livingSpaceMaxValue}
                  onChange={handleLivingSpaceChange("max")}
                />
              </div>
              <div className="text-xs text-gray-500">
                Current: {filters.livingSpaceRange[0]} m² -{" "}
                {filters.livingSpaceRange[1]} m²
              </div>
            </div>

            {/* Rooms */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Rooms (Between)</label>
              <div className="flex gap-2 items-center">
                <Select value={roomsMinString} onValueChange={handleRoomsChange("min")}>
                  <SelectTrigger className="w-24 bg-white border-gray-200">
                    <SelectValue placeholder="Min Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {roomDropdownOptions.map((opt) => (
                        <SelectItem key={opt} value={opt.toString()}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <span className="text-gray-500">-</span>

                <Select value={roomsMaxString} onValueChange={handleRoomsChange("max")}>
                  <SelectTrigger className="w-24 bg-white border-gray-200">
                    <SelectValue placeholder="Max Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {roomDropdownOptions.map((opt) => (
                        <SelectItem key={opt} value={opt.toString()}>
                          {opt}
                        </SelectItem>
                      ))}
                      <SelectItem value={NO_MAX_ROOMS}>No Max</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-gray-500">
                Current:{" "}
                {filters.roomsRange[0] === Infinity
                  ? "∞"
                  : filters.roomsRange[0]}{" "}
                -{" "}
                {filters.roomsRange[1] === Infinity
                  ? "∞"
                  : filters.roomsRange[1]}{" "}
                rooms
              </div>
            </div>

            {/* Map Filter */}
            <MapRadiusFilter filters={filters} setFilters={setFilters} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
