import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, TableContainer, CircularProgress, Typography
} from '@mui/material';

const CSV_URL = 'https://raw.githubusercontent.com/masterries/ImmoCollectTrier/refs/heads/main/data/miete_trier50km_detailed2.csv';

const HomePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse CSV from GitHub raw URL
    Papa.parse(CSV_URL, {
      download: true,
      header: true,       // Use the first row as header
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
    <TableContainer component={Paper} style={{ marginTop: '1rem' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Link</b></TableCell>
            <TableCell><b>Preis</b></TableCell>
            <TableCell><b>Beschreibung</b></TableCell>
            <TableCell><b>Adresse</b></TableCell>
            <TableCell><b>Latitude</b></TableCell>
            <TableCell><b>Longitude</b></TableCell>
            <TableCell><b>Zimmer</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listings.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>
                {/* Make the link clickable */}
                <a href={item.Link} target="_blank" rel="noopener noreferrer">
                  {item.Link}
                </a>
              </TableCell>
              <TableCell>{item.Preis}</TableCell>
              <TableCell>{item.Beschreibung}</TableCell>
              <TableCell>{item.Adresse}</TableCell>
              <TableCell>{item.Latitude}</TableCell>
              <TableCell>{item.Longitude}</TableCell>
              <TableCell>{item.Zimmer}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HomePage;
