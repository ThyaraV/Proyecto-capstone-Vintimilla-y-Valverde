// frontend/src/screens/DashboardScreen.jsx
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
  Button,
  Modal,
} from '@mui/material';
import {
  useGetTreatmentsByMultiplePatientsMutation,
} from '../slices/treatmentSlice';
import { useGetDoctorWithPatientsQuery } from '../slices/doctorApiSlice';
import {
  useGetMoodsByDateQuery, // Hook para obtener moods por fecha
} from '../slices/moodApiSlice';
import KPICard from '../components/KPICard';
import ChartsSection from '../components/ChartsSection';
import { useSnackbar } from 'notistack';
import { FaSmile, FaAngry, FaMeh, FaLaugh, FaFrown, FaSurprise } from 'react-icons/fa'; // Iconos para diferentes estados de ánimo

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

const moodIcons = {
  'Feliz': <FaSmile color="#FFD700" />,
  'Triste': <FaFrown color="#1E90FF" />,
  'Enojado': <FaAngry color="#FF4500" />,
  'Neutral': <FaMeh color="#808080" />,
  'Sorprendido': <FaSurprise color="#FF69B4" />,
  'Contento': <FaLaugh color="#32CD32" />,
  // Agrega más estados de ánimo según sea necesario
};

const DashboardContent = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Hooks para obtener pacientes y tratamientos
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

  // Hooks para obtener estados de ánimo
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  });

  const {
    data: moodsData,
    isLoading: isLoadingMoods,
    isError: isErrorMoods,
    error: errorMoods,
  } = useGetMoodsByDateQuery(selectedDate, {
    skip: selectedDate === null,
  });

  const moodSummary = useMemo(() => {
    if (!moodsData) return {};

    return moodsData.reduce((acc, moodEntry) => {
      acc[moodEntry.mood] = (acc[moodEntry.mood] || 0) + 1;
      return acc;
    }, {});
  }, [moodsData]);

  const [openMoodModal, setOpenMoodModal] = useState(false);
  const [currentMood, setCurrentMood] = useState('');
  const [patientsWithMood, setPatientsWithMood] = useState([]);

  const handleMoodClick = (mood) => {
    setCurrentMood(mood);
    const filteredPatients = moodsData
      .filter(moodEntry => moodEntry.mood === mood)
      .map(moodEntry => moodEntry.patient);
    setPatientsWithMood(filteredPatients);
    setOpenMoodModal(true);
  };

  const handleCloseModal = () => {
    setOpenMoodModal(false);
    setCurrentMood('');
    setPatientsWithMood([]);
  };

  // Manejo de estados de carga y error para el Dashboard
  const isLoadingDashboard = isLoadingPatients || isLoadingTreatments || isLoadingMoods;
  const isErrorDashboard = isErrorPatients || isErrorTreatments || isErrorMoods;

  if (isLoadingDashboard) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <CircularProgress />
        <Typography variant="h6">Cargando datos del Dashboard...</Typography>
      </Container>
    );
  }

  if (isErrorDashboard) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography variant="h6" color="error">
          Hubo un error al cargar los datos del Dashboard: {errorPatients?.data?.message || errorTreatments?.data?.message || errorMoods?.data?.message || "Ocurrió un problema inesperado"}
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
      <Grid container spacing={3} mb={3}>
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

      {/* Sección de Estado de Ánimo de Pacientes */}
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>
          Estado de Ánimo de Pacientes el Día de Hoy
        </Typography>
        {/* Selector de Fecha */}
        <FormControl fullWidth mb={2}>
          <InputLabel id="date-select-label">Seleccionar Fecha</InputLabel>
          <Select
            labelId="date-select-label"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            label="Seleccionar Fecha"
          >
            {/* Puedes agregar más opciones o usar un DatePicker para mayor flexibilidad */}
            <MenuItem value={new Date().toISOString().split('T')[0]}>Hoy</MenuItem>
            <MenuItem value={new Date(Date.now() - 86400000).toISOString().split('T')[0]}>Ayer</MenuItem>
            {/* Agrega más fechas según tus necesidades */}
          </Select>
        </FormControl>

        {/* Resumen de Estados de Ánimo */}
        <Grid container spacing={2}>
          {Object.entries(moodSummary).map(([mood, count]) => (
            <Grid item xs={12} sm={6} md={4} key={mood}>
              <Box
                onClick={() => handleMoodClick(mood)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: '#e0e0e0',
                  },
                }}
              >
                <Box sx={{ fontSize: '24px', marginRight: '10px' }}>
                  {moodIcons[mood] || <FaSmile />}
                </Box>
                <Box>
                  <Typography variant="h6">{mood}</Typography>
                  <Typography variant="subtitle1">{count} paciente{count > 1 ? 's' : ''}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Modal para Mostrar Pacientes por Estado de Ánimo */}
      <Modal
        open={openMoodModal}
        onClose={handleCloseModal}
        aria-labelledby="mood-patients-modal-title"
        aria-describedby="mood-patients-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Typography id="mood-patients-modal-title" variant="h6" component="h2" gutterBottom>
            Pacientes con estado de ánimo: {currentMood}
          </Typography>
          {patientsWithMood.length > 0 ? (
            <ul>
              {patientsWithMood.map((patient) => (
                <li key={patient._id}>
                  {patient.user.name} {patient.user.lastName}
                </li>
              ))}
            </ul>
          ) : (
            <Typography>No hay pacientes con este estado de ánimo.</Typography>
          )}
          <Box textAlign="right" mt={2}>
            <Button variant="contained" onClick={handleCloseModal}>Cerrar</Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

const DashboardScreen = () => (
  <DashboardContent />
);

export default DashboardScreen;
