import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useFilters } from "../contexts/FilterContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TRIER_COORDS, DEFAULT_RADIUS } from "../utils/geo";
function SetCenterOnClick({ onCenterChange }) {
    useMapEvents({
        click(e) {
            onCenterChange([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}
export default function MapRadiusFilter() {
    const { filters, setFilters } = useFilters();
    // Use Trier coordinates as default
    const initialCenter = [
        filters.mapLocation?.lat ?? TRIER_COORDS.lat,
        filters.mapLocation?.lng ?? TRIER_COORDS.lng
    ];
    const [center, setCenter] = useState(initialCenter);
    const [radius, setRadius] = useState(filters.mapLocation?.radiusKm ?? DEFAULT_RADIUS);
    const handleCenterChange = (coords) => {
        setCenter(coords);
        setFilters((prev) => ({
            ...prev,
            mapLocation: { lat: coords[0], lng: coords[1], radiusKm: radius },
        }));
    };
    const handleRadiusChange = (val) => {
        const newKm = Number(val);
        if (!isNaN(newKm) && newKm > 0) {
            setRadius(newKm);
            setFilters((prev) => ({
                ...prev,
                mapLocation: { lat: center[0], lng: center[1], radiusKm: newKm },
            }));
        }
    };
    const resetToTrier = () => {
        const trierCoords = [TRIER_COORDS.lat, TRIER_COORDS.lng];
        setCenter(trierCoords);
        setRadius(DEFAULT_RADIUS);
        setFilters((prev) => ({
            ...prev,
            mapLocation: {
                lat: TRIER_COORDS.lat,
                lng: TRIER_COORDS.lng,
                radiusKm: DEFAULT_RADIUS
            },
        }));
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Choose a location and radius:" }), _jsx(Button, { variant: "outline", size: "sm", onClick: resetToTrier, className: "text-blue-600 hover:text-blue-700", children: "Reset to Trier" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { htmlFor: "radiusInput", className: "text-sm", children: "Radius (km):" }), _jsx(Input, { id: "radiusInput", type: "number", value: radius, onChange: (e) => handleRadiusChange(e.target.value), className: "w-24" })] }), _jsxs(MapContainer, { center: center, zoom: 9, style: { width: "100%", height: "400px" }, scrollWheelZoom: true, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), _jsx(SetCenterOnClick, { onCenterChange: handleCenterChange }), _jsx(Marker, { position: center }), _jsx(Circle, { center: center, radius: radius * 1000, pathOptions: {
                            color: "blue",
                            fillColor: "blue",
                            fillOpacity: 0.1
                        } })] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Current center: ", center[0].toFixed(4), ", ", center[1].toFixed(4), ", Radius: ", radius, " km"] })] }));
}
