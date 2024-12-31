import React, { useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';
import {
  Grid,
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, TableContainer, CircularProgress, Typography
} from '@mui/material';

// MapLibre GL
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// CSV source from GitHub raw (adjust if needed)
const CSV_URL =
  'https://raw.githubusercontent.com/masterries/ImmoCollectTrier/refs/heads/main/data/miete_trier50km_detailed2.csv';

// Default map center near Trier, Germany
const DEFAULT_CENTER = [6.64, 49.75]; // [lng, lat]

const HomePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // We'll store the map instance and popup instance in refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    // 1) Load CSV from GitHub raw with Papa Parse
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setListings(results.data);
        setLoading(false);
      },
      error: (err) => {
        console.error('Error parsing CSV:', err);
        setLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    // 2) Initialize the map once listings are ready
    //    Only if we have not already created the map
    if (!loading && listings.length > 0 && !mapRef.current) {
      // Create map instance
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://demotiles.maplibre.org/style.json', // free MapLibre style
        center: DEFAULT_CENTER, // [lng, lat]
        zoom: 10,
      });

      // Add zoom/rotation controls in top-right corner
      mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Create a popup instance to reuse
      popupRef.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
      });

      // Add markers for each valid lat/lng
      listings.forEach((row) => {
        const lat = parseFloat(row.Latitude);
        const lng = parseFloat(row.Longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          const markerEl = document.createElement('div');
          // A simple custom marker - red circle:
          markerEl.style.width = '14px';
          markerEl.style.height = '14px';
          markerEl.style.backgroundColor = 'red';
          markerEl.style.border = '2px solid white';
          markerEl.style.borderRadius = '50%';
          markerEl.style.cursor = 'pointer';

          // Create the marker
          const marker = new maplibregl.Marker({ element: markerEl })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

          // On marker click, show popup
          markerEl.addEventListener('click', (e) => {
            e.stopPropagation();

            // Build HTML for popup
            const popupContent = document.createElement('div');
            popupContent.style.minWidth = '200px';

            const title = document.createElement('h4');
            title.textContent = row.Beschreibung || 'Keine Beschreibung';
            title.style.margin = '0 0 6px 0';
            popupContent.appendChild(title);

            const price = document.createElement('p');
            price.innerHTML = `<b>Preis:</b> ${row.Preis || 'N/A'}`;
            popupContent.appendChild(price);

            const address = document.createElement('p');
            address.innerHTML = `<b>Adresse:</b> ${row.Adresse || 'N/A'}`;
            popupContent.appendChild(address);

            if (row.Link) {
              const link = document.createElement('a');
              link.href = row.Link;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              link.textContent = 'Zum Exposé';
              popupContent.appendChild(link);
            }

            popupRef.current
              .setLngLat([lng, lat])
              .setDOMContent(popupContent)
              .addTo(mapRef.current);
          });
        }
      });
    }
  }, [loading, listings]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <CircularProgress />
        <Typography>Loading data...</Typography>
      </div>
    );
  }

  if (listings.length === 0) {
    return <Typography>No data found in CSV.</Typography>;
  }

  return (
    <Grid container spacing={2} style={{ marginTop: '1rem' }}>
      {/* LEFT: Data Table */}
      <Grid item xs={12} md={6}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Link</b></TableCell>
                <TableCell><b>Preis</b></TableCell>
                <TableCell><b>Beschreibung</b></TableCell>
                <TableCell><b>Adresse</b></TableCell>
                <TableCell><b>Latitude</b></TableCell>
                <TableCell><b>Longitude</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <a
                      href={item.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.Link}
                    </a>
                  </TableCell>
                  <TableCell>{item.Preis}</TableCell>
                  <TableCell>{item.Beschreibung}</TableCell>
                  <TableCell>{item.Adresse}</TableCell>
                  <TableCell>{item.Latitude}</TableCell>
                  <TableCell>{item.Longitude}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* RIGHT: MapLibre Map */}
      <Grid item xs={12} md={6} style={{ height: '600px' }}>
        <Paper style={{ height: '100%', position: 'relative' }}>
          {/* Container for the map */}
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '100%' }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomePage;
