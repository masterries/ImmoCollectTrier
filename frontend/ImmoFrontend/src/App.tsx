// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Papa from 'papaparse';
import { FilterProvider } from './contexts/FilterContext';
import DashboardPage from './pages/DashboardPage';
import PropertyListPage from './pages/PropertyListPage';
import AnalyticsPage from './pages/AnalyticsPage';
import type { PropertyData, DataRanges } from './types';

function App() {
  const [data, setData] = useState<PropertyData[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [ranges, setRanges] = useState<DataRanges>({
    price: { min: 0, max: 1000000 },
    pricePerSqm: { min: 0, max: 5000 },
    livingSpace: { min: 0, max: 500 },
    plotSize: { min: 0, max: 2000 },
    rooms: { min: 0, max: 10 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/masterries/ImmoCollectTrier/refs/heads/main/data/miete_trier50km_detailed2.csv');
        const text = await response.text();
        const parsedData = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transform: (value, field) => {
            // Convert German number format (comma as decimal separator) to English format
            if (typeof value === 'string' && (field === 'Latitude' || field === 'Longitude')) {
              return parseFloat(value.replace(',', '.'));
            }
            return value;
          }
        });

        const cleanedData = parsedData.data
          .filter((row: PropertyData) => 
            row.Preis_cleaned && 
            !isNaN(row.Preis_cleaned) &&
            row.Latitude &&
            row.Longitude
          )
          .map((row: PropertyData) => ({
            ...row,
            // Ensure latitude and longitude are proper numbers
            latitude: typeof row.Latitude === 'string' ? parseFloat(row.Latitude.replace(',', '.')) : row.Latitude,
            longitude: typeof row.Longitude === 'string' ? parseFloat(row.Longitude.replace(',', '.')) : row.Longitude
          }));

        // Extract property types
        const types = [...new Set(cleanedData
          .map(row => row.Beschreibung?.split(' ')[0])
          .filter(Boolean))];

        // Calculate ranges
        const newRanges = {
          price: {
            min: Math.min(...cleanedData.map(d => d.Preis_cleaned)),
            max: Math.max(...cleanedData.map(d => d.Preis_cleaned))
          },
          pricePerSqm: {
            min: Math.min(...cleanedData.map(d => d.Preis_pro_qm).filter(Boolean)),
            max: Math.max(...cleanedData.map(d => d.Preis_pro_qm).filter(Boolean))
          },
          livingSpace: {
            min: Math.min(...cleanedData.map(d => d.Wohnfläche).filter(Boolean)),
            max: Math.max(...cleanedData.map(d => d.Wohnfläche).filter(Boolean))
          },
          plotSize: {
            min: Math.min(...cleanedData.map(d => d.Grundstücksfläche).filter(Boolean)),
            max: Math.max(...cleanedData.map(d => d.Grundstücksfläche).filter(Boolean))
          },
          rooms: {
            min: Math.min(...cleanedData.map(d => d.Zimmer).filter(Boolean)),
            max: Math.max(...cleanedData.map(d => d.Zimmer).filter(Boolean))
          }
        };

        setData(cleanedData);
        setPropertyTypes(types);
        setRanges(newRanges);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Log more details about the data processing
        console.error('Data processing failed. Please check:');
        console.error('- CSV format and accessibility');
        console.error('- Coordinate field names (should be Lat and Lon)');
        console.error('- Number format handling');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        Loading...
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
              loading ? (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
                  Loading...
                </div>
              ) : (
                <DashboardPage data={data} propertyTypes={propertyTypes} ranges={ranges} />
              )
            } 
          />
          <Route 
            path="/list" 
            element={
              loading ? (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
                  Loading...
                </div>
              ) : (
                <PropertyListPage data={data} />
              )
            } 
          />
          <Route 
            path="/analytics" 
            element={
              loading ? (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
                  Loading...
                </div>
              ) : (
                <AnalyticsPage 
                  data={data} 
                  propertyTypes={propertyTypes} 
                  ranges={ranges} 
                />
              )
            } 
          />
        </Routes>
      </FilterProvider>
    </Router>
  );
}

export default App;