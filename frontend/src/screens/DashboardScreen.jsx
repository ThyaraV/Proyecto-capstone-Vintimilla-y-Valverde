// src/screens/DashboardScreen.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Grid,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Box,
} from '@mui/material';
import {
  useGetTreatmentsByMultiplePatientsMutation,
} from '../slices/treatmentSlice';
import { useGetDoctorWithPatientsQuery } from '../slices/doctorApiSlice';
import KPICard from '../components/KPICard';
import ChartsSection from '../components/ChartsSection';
import { useSnackbar } from 'notistack';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const DashboardContent = () => {
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: doctorPatients,
    isLoading: isLoadingPatients,
    isError: isErrorPatients,
    error: errorPatients,
  } = useGetDoctorWithPatientsQuery();

  const patients = useMemo(() => {
    if (!doctorPatients) return [];
    return doctorPatients.map(patient => ({
      ...patient,
      _id: patient._id.toString(),
    }));
  }, [doctorPatients]);

  const [selectedPatients, setSelectedPatients] = useState([]);
  const [treatmentStatus, setTreatmentStatus] = useState('all');

  const handlePatientChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedPatients(
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const handleStatusChange = (event) => {
    setTreatmentStatus(event.target.value);
  };

  const [fetchTreatments, { data: treatmentsData, isLoading: isLoadingTreatments, isError: isErrorTreatments, error: errorTreatments }] = useGetTreatmentsByMultiplePatientsMutation();

  useEffect(() => {
    if (doctorPatients && selectedPatients.length === 0) {
      const allPatientIds = doctorPatients.map(patient => patient._id.toString());
      setSelectedPatients(allPatientIds);
    }
  }, [doctorPatients, selectedPatients.length]);

  useEffect(() => {
    if (selectedPatients.length > 0) {
      fetchTreatments({ patientIds: selectedPatients })
        .unwrap()
        .then((data) => {
          // Tratamientos recibidos
        })
        .catch((error) => {
          enqueueSnackbar(`Error: ${error.data?.message || error.error}`, { variant: 'error' });
        });
    }
  }, [selectedPatients, fetchTreatments, enqueueSnackbar]);

  const filteredTreatments = useMemo(() => {
    if (!treatmentsData) return [];

    let filtered = treatmentsData;

    if (treatmentStatus === 'active') {
      filtered = filtered.filter((treatment) => treatment.active === true);
    } else if (treatmentStatus === 'inactive') {
      filtered = filtered.filter((treatment) => treatment.active === false);
    }

    return filtered;
  }, [treatmentsData, treatmentStatus]);

  const totalTreatments = filteredTreatments.length;
  const activeTreatments = filteredTreatments.filter(t => t.active).length;
  const inactiveTreatments = filteredTreatments.filter(t => !t.active).length;

  const totalPatients = patients.length;
  const selectedPatientsCount = selectedPatients.length;

  if (isLoadingPatients || (selectedPatients.length > 0 && isLoadingTreatments)) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <CircularProgress />
        <Typography variant="h6">Cargando datos del Dashboard...</Typography>
      </Container>
    );
  }

  if (isErrorPatients || isErrorTreatments) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography variant="h6" color="error">
          Hubo un error al cargar los datos del Dashboard: {errorPatients?.data?.message || errorTreatments?.data?.message || "Ocurrió un problema inesperado"}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Sección de Filtros */}
      <Box mb={3}>
        <Grid container spacing={2}>
          {/* Filtro por Paciente */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="patient-select-label">Filtrar por Paciente</InputLabel>
              <Select
                labelId="patient-select-label"
                multiple
                value={selectedPatients}
                onChange={handlePatientChange}
                input={<OutlinedInput label="Filtrar por Paciente" />}
                renderValue={(selected) =>
                  selected
                    .map((id) => {
                      const patient = patients.find((p) => p._id === id);
                      return patient ? `${patient.user.name} ${patient.user.lastName}` : id;
                    })
                    .join(', ')
                }
                MenuProps={MenuProps}
              >
                {patients.map((patient) => (
                  <MenuItem key={patient._id} value={patient._id}>
                    <Checkbox checked={selectedPatients.indexOf(patient._id) > -1} />
                    <ListItemText primary={`${patient.user.name} ${patient.user.lastName}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro por Estado del Tratamiento */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Estado del Tratamiento</InputLabel>
              <Select
                labelId="status-select-label"
                value={treatmentStatus}
                onChange={handleStatusChange}
                label="Estado del Tratamiento"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Sección de KPIs */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Total Pacientes"
            value={totalPatients}
            subtitle="Número total de pacientes asignados"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Tratamientos Activos"
            value={activeTreatments}
            subtitle="Número de tratamientos activos"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Tratamientos Inactivos"
            value={inactiveTreatments}
            subtitle="Número de tratamientos inactivos"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Pacientes Seleccionados"
            value={selectedPatientsCount}
            subtitle="Número de pacientes seleccionados"
          />
        </Grid>
      </Grid>

      {/* Sección de Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartsSection
            title="Distribución de Tratamientos"
            data={filteredTreatments}
            type="pie"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartsSection
            title="Tratamientos por Paciente"
            data={filteredTreatments}
            type="bar"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

const DashboardScreen = () => (
  <DashboardContent />
);

export default DashboardScreen;
