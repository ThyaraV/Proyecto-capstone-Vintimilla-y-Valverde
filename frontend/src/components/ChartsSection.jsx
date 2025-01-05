// src/components/ChartsSection.jsx
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Definir colores para el gráfico de medicamentos
const COLORS = ['#12939A', '#79C7E3'];

const ChartsSection = ({ treatments, completedActivities, medications }) => {
  // KPI Data
  const totalTreatments = treatments.length;
  const completedTreatments = treatments.filter(
    (t) => t.progress === 'empeorando' || t.progress === 'mejorando'
  ).length;
  const treatmentCompletionRate =
    totalTreatments > 0
      ? ((completedTreatments / totalTreatments) * 100).toFixed(2)
      : 0;

  const totalActivities = completedActivities.length;
  const uniqueActivities = [
    ...new Set(completedActivities.map((a) => a.activity.name)),
  ].length;

  const totalMedications = medications.length;
  const medicationsTaken = medications.filter((m) => m.taken).length; // Suponiendo que hay un campo 'taken'

  const medicationsComplianceRate =
    totalMedications > 0
      ? ((medicationsTaken / totalMedications) * 100).toFixed(2)
      : 0;

  // Gráfico de Progreso de Tratamientos
  const treatmentProgressData = treatments.map((treatment) => ({
    name: treatment.treatmentName,
    Adherencia: treatment.adherence, // Usando adherencia como métrica de progreso
  }));

  // Gráfico de Actividades Completadas
  const activitiesData = completedActivities.map((activity) => ({
    name: activity.activity.name,
    Score: activity.scoreObtained || 0,
  }));

  // Gráfico de Medicamentos
  const medicationsData = [
    { name: 'Tomados', value: medicationsTaken },
    { name: 'Pendientes', value: totalMedications - medicationsTaken },
  ];

  return (
    <div>
      {/* Gráfico de Progreso de Tratamientos */}
      <Card style={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Progreso de Tratamientos
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={treatmentProgressData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: 'Adherencia (%)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip />
              <Bar dataKey="Adherencia" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Actividades Completadas */}
      <Card style={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Actividades Completadas
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={activitiesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: 'Score Obtained',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip />
              <Bar dataKey="Score" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Cumplimiento de Medicamentos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cumplimiento de Medicamentos
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
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
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;
