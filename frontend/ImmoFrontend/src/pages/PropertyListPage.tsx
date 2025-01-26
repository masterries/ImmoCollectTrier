// src/components/PropertyList.tsx
import React, { useMemo } from "react";
import { useFilters } from "../contexts/FilterContext";
import { calculateDistance } from "../utils/geo";
import ImageGallery from "../components/ImageGallery";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Euro, Maximize2, Home, Calendar } from "lucide-react";
import type { PropertyData } from "../types";

interface PropertyCardProps {
  property: PropertyData;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  // Parse the Images string into an array
  const images = property.Images ? property.Images.split(";").filter(Boolean) : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden">
      {/* Image Gallery */}
      {(images.length > 0 || property.Vorschaubild) && (
        <div className="w-full h-48">
          <ImageGallery images={images} previewImage={property.Vorschaubild} />
        </div>
      )}

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">
              {formatPrice(property.Preis_cleaned)}
            </CardTitle>
            <CardDescription>{property.Beschreibung}</CardDescription>
          </div>
          {property.closed_date && (
            <Badge variant="destructive">Closed</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-500" />
              <span>{property.Zimmer} Rooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-gray-500" />
              <span>{property.Wohnfläche} m²</span>
            </div>
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-gray-500" />
              <span>{Math.round(property.Preis_pro_qm)} €/m²</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{formatDate(property.created_date)}</span>
            </div>
          </div>

          {/* Address */}
          {property.Vollständige_Adresse && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{property.Vollständige_Adresse}</span>
            </div>
          )}

          {/* Features */}
          {property.Features && (
            <div className="flex flex-wrap gap-2">
              {property.Features.split(";").map((feature, index) => (
                <Badge key={index} variant="secondary">
                  {feature.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PropertyList: React.FC<{ data: PropertyData[] }> = ({ data }) => {
  const { filters } = useFilters();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Property type filter
      if (
        filters.propertyType !== "all" &&
        !item.Beschreibung?.startsWith(filters.propertyType)
      ) {
        return false;
      }

      // Price filters
      if (
        item.Preis_cleaned < filters.priceRange[0] ||
        item.Preis_cleaned > filters.priceRange[1]
      ) {
        return false;
      }

      // Price per sqm filter
      if (
        item.Preis_pro_qm < filters.pricePerSqmRange[0] ||
        item.Preis_pro_qm > filters.pricePerSqmRange[1]
      ) {
        return false;
      }

      // Living space filter
      if (
        item.Wohnfläche < filters.livingSpaceRange[0] ||
        item.Wohnfläche > filters.livingSpaceRange[1]
      ) {
        return false;
      }

      // Rooms filter
      if (
        item.Zimmer < filters.roomsRange[0] ||
        item.Zimmer > filters.roomsRange[1]
      ) {
        return false;
      }

      // Geo filter
      if (filters.mapLocation && item.Latitude && item.Longitude) {
        const distance = calculateDistance(
          filters.mapLocation.lat,
          filters.mapLocation.lng,
          item.Latitude,
          item.Longitude
        );
        if (distance > filters.mapLocation.radiusKm) {
          return false;
        }
      }

      // Listing status and date filter
      const hasClosedDate = !!item.closed_date;

      if (
        !filters.listingStatus.active &&
        !filters.listingStatus.closed
      ) {
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
        const itemDate = new Date(
          hasClosedDate ? item.closed_date : item.created_date
        );
        if (
          filters.dateRange.start &&
          itemDate < new Date(filters.dateRange.start)
        ) {
          return false;
        }
        if (
          filters.dateRange.end &&
          itemDate > new Date(filters.dateRange.end)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredData.map((property, index) => (
        <PropertyCard key={index} property={property} />
      ))}
    </div>
  );
};

export default PropertyList;
