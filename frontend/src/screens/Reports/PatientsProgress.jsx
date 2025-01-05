// src/screens/Reports/PatientsProgress.jsx
import React from 'react';
import { Container, Grid, CircularProgress, Typography } from '@mui/material';
import {
  useGetActiveTreatmentQuery,
  useGetCompletedActivitiesByTreatmentQuery,
  useGetMyMedicationsQuery,
} from '../../slices/treatmentSlice'; // Asegúrate de que la ruta es correcta
import KPICard from '../../components/KPICard';
import ChartsSection from '../../components/ChartsSection';
import ActivitiesList from '../../components/ActivitiesList';
import MedicationsList from '../../components/MedicationsList';
import useAuth from '../../hooks/useAuth';
import { SnackbarProvider, useSnackbar } from 'notistack';

const PatientsProgressContent = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const userId = user?._id;

  // Obtener el tratamiento activo del usuario
  const {
    data: activeTreatment,
    isLoading: isLoadingTreatment,
    isError: isErrorTreatment,
    error: errorTreatment,
  } = useGetActiveTreatmentQuery(userId, {
    skip: !userId,
  });

  // Obtener actividades completadas del tratamiento activo
  const {
    data: completedActivities,
    isLoading: isLoadingActivities,
    isError: isErrorActivities,
    error: errorActivities,
  } = useGetCompletedActivitiesByTreatmentQuery(activeTreatment?._id, {
    skip: !activeTreatment,
  });

  // Obtener medicamentos del tratamiento activo
  const {
    data: medications,
    isLoading: isLoadingMedications,
    isError: isErrorMedications,
    error: errorMedications,
  } = useGetMyMedicationsQuery();

  // Manejo de estados de carga y error
  if (isLoadingTreatment || isLoadingActivities || isLoadingMedications) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <CircularProgress />
        <Typography variant="h6">Cargando datos del dashboard...</Typography>
      </Container>
    );
  }

  if (isErrorTreatment || isErrorActivities || isErrorMedications) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography variant="h6" color="error">
          Hubo un error al cargar los datos del dashboard: {errorTreatment?.data?.message || errorActivities?.data?.message || errorMedications?.data?.message}
        </Typography>
      </Container>
    );
  }

  // Preparar datos para los KPIs
  const totalTreatments = activeTreatment ? 1 : 0; // Suponiendo un solo tratamiento activo
  const treatmentCompletionRate = activeTreatment ? activeTreatment.adherence : 0;

  const totalActivities = completedActivities ? completedActivities.length : 0;
  const uniqueActivities = completedActivities ? [...new Set(completedActivities.map(a => a.activity.name))].length : 0;

  const totalMedications = medications ? medications.length : 0;
  const medicationsTaken = medications ? medications.filter(m => m.takenToday).length : 0;
  const medicationsComplianceRate = totalMedications > 0 ? ((medicationsTaken / totalMedications) * 100).toFixed(2) : 0;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard de Progreso del Paciente
      </Typography>
      <Grid container spacing={3}>
        {/* KPIs */}
        <Grid item xs={12} md={4}>
          <KPICard
            title="Adherencia del Tratamiento"
            value={`${treatmentCompletionRate}%`}
            subtitle="Nivel de adherencia al tratamiento"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard
            title="Actividades Completadas"
            value={`${totalActivities}`}
            subtitle={`Actividades únicas: ${uniqueActivities}`}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard
            title="Cumplimiento de Medicamentos"
            value={`${medicationsComplianceRate}%`}
            subtitle={`${medicationsTaken}/${totalMedications} tomados`}
          />
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} md={6}>
          <ChartsSection
            treatments={activeTreatment ? [activeTreatment] : []}
            completedActivities={completedActivities || []}
            medications={medications || []}
          />
        </Grid>

        {/* Listados */}
        <Grid item xs={12} md={6}>
          <ActivitiesList activities={activeTreatment ? activeTreatment.assignedActivities : []} />
          <MedicationsList
            medications={medications || []}
            treatmentId={activeTreatment ? activeTreatment._id : null}
            onMedicationTaken={() => enqueueSnackbar('Medicamento marcado como tomado', { variant: 'success' })}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

const PatientsProgress = () => (
  <SnackbarProvider maxSnack={3}>
    <PatientsProgressContent />
  </SnackbarProvider>
);

export default PatientsProgress;
