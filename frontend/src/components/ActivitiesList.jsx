// src/components/ActivitiesList.js
import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

const ActivitiesList = ({ activities }) => {
  return (
    <Card style={{ marginBottom: '20px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Actividades Asignadas
        </Typography>
        <List>
          {activities.map((activity) => (
            <ListItem key={activity._id}>
              <ListItemText
                primary={activity.name}
                secondary={`Descripción: ${activity.description}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ActivitiesList;
