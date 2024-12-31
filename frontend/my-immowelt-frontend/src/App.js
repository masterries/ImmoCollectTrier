import React from 'react';
import { Container, Typography } from '@mui/material';
import HomePage from './HomePage';

function App() {
  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        3D Deck.GL Map (No API Key!)
      </Typography>
      <HomePage />
    </Container>
  );
}

export default App;
