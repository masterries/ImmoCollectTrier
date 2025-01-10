import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useFilters } from "../contexts/FilterContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TRIER_COORDS, DEFAULT_RADIUS } from "../utils/geo";

function SetCenterOnClick({ onCenterChange }: { onCenterChange: (coords: [number, number]) => void }) {
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
  const initialCenter: [number, number] = [
    filters.mapLocation?.lat ?? TRIER_COORDS.lat,
    filters.mapLocation?.lng ?? TRIER_COORDS.lng
  ];
  
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [radius, setRadius] = useState<number>(filters.mapLocation?.radiusKm ?? DEFAULT_RADIUS);

  const handleCenterChange = (coords: [number, number]) => {
    setCenter(coords);
    setFilters((prev) => ({
      ...prev,
      mapLocation: { lat: coords[0], lng: coords[1], radiusKm: radius },
    }));
  };

  const handleRadiusChange = (val: string) => {
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
    const trierCoords: [number, number] = [TRIER_COORDS.lat, TRIER_COORDS.lng];
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Choose a location and radius:</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetToTrier}
          className="text-blue-600 hover:text-blue-700"
        >
          Reset to Trier
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="radiusInput" className="text-sm">
          Radius (km):
        </label>
        <Input
          id="radiusInput"
          type="number"
          value={radius}
          onChange={(e) => handleRadiusChange(e.target.value)}
          className="w-24"
        />
      </div>

      <MapContainer
        center={center}
        zoom={9}
        style={{ width: "100%", height: "400px" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetCenterOnClick onCenterChange={handleCenterChange} />
        <Marker position={center} />
        <Circle 
          center={center} 
          radius={radius * 1000} 
          pathOptions={{ 
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.1
          }} 
        />
      </MapContainer>

      <p className="text-xs text-gray-500">
        Current center: {center[0].toFixed(4)}, {center[1].toFixed(4)}, Radius: {radius} km
      </p>
    </div>
  );
}