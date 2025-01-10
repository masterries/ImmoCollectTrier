// src/pages/AnalyticsPage.tsx

import React, { useState, useMemo } from "react";
import { useFilters } from "../contexts/FilterContext";
import Layout from "../components/Layout";
import PropertyFilters from "../components/PropertyFilters";
import { Button } from "@/components/ui/button";
import { Copy, X, SplitSquareHorizontal } from "lucide-react";
import {
  PriceAnalytics,
  RoomAnalytics,
  LivingSpaceAnalytics,
} from "../components/analytics";
import { calculateDistance } from "../utils/geo";
import { sanitizePropertyData } from "../utils/dataUtils";
import type { PropertyData } from "../types";

interface Props {
  data: PropertyData[];
  propertyTypes: string[];
  ranges: {
    price: { min: number; max: number };
    pricePerSqm: { min: number; max: number };
    livingSpace: { min: number; max: number };
    plotSize: { min: number; max: number };
    rooms: { min: number; max: number };
  };
}

const AnalyticsPage: React.FC<Props> = ({ data, propertyTypes, ranges }) => {
  const { filters } = useFilters();

  // Each comparison set will hold its own filters + title
  const [comparisonSets, setComparisonSets] = useState<
    Array<{ filters: typeof filters; title: string }>
  >([]);
  const [showFilters, setShowFilters] = useState(true);

  // Sanitize and memoize the base data
  const sanitizedData = useMemo(() => sanitizePropertyData(data), [data]);

  // Use the active filter object to produce a filtered array of properties
  const getFilteredData = (filterSettings: typeof filters) => {
    return sanitizedData.filter((item) => {
      // Property type filter
      if (
        filterSettings.propertyType !== "all" &&
        !item.Beschreibung?.startsWith(filterSettings.propertyType)
      ) {
        return false;
      }

      // Price filters
      if (
        item.Preis_cleaned < filterSettings.priceRange[0] ||
        item.Preis_cleaned > filterSettings.priceRange[1]
      ) {
        return false;
      }

      // Price per sqm filter
      if (
        item.Preis_pro_qm < filterSettings.pricePerSqmRange[0] ||
        item.Preis_pro_qm > filterSettings.pricePerSqmRange[1]
      ) {
        return false;
      }

      // Living space filter
      if (
        item.Wohnfläche < filterSettings.livingSpaceRange[0] ||
        item.Wohnfläche > filterSettings.livingSpaceRange[1]
      ) {
        return false;
      }

      // Rooms filter
      if (
        item.Zimmer < filterSettings.roomsRange[0] ||
        item.Zimmer > filterSettings.roomsRange[1]
      ) {
        return false;
      }

      // Geo filter
      if (filterSettings.mapLocation && item.Latitude && item.Longitude) {
        const distance = calculateDistance(
          filterSettings.mapLocation.lat,
          filterSettings.mapLocation.lng,
          item.Latitude,
          item.Longitude
        );
        if (distance > filterSettings.mapLocation.radiusKm) {
          return false;
        }
      }

      // Listing status and date filter
      const hasClosedDate = !!item.closed_date;

      // Check listing status
      if (!filterSettings.listingStatus.active && !filterSettings.listingStatus.closed) {
        return false;
      }
      if (!filterSettings.listingStatus.active && !hasClosedDate) {
        return false;
      }
      if (!filterSettings.listingStatus.closed && hasClosedDate) {
        return false;
      }

      // Date range filter
      if (filterSettings.dateRange.start || filterSettings.dateRange.end) {
        if (filterSettings.listingStatus.active && filterSettings.listingStatus.closed) {
          // If both active + closed are selected
          const itemCreatedDate = new Date(item.created_date);
          const itemClosedDate = item.closed_date ? new Date(item.closed_date) : null;

          if (filterSettings.dateRange.start) {
            const startDate = new Date(filterSettings.dateRange.start);
            if (itemClosedDate) {
              if (itemClosedDate < startDate) return false;
            } else {
              if (itemCreatedDate < startDate) return false;
            }
          }

          if (filterSettings.dateRange.end) {
            const endDate = new Date(filterSettings.dateRange.end);
            if (itemClosedDate) {
              if (itemClosedDate > endDate) return false;
            } else {
              if (itemCreatedDate > endDate) return false;
            }
          }
        } else if (filterSettings.listingStatus.closed && hasClosedDate) {
          const itemClosedDate = new Date(item.closed_date);
          if (
            filterSettings.dateRange.start &&
            itemClosedDate < new Date(filterSettings.dateRange.start)
          )
            return false;
          if (
            filterSettings.dateRange.end &&
            itemClosedDate > new Date(filterSettings.dateRange.end)
          )
            return false;
        } else if (filterSettings.listingStatus.active && !hasClosedDate) {
          const itemCreatedDate = new Date(item.created_date);
          if (
            filterSettings.dateRange.start &&
            itemCreatedDate < new Date(filterSettings.dateRange.start)
          )
            return false;
          if (
            filterSettings.dateRange.end &&
            itemCreatedDate > new Date(filterSettings.dateRange.end)
          )
            return false;
        }
      }

      return true;
    });
  };

  // Add a new comparison set with a DEEP CLONE of the current filters
  const addComparisonSet = () => {
    if (comparisonSets.length < 4) {
      setComparisonSets([
        ...comparisonSets,
        {
          // Use structuredClone to ensure no references to the context-based filters
          filters: structuredClone(filters),
          title: `Comparison Set ${comparisonSets.length + 1}`,
        },
      ]);
    }
  };

  // Remove a comparison set
  const removeComparisonSet = (index: number) => {
    setComparisonSets(comparisonSets.filter((_, i) => i !== index));
  };

  // The data sets for analysis: the main "Current Selection" plus each comparison set
  const datasets = [
    {
      data: getFilteredData(filters),
      title: "Current Selection",
    },
    ...comparisonSets.map((set) => ({
      data: getFilteredData(set.filters),
      title: set.title,
    })),
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Property Analytics
            </h1>
            <p className="text-sm text-gray-500">
              {datasets[0].data.length} properties in current selection
              {comparisonSets.map((set, i) => {
                const count = getFilteredData(set.filters).length;
                return ` | ${set.title}: ${count} properties`;
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SplitSquareHorizontal className="w-4 h-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            {comparisonSets.length < 4 && (
              <Button onClick={addComparisonSet} className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Add Comparison Set
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div
            className={`grid gap-6 ${
              comparisonSets.length === 0
                ? "grid-cols-1"
                : comparisonSets.length === 1
                ? "grid-cols-1 md:grid-cols-2"
                : comparisonSets.length === 2
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
            }`}
          >
            {/* Main (current) filters */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Current Filters</h2>
              </div>
              <PropertyFilters
                propertyTypes={propertyTypes}
                ranges={ranges}
              />
            </div>

            {/* Comparison sets */}
            {comparisonSets.map((set, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">{set.title}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeComparisonSet(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Here we pass the custom filters & an update function */}
                <PropertyFilters
                  propertyTypes={propertyTypes}
                  ranges={ranges}
                  isComparisonSet={true}
                  comparisonSetIndex={index}
                  comparisonFilters={set.filters}
                  onComparisonFilterChange={(updater) => {
                    // In the parent, we manage how to apply that update
                    setComparisonSets((prev) =>
                      prev.map((s, i) => {
                        if (i !== index) return s;
                        const newFilters =
                          typeof updater === "function"
                            ? updater(s.filters)
                            : updater;
                        return {
                          ...s,
                          filters: newFilters,
                        };
                      })
                    );
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Analytics */}
        <div className="space-y-8">
          {/* Price Analytics */}
          <div
            className={`grid gap-6 ${
              datasets.length === 1
                ? "grid-cols-1"
                : datasets.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : datasets.length === 3
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
            }`}
          >
            {datasets.map((dataset, index) => (
              <PriceAnalytics
                key={`price-${index}`}
                data={dataset.data}
                title={`${dataset.title} - Price Analysis`}
              />
            ))}
          </div>

          {/* Room Analytics */}
          <div
            className={`grid gap-6 ${
              datasets.length === 1
                ? "grid-cols-1"
                : datasets.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : datasets.length === 3
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
            }`}
          >
            {datasets.map((dataset, index) => (
              <RoomAnalytics
                key={`rooms-${index}`}
                data={dataset.data}
                title={`${dataset.title} - Room Analysis`}
              />
            ))}
          </div>

          {/* Living Space Analytics */}
          <div
            className={`grid gap-6 ${
              datasets.length === 1
                ? "grid-cols-1"
                : datasets.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : datasets.length === 3
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
            }`}
          >
            {datasets.map((dataset, index) => (
              <LivingSpaceAnalytics
                key={`space-${index}`}
                data={dataset.data}
                title={`${dataset.title} - Living Space Analysis`}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
