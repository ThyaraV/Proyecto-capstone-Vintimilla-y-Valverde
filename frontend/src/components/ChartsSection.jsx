// src/components/ChartsSection.jsx

import React, { useMemo } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Definir colores para el gráfico de medicamentos
const COLORS = ['#12939A', '#79C7E3', '#FFBB28', '#FF8042', '#0088FE', '#00C49F', '#FF6666', '#9966FF'];

const ChartsSection = ({ treatments, completedActivities, medications }) => {
  // Preparar datos para el Gráfico de Progreso de Tratamientos
  const treatmentProgressData = useMemo(() => {
    if (!treatments || treatments.length === 0) return [];
    return treatments.map((treatment) => ({
      name: treatment.treatmentName || 'Sin Nombre',
      Adherencia: treatment.adherence || 0, // Asegurar que no sea undefined
    }));
  }, [treatments]);

  // Preparar datos para el Gráfico de Actividades Completadas
  const activitiesData = useMemo(() => {
    if (!completedActivities || completedActivities.length === 0) return [];
    const activityMap = {};

    completedActivities.forEach((activity) => {
      const name = activity.activity.name || 'Sin Nombre';
      const score = activity.scoreObtained || 0;
      if (activityMap[name]) {
        activityMap[name] += score;
      } else {
        activityMap[name] = score;
      }
    });

    return Object.keys(activityMap).map((name) => ({
      name,
      Score: activityMap[name],
    }));
  }, [completedActivities]);

  // Preparar datos para el Gráfico de Cumplimiento de Medicamentos
  const medicationsData = useMemo(() => {
    if (!medications || medications.length === 0) return [];
    return [
      { name: 'Tomados', value: medications.filter((m) => m.takenToday).length },
      { name: 'Pendientes', value: medications.filter((m) => !m.takenToday).length },
    ];
  }, [medications]);

  return (
    <div>
      {/* Gráfico de Progreso de Tratamientos */}
      {treatmentProgressData.length === 0 ? (
        <Typography>No hay datos para el Gráfico de Progreso de Tratamientos.</Typography>
      ) : (
        <Card style={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progreso de Tratamientos
            </Typography>
            <div
              className="bar-chart-container"
              style={{
                width: '100%',
                height: 300,
                overflowX: 'auto',
              }}
            >
              <BarChart
                width={Math.max(600, treatments.length * 100)} // Ajustar el ancho según el número de tratamientos
                height={300}
                data={treatmentProgressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis
                  label={{
                    value: 'Adherencia (%)',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                  domain={[0, 100]}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="Adherencia" fill="#8884d8" />
              </BarChart>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Actividades Completadas */}
      {activitiesData.length === 0 ? (
        <Typography>No hay datos para el Gráfico de Actividades Completadas.</Typography>
      ) : (
        <Card style={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Actividades Completadas
            </Typography>
            <BarChart
              width={600}
              height={300}
              data={activitiesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis
                label={{
                  value: 'Score Obtenido',
                  angle: -90,
                  position: 'insideLeft',
                }}
                domain={[0, 'auto']}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="Score" fill="#82ca9d" />
            </BarChart>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Cumplimiento de Medicamentos */}
      {medicationsData.length === 0 ? (
        <Typography>No hay datos para el Gráfico de Cumplimiento de Medicamentos.</Typography>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cumplimiento de Medicamentos
            </Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={medicationsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {medicationsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChartsSection;
