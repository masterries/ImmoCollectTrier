// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Papa from "papaparse";
import { FilterProvider } from "./contexts/FilterContext";
import DashboardPage from "./pages/DashboardPage";
import PropertyListPage from "./pages/PropertyListPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import type { PropertyData, DataRanges } from "./types";

// In App.tsx, add this function before your App component:
const analyzeImageData = (data: PropertyData[]) => {
  // Count properties with images
  const withImages = data.filter(p => p.Images || p.Vorschaubild);
  const withoutImages = data.filter(p => !p.Images && !p.Vorschaubild);

  // Get 5 sample properties with images
  const sampleWithImages = withImages.slice(0, 5);
  // Get 2 sample properties without images
  const sampleWithoutImages = withoutImages.slice(0, 2);

  console.group('Image Data Analysis');
  console.log('Total properties:', data.length);
  console.log('Properties with images:', withImages.length);
  console.log('Properties without images:', withoutImages.length);
  
  console.group('Sample Properties WITH Images');
  sampleWithImages.forEach((prop, index) => {
    console.group(`Property ${index + 1}`);
    console.log('Preview Image:', prop.Vorschaubild);
    console.log('Image List:', prop.Images);
    console.log('Raw Image Data:', {
      Vorschaubild: prop.Vorschaubild,
      Images: prop.Images
    });
    console.log('Other Data:', {
      Price: prop.Preis_cleaned,
      Description: prop.Beschreibung,
      Address: prop.Vollständige_Adresse
    });
    console.groupEnd();
  });
  console.groupEnd();

  console.group('Sample Properties WITHOUT Images');
  sampleWithoutImages.forEach((prop, index) => {
    console.log(`Property ${index + 1}:`, {
      Price: prop.Preis_cleaned,
      Description: prop.Beschreibung,
      Address: prop.Vollständige_Adresse
    });
  });
  console.groupEnd();

  // Analyze image URL patterns
  const imageUrlPatterns = withImages
    .flatMap(p => {
      const urls = [];
      if (p.Vorschaubild) urls.push(p.Vorschaubild);
      if (p.Images) urls.push(...p.Images.split(';'));
      return urls;
    })
    .filter(Boolean)
    .slice(0, 10);

  console.group('Image URL Patterns');
  console.log('Sample Image URLs:', imageUrlPatterns);
  console.groupEnd();

  console.groupEnd();
};

function App() {
  const [data, setData] = useState<PropertyData[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [ranges, setRanges] = useState<DataRanges>({
    price: { min: 0, max: 1000000 },
    pricePerSqm: { min: 0, max: 5000 },
    livingSpace: { min: 0, max: 500 },
    plotSize: { min: 0, max: 2000 },
    rooms: { min: 0, max: 10 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/masterries/ImmoCollectTrier/refs/heads/main/data/miete_trier50km_detailed2.csv"
        );
        const text = await response.text();
        const parsedData = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transform: (value, field) => {
            // Convert German number format (comma as decimal separator) to English format
            if (
              typeof value === "string" &&
              (field === "Latitude" || field === "Longitude")
            ) {
              return parseFloat(value.replace(",", "."));
            }
            return value;
          },
        });

        const cleanedData = parsedData.data
          .filter(
            (row: PropertyData) =>
              row.Preis_cleaned &&
              !isNaN(row.Preis_cleaned) &&
              row.Latitude &&
              row.Longitude
          )
          .map((row: PropertyData) => ({
            ...row,
            // Clean up image URLs
            Images: row.Images?.trim() || "",
            Vorschaubild: row.Vorschaubild?.trim() || "",
            // Ensure latitude and longitude are proper numbers
            Latitude:
              typeof row.Latitude === "string"
                ? parseFloat(row.Latitude.replace(",", "."))
                : row.Latitude,
            Longitude:
              typeof row.Longitude === "string"
                ? parseFloat(row.Longitude.replace(",", "."))
                : row.Longitude,
          }));
          analyzeImageData(cleanedData);

        // Extract property types
        const types = [
          ...new Set(
            cleanedData
              .map((row) => row.Beschreibung?.split(" ")[0])
              .filter(Boolean)
          ),
        ];

        // Calculate ranges
        const newRanges = {
          price: {
            min: Math.min(...cleanedData.map((d) => d.Preis_cleaned)),
            max: Math.max(...cleanedData.map((d) => d.Preis_cleaned)),
          },
          pricePerSqm: {
            min: Math.min(
              ...cleanedData.map((d) => d.Preis_pro_qm).filter(Boolean)
            ),
            max: Math.max(
              ...cleanedData.map((d) => d.Preis_pro_qm).filter(Boolean)
            ),
          },
          livingSpace: {
            min: Math.min(
              ...cleanedData.map((d) => d.Wohnfläche).filter(Boolean)
            ),
            max: Math.max(
              ...cleanedData.map((d) => d.Wohnfläche).filter(Boolean)
            ),
          },
          plotSize: {
            min: Math.min(
              ...cleanedData.map((d) => d.Grundstücksfläche).filter(Boolean)
            ),
            max: Math.max(
              ...cleanedData.map((d) => d.Grundstücksfläche).filter(Boolean)
            ),
          },
          rooms: {
            min: Math.min(...cleanedData.map((d) => d.Zimmer).filter(Boolean)),
            max: Math.max(...cleanedData.map((d) => d.Zimmer).filter(Boolean)),
          },
        };

        setData(cleanedData);
        setPropertyTypes(types);
        setRanges(newRanges);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        console.error("Data processing failed. Please check:");
        console.error("- CSV format and accessibility");
        console.error("- Coordinate field names (should be Lat and Lon)");
        console.error("- Number format handling");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xl">Loading property data...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <FilterProvider>
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                data={data}
                propertyTypes={propertyTypes}
                ranges={ranges}
              />
            }
          />
          <Route
            path="/list"
            element={<PropertyListPage data={data} />}
          />
          <Route
            path="/analytics"
            element={
              <AnalyticsPage
                data={data}
                propertyTypes={propertyTypes}
                ranges={ranges}
              />
            }
          />
        </Routes>
      </FilterProvider>
    </Router>
  );
}

export default App;
