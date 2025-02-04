import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/PropertyFilters.tsx
import { useState } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DateRangeFilter from "./DateRangeFilter";
import MapRadiusFilter from "./MapRadiusFilter";
import ListingStatusFilter from "./ListingStatusFilter";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
// Example breakpoints for Price per m²
const pricePerSqmOptions = [0, 1000, 2000, 3000, 4000, 5000, 10000];
const roomDropdownOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const NO_MAX_ROOMS = "NoMax";
export default function PropertyFilters({ propertyTypes, ranges, isComparisonSet = false, comparisonFilters, onComparisonFilterChange }) {
    // Pull from context only if not comparison set
    const { filters: contextFilters, setFilters: setContextFilters } = useFilters();
    // If this is a comparison set, use the passed-in filters; otherwise use context
    const filters = isComparisonSet ? comparisonFilters : contextFilters;
    // Similarly, define how to set filters
    const setFilters = isComparisonSet
        ? (newFiltersOrFn) => {
            // Call the parent's comparison filter change handler if provided
            if (onComparisonFilterChange) {
                onComparisonFilterChange((prevFilters) => {
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
        setFilters((prev) => ({
            ...prev,
            priceRange: [finalMin, finalMax],
        }));
    };
    // Helper functions
    const toDropdownValue = (val) => val === Infinity ? "NoMax" : val.toString();
    const fromDropdownValue = (str) => {
        if (str === "NoMax")
            return Infinity;
        const parsed = Number(str);
        return isNaN(parsed) ? 0 : parsed;
    };
    // Price per sqm handlers
    const handlePricePerSqmChange = (which) => (selected) => {
        setFilters((prev) => {
            const [oldMin, oldMax] = prev.pricePerSqmRange;
            const newVal = fromDropdownValue(selected);
            if (which === "min") {
                const correctedMax = newVal > oldMax ? newVal : oldMax;
                return { ...prev, pricePerSqmRange: [newVal, correctedMax] };
            }
            else {
                const correctedMin = newVal < oldMin ? newVal : oldMin;
                return { ...prev, pricePerSqmRange: [correctedMin, newVal] };
            }
        });
    };
    // Living space handlers
    const handleLivingSpaceChange = (which) => (e) => {
        const val = Number(e.target.value) || 0;
        setFilters((prev) => {
            const [oldMin, oldMax] = prev.livingSpaceRange;
            if (which === "min") {
                const finalMin = Math.min(val, oldMax);
                const finalMax = Math.max(val, oldMax);
                return { ...prev, livingSpaceRange: [finalMin, finalMax] };
            }
            else {
                const finalMin = Math.min(oldMin, val);
                const finalMax = Math.max(oldMin, val);
                return { ...prev, livingSpaceRange: [finalMin, finalMax] };
            }
        });
    };
    // Rooms handlers
    const handleRoomsChange = (which) => (selected) => {
        setFilters((prev) => {
            const [oldMin, oldMax] = prev.roomsRange;
            const newVal = selected === NO_MAX_ROOMS ? Infinity : Number(selected);
            if (which === "min") {
                const correctedMax = newVal > oldMax ? newVal : oldMax;
                return { ...prev, roomsRange: [newVal, correctedMax] };
            }
            else {
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
    return (_jsx(Card, { className: "bg-white shadow-sm border border-gray-200", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex flex-wrap gap-4 items-center", children: [_jsx("div", { className: "w-64", children: _jsxs(Select, { value: filters.propertyType, onValueChange: (value) => setFilters((prev) => ({ ...prev, propertyType: value })), children: [_jsx(SelectTrigger, { className: "bg-white border-gray-200", children: _jsx(SelectValue, { placeholder: "Property type" }) }), _jsx(SelectContent, { children: _jsxs(SelectGroup, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), propertyTypes.map((type) => (_jsx(SelectItem, { value: type, children: type }, type)))] }) })] }) }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", placeholder: "Min price", className: "w-32 pr-8", value: basicPriceMin, onChange: (e) => {
                                                const val = e.target.value;
                                                setBasicPriceMin(val);
                                                if (Number(val) > Number(basicPriceMax)) {
                                                    setBasicPriceMax(val);
                                                }
                                            } }), _jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "\u20AC" })] }), _jsx("span", { className: "text-gray-500", children: "-" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", placeholder: "Max price", className: "w-32 pr-8", value: basicPriceMax, onChange: (e) => {
                                                const val = e.target.value;
                                                setBasicPriceMax(val);
                                                if (Number(val) < Number(basicPriceMin)) {
                                                    setBasicPriceMin(val);
                                                }
                                            } }), _jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "\u20AC" })] }), _jsx(Button, { variant: "secondary", onClick: handleBasicPriceApply, className: "bg-blue-50 hover:bg-blue-100 text-blue-600", children: "Apply" })] }), _jsxs(Button, { variant: "ghost", className: "ml-auto text-gray-600 hover:bg-gray-100", onClick: () => setShowAdvanced(!showAdvanced), children: ["Advanced Filters", showAdvanced ? (_jsx(ChevronUp, { className: "ml-2 h-4 w-4" })) : (_jsx(ChevronDown, { className: "ml-2 h-4 w-4" }))] })] }), showAdvanced && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200", children: [_jsx(ListingStatusFilter, { filters: filters, setFilters: setFilters }), _jsx(DateRangeFilter, { filters: filters, setFilters: setFilters }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm text-gray-600", children: "Price per m\u00B2 (\u20AC)" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: toDropdownValue(filters.pricePerSqmRange[0]), onValueChange: handlePricePerSqmChange("min"), children: [_jsx(SelectTrigger, { className: "w-32 bg-white border-gray-200", children: _jsx(SelectValue, { placeholder: "Min p/m\u00B2" }) }), _jsx(SelectContent, { children: _jsx(SelectGroup, { children: pricePerSqmOptions.map((val) => (_jsxs(SelectItem, { value: val.toString(), children: [val.toLocaleString("de-DE"), "\u20AC"] }, val))) }) })] }), _jsx("span", { className: "text-gray-500 self-center", children: "-" }), _jsxs(Select, { value: toDropdownValue(filters.pricePerSqmRange[1]), onValueChange: handlePricePerSqmChange("max"), children: [_jsx(SelectTrigger, { className: "w-32 bg-white border-gray-200", children: _jsx(SelectValue, { placeholder: "Max p/m\u00B2" }) }), _jsx(SelectContent, { children: _jsxs(SelectGroup, { children: [pricePerSqmOptions.map((val) => (_jsxs(SelectItem, { value: val.toString(), children: [val.toLocaleString("de-DE"), "\u20AC"] }, val))), _jsx(SelectItem, { value: "NoMax", children: "No Max" })] }) })] })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Current:", " ", filters.pricePerSqmRange[0] === Infinity
                                            ? "∞"
                                            : filters.pricePerSqmRange[0].toLocaleString("de-DE"), "\u20AC -", " ", filters.pricePerSqmRange[1] === Infinity
                                            ? "∞"
                                            : filters.pricePerSqmRange[1].toLocaleString("de-DE"), "\u20AC"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm text-gray-600", children: "Living Space (m\u00B2)" }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx(Input, { type: "number", placeholder: "Min m\u00B2", className: "w-24", value: livingSpaceMinValue, onChange: handleLivingSpaceChange("min") }), _jsx("span", { className: "text-gray-500", children: "-" }), _jsx(Input, { type: "number", placeholder: "Max m\u00B2", className: "w-24", value: livingSpaceMaxValue, onChange: handleLivingSpaceChange("max") })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Current: ", filters.livingSpaceRange[0], " m\u00B2 -", " ", filters.livingSpaceRange[1], " m\u00B2"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm text-gray-600", children: "Rooms (Between)" }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsxs(Select, { value: roomsMinString, onValueChange: handleRoomsChange("min"), children: [_jsx(SelectTrigger, { className: "w-24 bg-white border-gray-200", children: _jsx(SelectValue, { placeholder: "Min Rooms" }) }), _jsx(SelectContent, { children: _jsx(SelectGroup, { children: roomDropdownOptions.map((opt) => (_jsx(SelectItem, { value: opt.toString(), children: opt }, opt))) }) })] }), _jsx("span", { className: "text-gray-500", children: "-" }), _jsxs(Select, { value: roomsMaxString, onValueChange: handleRoomsChange("max"), children: [_jsx(SelectTrigger, { className: "w-24 bg-white border-gray-200", children: _jsx(SelectValue, { placeholder: "Max Rooms" }) }), _jsx(SelectContent, { children: _jsxs(SelectGroup, { children: [roomDropdownOptions.map((opt) => (_jsx(SelectItem, { value: opt.toString(), children: opt }, opt))), _jsx(SelectItem, { value: NO_MAX_ROOMS, children: "No Max" })] }) })] })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Current:", " ", filters.roomsRange[0] === Infinity
                                            ? "∞"
                                            : filters.roomsRange[0], " ", "-", " ", filters.roomsRange[1] === Infinity
                                            ? "∞"
                                            : filters.roomsRange[1], " ", "rooms"] })] }), _jsx(MapRadiusFilter, { filters: filters, setFilters: setFilters })] }))] }) }));
}
