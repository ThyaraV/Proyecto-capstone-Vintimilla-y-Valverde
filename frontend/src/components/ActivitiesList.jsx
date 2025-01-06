// src/components/ActivitiesList.jsx

import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

const ActivitiesList = ({ activities }) => {
  console.log('Actividades Completadas:', activities); // Para depuración

  return (
    <Card style={{ marginBottom: '20px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Actividades Completadas
        </Typography>
        {(!activities || activities.length === 0) ? (
          <Typography variant="body1">No hay actividades completadas.</Typography>
        ) : (
          <List>
            {activities.map((activity) => {
              // Verificar si 'activity' y 'activity.activity' están definidos
              if (!activity || !activity.activity) {
                console.warn('Actividad incompleta:', activity);
                return (
                  <ListItem key={activity._id || Math.random()} divider>
                    <ListItemText
                      primary="Actividad Desconocida"
                      secondary={`Paciente: ${activity?.patient?.idPaciente || 'N/A'} - ${activity?.patient?.user?.name || 'N/A'} ${activity?.patient?.user?.lastName || 'N/A'} | Score: ${activity?.scoreObtained || 'N/A'} | Progreso: ${activity?.progress || 'N/A'}`}
                    />
                  </ListItem>
                );
              }

              // Verificar si 'activity.activity.name' está definido
              if (!activity.activity.name) {
                console.warn('Nombre de actividad faltante:', activity.activity);
                return (
                  <ListItem key={activity._id || Math.random()} divider>
                    <ListItemText
                      primary="Nombre de Actividad Desconocido"
                      secondary={`Paciente: ${activity.patient.idPaciente} - ${activity.patient.user.name} ${activity.patient.user.lastName} | Score: ${activity.scoreObtained} | Progreso: ${activity.progress}`}
                    />
                  </ListItem>
                );
              }

              return (
                <ListItem key={activity._id || `${activity.activity._id}-${activity.dateCompleted}`} divider>
                  <ListItemText
                    primary={activity.activity.name}
                    secondary={`Paciente: ${activity.patient.idPaciente} - ${activity.patient.user.name} ${activity.patient.user.lastName} | Score: ${activity.scoreObtained} | Progreso: ${activity.progress}`}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivitiesList;
