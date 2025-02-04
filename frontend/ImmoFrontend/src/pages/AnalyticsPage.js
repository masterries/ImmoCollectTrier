import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/AnalyticsPage.tsx
import { useState, useMemo } from "react";
import { useFilters } from "../contexts/FilterContext";
import Layout from "../components/Layout";
import PropertyFilters from "../components/PropertyFilters";
import { Button } from "@/components/ui/button";
import { Copy, X, SplitSquareHorizontal } from "lucide-react";
import { PriceAnalytics, RoomAnalytics, LivingSpaceAnalytics, } from "../components/analytics";
import { calculateDistance } from "../utils/geo";
import { sanitizePropertyData } from "../utils/dataUtils";
const AnalyticsPage = ({ data, propertyTypes, ranges }) => {
    const { filters } = useFilters();
    // Each comparison set will hold its own filters + title
    const [comparisonSets, setComparisonSets] = useState([]);
    const [showFilters, setShowFilters] = useState(true);
    // Sanitize and memoize the base data
    const sanitizedData = useMemo(() => sanitizePropertyData(data), [data]);
    // Use the active filter object to produce a filtered array of properties
    const getFilteredData = (filterSettings) => {
        return sanitizedData.filter((item) => {
            // Property type filter
            if (filterSettings.propertyType !== "all" &&
                !item.Beschreibung?.startsWith(filterSettings.propertyType)) {
                return false;
            }
            // Price filters
            if (item.Preis_cleaned < filterSettings.priceRange[0] ||
                item.Preis_cleaned > filterSettings.priceRange[1]) {
                return false;
            }
            // Price per sqm filter
            if (item.Preis_pro_qm < filterSettings.pricePerSqmRange[0] ||
                item.Preis_pro_qm > filterSettings.pricePerSqmRange[1]) {
                return false;
            }
            // Living space filter
            if (item.Wohnfläche < filterSettings.livingSpaceRange[0] ||
                item.Wohnfläche > filterSettings.livingSpaceRange[1]) {
                return false;
            }
            // Rooms filter
            if (item.Zimmer < filterSettings.roomsRange[0] ||
                item.Zimmer > filterSettings.roomsRange[1]) {
                return false;
            }
            // Geo filter
            if (filterSettings.mapLocation && item.Latitude && item.Longitude) {
                const distance = calculateDistance(filterSettings.mapLocation.lat, filterSettings.mapLocation.lng, item.Latitude, item.Longitude);
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
                            if (itemClosedDate < startDate)
                                return false;
                        }
                        else {
                            if (itemCreatedDate < startDate)
                                return false;
                        }
                    }
                    if (filterSettings.dateRange.end) {
                        const endDate = new Date(filterSettings.dateRange.end);
                        if (itemClosedDate) {
                            if (itemClosedDate > endDate)
                                return false;
                        }
                        else {
                            if (itemCreatedDate > endDate)
                                return false;
                        }
                    }
                }
                else if (filterSettings.listingStatus.closed && hasClosedDate) {
                    const itemClosedDate = new Date(item.closed_date);
                    if (filterSettings.dateRange.start &&
                        itemClosedDate < new Date(filterSettings.dateRange.start))
                        return false;
                    if (filterSettings.dateRange.end &&
                        itemClosedDate > new Date(filterSettings.dateRange.end))
                        return false;
                }
                else if (filterSettings.listingStatus.active && !hasClosedDate) {
                    const itemCreatedDate = new Date(item.created_date);
                    if (filterSettings.dateRange.start &&
                        itemCreatedDate < new Date(filterSettings.dateRange.start))
                        return false;
                    if (filterSettings.dateRange.end &&
                        itemCreatedDate > new Date(filterSettings.dateRange.end))
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
    const removeComparisonSet = (index) => {
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
    return (_jsx(Layout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Property Analytics" }), _jsxs("p", { className: "text-sm text-gray-500", children: [datasets[0].data.length, " properties in current selection", comparisonSets.map((set, i) => {
                                            const count = getFilteredData(set.filters).length;
                                            return ` | ${set.title}: ${count} properties`;
                                        })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => setShowFilters(!showFilters), className: "flex items-center gap-2", children: [_jsx(SplitSquareHorizontal, { className: "w-4 h-4" }), showFilters ? "Hide Filters" : "Show Filters"] }), comparisonSets.length < 4 && (_jsxs(Button, { onClick: addComparisonSet, className: "flex items-center gap-2", children: [_jsx(Copy, { className: "w-4 h-4" }), "Add Comparison Set"] }))] })] }), showFilters && (_jsxs("div", { className: `grid gap-6 ${comparisonSets.length === 0
                        ? "grid-cols-1"
                        : comparisonSets.length === 1
                            ? "grid-cols-1 md:grid-cols-2"
                            : comparisonSets.length === 2
                                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"}`, children: [_jsxs("div", { children: [_jsx("div", { className: "flex justify-between items-center mb-4", children: _jsx("h2", { className: "text-lg font-semibold", children: "Current Filters" }) }), _jsx(PropertyFilters, { propertyTypes: propertyTypes, ranges: ranges })] }), comparisonSets.map((set, index) => (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: set.title }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeComparisonSet(index), className: "text-red-500 hover:text-red-600 hover:bg-red-50", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx(PropertyFilters, { propertyTypes: propertyTypes, ranges: ranges, isComparisonSet: true, comparisonSetIndex: index, comparisonFilters: set.filters, onComparisonFilterChange: (updater) => {
                                        // In the parent, we manage how to apply that update
                                        setComparisonSets((prev) => prev.map((s, i) => {
                                            if (i !== index)
                                                return s;
                                            const newFilters = typeof updater === "function"
                                                ? updater(s.filters)
                                                : updater;
                                            return {
                                                ...s,
                                                filters: newFilters,
                                            };
                                        }));
                                    } })] }, index)))] })), _jsxs("div", { className: "space-y-8", children: [_jsx("div", { className: `grid gap-6 ${datasets.length === 1
                                ? "grid-cols-1"
                                : datasets.length === 2
                                    ? "grid-cols-1 md:grid-cols-2"
                                    : datasets.length === 3
                                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"}`, children: datasets.map((dataset, index) => (_jsx(PriceAnalytics, { data: dataset.data, title: `${dataset.title} - Price Analysis` }, `price-${index}`))) }), _jsx("div", { className: `grid gap-6 ${datasets.length === 1
                                ? "grid-cols-1"
                                : datasets.length === 2
                                    ? "grid-cols-1 md:grid-cols-2"
                                    : datasets.length === 3
                                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"}`, children: datasets.map((dataset, index) => (_jsx(RoomAnalytics, { data: dataset.data, title: `${dataset.title} - Room Analysis` }, `rooms-${index}`))) }), _jsx("div", { className: `grid gap-6 ${datasets.length === 1
                                ? "grid-cols-1"
                                : datasets.length === 2
                                    ? "grid-cols-1 md:grid-cols-2"
                                    : datasets.length === 3
                                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"}`, children: datasets.map((dataset, index) => (_jsx(LivingSpaceAnalytics, { data: dataset.data, title: `${dataset.title} - Living Space Analysis` }, `space-${index}`))) })] })] }) }));
};
export default AnalyticsPage;
