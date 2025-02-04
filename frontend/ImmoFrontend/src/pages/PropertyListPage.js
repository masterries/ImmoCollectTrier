import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/PropertyList.tsx
import { useMemo } from "react";
import { useFilters } from "../contexts/FilterContext";
import { calculateDistance } from "../utils/geo";
import ImageGallery from "../components/ImageGallery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Euro, Maximize2, Home, Calendar } from "lucide-react";
const PropertyCard = ({ property }) => {
    // Parse the Images string into an array
    const images = property.Images ? property.Images.split(";").filter(Boolean) : [];
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
        }).format(price);
    };
    return (_jsxs(Card, { className: "overflow-hidden", children: [(images.length > 0 || property.Vorschaubild) && (_jsx("div", { className: "w-full h-48", children: _jsx(ImageGallery, { images: images, previewImage: property.Vorschaubild }) })), _jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-xl font-bold", children: formatPrice(property.Preis_cleaned) }), _jsx(CardDescription, { children: property.Beschreibung })] }), property.closed_date && (_jsx(Badge, { variant: "destructive", children: "Closed" }))] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Home, { className: "w-4 h-4 text-gray-500" }), _jsxs("span", { children: [property.Zimmer, " Rooms"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Maximize2, { className: "w-4 h-4 text-gray-500" }), _jsxs("span", { children: [property.Wohnfläche, " m\u00B2"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Euro, { className: "w-4 h-4 text-gray-500" }), _jsxs("span", { children: [Math.round(property.Preis_pro_qm), " \u20AC/m\u00B2"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { children: formatDate(property.created_date) })] })] }), property.Vollständige_Adresse && (_jsxs("div", { className: "flex items-center gap-2 text-gray-600", children: [_jsx(MapPin, { className: "w-4 h-4" }), _jsx("span", { children: property.Vollständige_Adresse })] })), property.Features && (_jsx("div", { className: "flex flex-wrap gap-2", children: property.Features.split(";").map((feature, index) => (_jsx(Badge, { variant: "secondary", children: feature.trim() }, index))) }))] }) })] }));
};
const PropertyList = ({ data }) => {
    const { filters } = useFilters();
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            // Property type filter
            if (filters.propertyType !== "all" &&
                !item.Beschreibung?.startsWith(filters.propertyType)) {
                return false;
            }
            // Price filters
            if (item.Preis_cleaned < filters.priceRange[0] ||
                item.Preis_cleaned > filters.priceRange[1]) {
                return false;
            }
            // Price per sqm filter
            if (item.Preis_pro_qm < filters.pricePerSqmRange[0] ||
                item.Preis_pro_qm > filters.pricePerSqmRange[1]) {
                return false;
            }
            // Living space filter
            if (item.Wohnfläche < filters.livingSpaceRange[0] ||
                item.Wohnfläche > filters.livingSpaceRange[1]) {
                return false;
            }
            // Rooms filter
            if (item.Zimmer < filters.roomsRange[0] ||
                item.Zimmer > filters.roomsRange[1]) {
                return false;
            }
            // Geo filter
            if (filters.mapLocation && item.Latitude && item.Longitude) {
                const distance = calculateDistance(filters.mapLocation.lat, filters.mapLocation.lng, item.Latitude, item.Longitude);
                if (distance > filters.mapLocation.radiusKm) {
                    return false;
                }
            }
            // Listing status and date filter
            const hasClosedDate = !!item.closed_date;
            if (!filters.listingStatus.active &&
                !filters.listingStatus.closed) {
                return false;
            }
            if (!filters.listingStatus.active && !hasClosedDate) {
                return false;
            }
            if (!filters.listingStatus.closed && hasClosedDate) {
                return false;
            }
            // Date range filter
            if (filters.dateRange.start || filters.dateRange.end) {
                const itemDate = new Date(hasClosedDate ? item.closed_date : item.created_date);
                if (filters.dateRange.start &&
                    itemDate < new Date(filters.dateRange.start)) {
                    return false;
                }
                if (filters.dateRange.end &&
                    itemDate > new Date(filters.dateRange.end)) {
                    return false;
                }
            }
            return true;
        });
    }, [data, filters]);
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredData.map((property, index) => (_jsx(PropertyCard, { property: property }, index))) }));
};
export default PropertyList;
