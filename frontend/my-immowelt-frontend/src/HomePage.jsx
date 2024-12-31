import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  Grid,
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, TableContainer, CircularProgress, Typography
} from '@mui/material';

import { DeckGL } from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre'; // Since deck.gl v8.8+
import { ColumnLayer } from '@deck.gl/layers';

// We'll use a free MapLibre style that doesn't require a token
const MAP_STYLE = 'https://demotiles.maplibre.org/style.json';

// CSV source from your GitHub raw link
const CSV_URL =
  'https://raw.githubusercontent.com/masterries/ImmoCollectTrier/refs/heads/main/data/miete_trier50km_detailed2.csv';

// Starting viewpoint near Trier, Germany
const INITIAL_VIEW_STATE = {
  latitude: 49.75,
  longitude: 6.64,
  zoom: 10,
  pitch: 45,  // Tilt the map for a more 3D look
  bearing: 0
};

function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Parse CSV from GitHub raw
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

  // Filter only rows with valid lat/long
  const pointData = listings
    .map((row) => {
      const lat = parseFloat(row.Latitude);
      const lng = parseFloat(row.Longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        // Convert strings to float, e.g. "Preis_cleaned" or "Preis_pro_qm"
        const preisProQM = row.Preis_pro_qm ? parseFloat(row.Preis_pro_qm) : 0;
        return {
          ...row,
          lat,
          lng,
          preisProQM
        };
      }
      return null;
    })
    .filter((d) => d !== null);

  // 2) Create a deck.gl layer (3D ColumnLayer example)
  //    We extrude a small cylinder at each listing location,
  //    using "Preis_pro_qm" (if present) as the column height
  const columnLayer = new ColumnLayer({
    id: 'column-layer',
    data: pointData,
    diskResolution: 8,         // how many sides the cylinder has
    radius: 500,               // radius in meters
    extruded: true,
    pickable: true,
    elevationScale: 1,         // scale the column height if it's too tall or short
    getPosition: (d) => [d.lng, d.lat],
    getFillColor: (d) => [200, 0, 0, 180], // RGBA
    getElevation: (d) => (d.preisProQM > 0 ? d.preisProQM : 100),
    onHover: (info, event) => {
      // Optional: show a tooltip, etc.
    },
    onClick: (info, event) => {
      // Optional: handle click on a column
      if (info.object) {
        alert(`Clicked on: ${info.object.Beschreibung}\nPreis/m²: ${info.object.preisProQM}`);
      }
    }
  });

  // 3) The layers array can hold multiple deck.gl layers if you want more
  const layers = [columnLayer];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <CircularProgress />
        <Typography>Loading data...</Typography>
      </div>
    );
  }

  if (!listings.length) {
    return <Typography>No data found in CSV.</Typography>;
  }

  return (
    <Grid container spacing={2} style={{ marginTop: '1rem' }}>
      {/* LEFT: Table of data */}
      <Grid item xs={12} md={6}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Link</b></TableCell>
                <TableCell><b>Preis</b></TableCell>
                <TableCell><b>Zimmer</b></TableCell>
                <TableCell><b>Adresse</b></TableCell>
                <TableCell><b>Latitude</b></TableCell>
                <TableCell><b>Longitude</b></TableCell>
                <TableCell><b>Preis_pro_qm</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <a href={item.Link} target="_blank" rel="noopener noreferrer">
                      {item.Link}
                    </a>
                  </TableCell>
                  <TableCell>{item.Preis}</TableCell>
                  <TableCell>{item.Zimmer}</TableCell>
                  <TableCell>{item.Adresse}</TableCell>
                  <TableCell>{item.Latitude}</TableCell>
                  <TableCell>{item.Longitude}</TableCell>
                  <TableCell>{item.Preis_pro_qm}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* RIGHT: DeckGL 3D Map */}
      <Grid item xs={12} md={6} style={{ height: '600px' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={layers}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          >
            <Map
              reuseMaps
              mapLib={import('maplibre-gl')} // dynamically import maplibre-gl
              mapStyle={MAP_STYLE}
            />
          </DeckGL>
        </div>
      </Grid>
    </Grid>
  );
}

export default HomePage;
