// src/screens/DashboardScreen.jsx
import React from 'react';
import { Typography, Container } from '@mui/material';

const DashboardScreen = () => {
  return (
    <Container maxWidth="lg" style={{ padding: '2rem 0' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" align="center">
        Bienvenido al Dashboard. Aquí puedes ver un resumen de tus reportes y actividades.
      </Typography>
    </Container>
  );
};

export default DashboardScreen;
