// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Papa from "papaparse";
import { FilterProvider } from "./contexts/FilterContext";
import DashboardPage from "./pages/DashboardPage";
import PropertyListPage from "./pages/PropertyListPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import type { PropertyData, DataRanges } from "./types";

// Helper function to clean image URLs
const cleanImageUrl = (url: string): string => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    // Keep only the ci_seal parameter if it exists
    const params = new URLSearchParams();
    const ciSeal = urlObj.searchParams.get('ci_seal');
    if (ciSeal) {
      params.set('ci_seal', ciSeal);
    }
    // Reconstruct the URL with only necessary parameters
    urlObj.search = params.toString();
    return urlObj.toString();
  } catch (e) {
    console.warn('Invalid URL:', url);
    return url;
  }
};

// Function to process image data for each property
const processImageData = (row: PropertyData): PropertyData => {
  console.group('Processing Property Data');
  console.log('Input row:', row);
  
  // Process preview image
  const cleanedPreview = row.Vorschaubild ? cleanImageUrl(row.Vorschaubild.toString()) : '';
  console.log('Cleaned preview:', cleanedPreview);

  // Process image list
  let cleanedImages: string[] = [];
  if (typeof row.Images === 'string' && row.Images.trim()) {
    console.log('Raw Images string:', row.Images);
    // Split by semicolon and clean each URL
    cleanedImages = row.Images.split(';')
      .map(url => url.trim())
      .filter(url => url) // Remove empty strings
      .map(cleanImageUrl)
      .filter(url => url.includes('ci_seal')); // Only keep URLs with seals
    
    console.log('Cleaned Images array:', cleanedImages);
  }

  // Create allImages array with both preview and regular images
  const allImages = [
    ...(cleanedPreview && cleanedPreview.includes('ci_seal') ? [cleanedPreview] : []),
    ...cleanedImages
  ];

  console.log('Final allImages:', allImages);
  console.groupEnd();

  return {
    ...row,
    Vorschaubild: cleanedPreview,
    Images: cleanedImages.join(';'),
    allImages: allImages
  };
};


// Analysis function for debugging
const analyzeImageData = (data: PropertyData[]) => {
  // Count properties with valid images
  const withImages = data.filter(p => p.allImages && p.allImages.length > 0);
  const withoutImages = data.filter(p => !p.allImages || p.allImages.length === 0);

  console.group('Image Data Analysis');
  console.log('Total properties:', data.length);
  console.log('Properties with images:', withImages.length);
  console.log('Properties without images:', withoutImages.length);
  
  // Log the last entry in detail
  const lastEntry = data[data.length - 1];
  console.group('Last Entry Detail Analysis');
  console.log('Full last entry:', lastEntry);
  console.log('Link:', lastEntry.Link);
  console.log('Raw Images field:', lastEntry.Images);
  console.log('Raw Vorschaubild field:', lastEntry.Vorschaubild);
  console.log('Processed allImages:', lastEntry.allImages);
  
  // Try to parse the Images field manually
  if (lastEntry.Images) {
    console.log('Manual Image URL split:', lastEntry.Images.split(';'));
  }
  
  // Check data types
  console.log('Data types:', {
    ImagesType: typeof lastEntry.Images,
    VorschaubildType: typeof lastEntry.Vorschaubild,
    ImagesIsNull: lastEntry.Images === null,
    ImagesIsUndefined: lastEntry.Images === undefined,
    VorschaubildIsNull: lastEntry.Vorschaubild === null,
    VorschaubildIsUndefined: lastEntry.Vorschaubild === undefined
  });
  console.groupEnd();

  // Log sample of processed entries
  console.group('Sample Processed Entries');
  withImages.slice(0, 5).forEach((prop, index) => {
    console.group(`Property ${index + 1}`);
    console.log('Link:', prop.Link);
    console.log('Preview Image:', prop.Vorschaubild);
    console.log('Image List:', prop.Images);
    console.log('All Images:', prop.allImages);
    console.log('Raw Image Data:', {
      Vorschaubild: prop.Vorschaubild,
      Images: prop.Images
    });
    console.groupEnd();
  });
  console.groupEnd();

  console.group('Sample Properties WITHOUT Images');
  withoutImages.slice(0, 2).forEach((prop, index) => {
    console.group(`Property ${index + 1}`);
    console.log('Link:', prop.Link);
    console.log('Raw Image Data:', {
      Vorschaubild: prop.Vorschaubild,
      Images: prop.Images
    });
    console.groupEnd();
  });
  console.groupEnd();

  // Add raw data inspection
  console.group('Raw Data Inspection');
  console.log('CSV Headers:', Object.keys(data[0] || {}));
  console.log('Sample Raw Image URLs (last entry):', {
    raw: lastEntry.Images,
    split: lastEntry.Images?.split(';'),
    cleaned: lastEntry.Images?.split(';').map(cleanImageUrl)
  });
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
        
        // Log a sample of the raw CSV text
        console.log('Raw CSV sample:', text.slice(0, 500));

        const parsedData = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transform: (value, field) => {
            if (
              typeof value === "string" &&
              (field === "Latitude" || field === "Longitude")
            ) {
              return parseFloat(value.replace(",", "."));
            }
            return value;
          },
        });

        // Log the first few rows of parsed data
        console.log('First few rows of parsed data:', parsedData.data.slice(0, 3));

        const cleanedData = parsedData.data
          .filter((row: PropertyData) =>
            row.Preis_cleaned &&
            !isNaN(row.Preis_cleaned) &&
            row.Latitude &&
            row.Longitude
          )
          .map((row: PropertyData) => {
            // Log sample of raw data before processing
            if (Math.random() < 0.01) {
              console.log('Raw row data before processing:', {
                Images: row.Images,
                Vorschaubild: row.Vorschaubild
              });
            }
            
            return processImageData({
              ...row,
              Latitude: typeof row.Latitude === "string"
                ? parseFloat(row.Latitude.replace(",", "."))
                : row.Latitude,
              Longitude: typeof row.Longitude === "string"
                ? parseFloat(row.Longitude.replace(",", "."))
                : row.Longitude,
            });
          });

        // Log the first few processed items
        console.log('First 3 processed items:', cleanedData.slice(0, 3));

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

        analyzeImageData(cleanedData);
        setData(cleanedData);
        setPropertyTypes(types);
        setRanges(newRanges);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        console.error("Data processing failed. Please check:");
        console.error("- CSV format and accessibility");
        console.error("- Coordinate field names");
        console.error("- Number format handling");
        console.error("Full error:", error);
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
    <Router basename="/ImmoCollectTrier">
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
