import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFilters } from '../contexts/FilterContext';
import { Card } from "@/components/ui/card";
import { Home, Euro, Calendar } from 'lucide-react';
import { calculateDistance } from '../utils/geo';
const PropertyList = ({ data }) => {
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
            const distance = calculateDistance(filters.mapLocation.lat, filters.mapLocation.lng, item.Latitude, item.Longitude);
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
                        if (itemClosedDate < startDate)
                            return false;
                    }
                    else {
                        if (itemCreatedDate < startDate)
                            return false;
                    }
                }
                if (filters.dateRange.end) {
                    const endDate = new Date(filters.dateRange.end);
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
            else if (filters.listingStatus.closed && hasClosedDate) {
                const itemClosedDate = new Date(item.closed_date);
                if (filters.dateRange.start && itemClosedDate < new Date(filters.dateRange.start))
                    return false;
                if (filters.dateRange.end && itemClosedDate > new Date(filters.dateRange.end))
                    return false;
            }
            else if (filters.listingStatus.active && !hasClosedDate) {
                const itemCreatedDate = new Date(item.created_date);
                if (filters.dateRange.start && itemCreatedDate < new Date(filters.dateRange.start))
                    return false;
                if (filters.dateRange.end && itemCreatedDate > new Date(filters.dateRange.end))
                    return false;
            }
        }
        return true;
    });
    return (_jsxs("div", { className: "space-y-4", children: [filteredData.map((property, index) => (_jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: property.Beschreibung }), _jsxs("div", { className: "mt-2 space-y-2", children: [_jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Home, { className: "w-4 h-4 mr-2" }), _jsxs("span", { children: [property.Wohnfläche, "m\u00B2 \u2022 ", property.Zimmer, " Rooms"] })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Euro, { className: "w-4 h-4 mr-2" }), _jsxs("span", { children: [property.Preis_cleaned.toLocaleString('de-DE'), "\u20AC (", property.Preis_pro_qm, "\u20AC/m\u00B2)"] })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), _jsxs("span", { children: ["Listed: ", new Date(property.created_date).toLocaleDateString()] }), property.closed_date && (_jsxs("span", { className: "ml-2", children: ["\u2022 Closed: ", new Date(property.closed_date).toLocaleDateString()] }))] })] }), property.Features && (_jsx("p", { className: "mt-2 text-sm text-gray-500", children: property.Features }))] }), _jsx("div", { className: "flex-shrink-0 flex flex-col justify-between", children: _jsx("a", { href: property.Link, target: "_blank", rel: "noopener noreferrer", className: "px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors", children: "View Details" }) })] }) }, index))), filteredData.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No properties match your current filters." }))] }));
};
export default PropertyList;
