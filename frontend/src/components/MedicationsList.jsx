// src/components/MedicationsList.js
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { useTakeMedicationMutation } from '../slices/treatmentSlice.js'; // Ajusta la ruta según tu estructura

const MedicationsList = ({ medications, treatmentId }) => {
  const [takeMedication] = useTakeMedicationMutation();

  const handleTakeMedication = async (medicationId) => {
    try {
      await takeMedication({ treatmentId, medicationId }).unwrap();
      // Opcional: Mostrar una notificación de éxito
    } catch (error) {
      // Opcional: Manejar el error, mostrar una notificación
      console.error('Error al marcar medicamento como tomado:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Medicamentos
        </Typography>
        <List>
          {medications.map((med) => (
            <ListItem key={med._id} divider>
              <ListItemText
                primary={med.name}
                secondary={`Dosis: ${med.dosage} | Frecuencia: ${med.frequency} | Inicio: ${new Date(
                  med.startDate
                ).toLocaleDateString()}${med.endDate ? ` | Fin: ${new Date(med.endDate).toLocaleDateString()}` : ''}`}
              />
              {!med.takenToday && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleTakeMedication(med._id)}
                >
                  Tomado
                </Button>
              )}
              {med.takenToday && (
                <Typography variant="body2" color="green">
                  Tomado hoy
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default MedicationsList;
