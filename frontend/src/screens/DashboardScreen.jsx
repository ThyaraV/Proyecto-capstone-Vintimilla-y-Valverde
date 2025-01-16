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
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSnackbar } from 'notistack';

// Slices y Hooks necesarios (ajusta los imports a tu proyecto)
import { useGetDoctorWithPatientsQuery } from '../slices/doctorApiSlice';
import {
  useGetTreatmentsByMultiplePatientsMutation,
  useTakeMedicationMutation,
} from '../slices/treatmentSlice';
import { useGetMoodsByDateQuery } from '../slices/moodApiSlice';
import { useGetAllMocaSelfsQuery } from '../slices/mocaSelfApiSlice';

// Componentes auxiliares
import KPICard from '../components/KPICard';
import ChartsSection from '../components/ChartsSection';

// Íconos
import {
  FaSmile,
  FaAngry,
  FaMeh,
  FaLaugh,
  FaFrown,
  FaSurprise,
  FaMedkit,
  FaHeartbeat,
  FaTasks,
  FaUserClock,
  FaChartPie,
  FaChartLine,
} from 'react-icons/fa';
import { MdEventNote } from 'react-icons/md';

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

// Mapeo de íconos para estados de ánimo
const moodIcons = {
  Feliz: <FaSmile color="#FFD700" />,
  Triste: <FaFrown color="#1E90FF" />,
  Enojado: <FaAngry color="#FF4500" />,
  Neutral: <FaMeh color="#808080" />,
  Sorprendido: <FaSurprise color="#FF69B4" />,
  Contento: <FaLaugh color="#32CD32" />,
};

const DashboardScreen = () => {
  const { enqueueSnackbar } = useSnackbar();

  // ======================================================
  // 1. OBTENER LISTA DE PACIENTES (Doctor con Pacientes)
  // ======================================================
  const {
    data: doctorPatients,
    isLoading: isLoadingPatients,
    isError: isErrorPatients,
    error: errorPatients,
  } = useGetDoctorWithPatientsQuery();

  // Convertir doctorPatients a un array usable
  const patients = useMemo(() => {
    if (!doctorPatients) return [];
    return doctorPatients.map((patient) => ({
      ...patient,
      _id: patient._id.toString(),
    }));
  }, [doctorPatients]);

  // ======================================================
  // 2. FILTROS: Pacientes, Estado del Tratamiento, Fechas MoCA
  // ======================================================
  const [selectedPatients, setSelectedPatients] = useState(['ALL']); // Por defecto: "ALL"
  const [treatmentStatus, setTreatmentStatus] = useState('all');
  const [mocaStartDate, setMocaStartDate] = useState('');
  const [mocaEndDate, setMocaEndDate] = useState('');

  // Manejo del cambio en la lista de pacientes seleccionados
  const handlePatientChange = (event) => {
    const {
      target: { value },
    } = event;

    // Si el usuario elige "ALL", mantenemos "ALL" como único valor
    if (value.includes('ALL')) {
      setSelectedPatients(['ALL']);
    } else {
      // Si se deselecciona "ALL", filtrarlo
      setSelectedPatients(value.filter((v) => v !== 'ALL'));
    }
  };

  // Manejo del filtro de estado de tratamiento
  const handleStatusChange = (event) => {
    setTreatmentStatus(event.target.value);
  };

  // ======================================================
  // 3. OBTENER TRATAMIENTOS POR MÚLTIPLES PACIENTES
  // ======================================================
  const [
    fetchTreatments,
    {
      data: treatmentsData,
      isLoading: isLoadingTreatments,
      isError: isErrorTreatments,
      error: errorTreatments,
    },
  ] = useGetTreatmentsByMultiplePatientsMutation();

  // Cada vez que cambien los filtros (selectedPatients), recargamos tratamientos
  useEffect(() => {
    // Si "ALL" está seleccionado, obtener todos los IDs de pacientes
    if (selectedPatients.includes('ALL') && patients.length > 0) {
      const allIds = patients.map((p) => p._id.toString());
      fetchTreatments({ patientIds: allIds })
        .unwrap()
        .catch((error) => {
          enqueueSnackbar(`Error: ${error.data?.message || error.error}`, {
            variant: 'error',
          });
        });
    } else if (selectedPatients.length > 0 && !selectedPatients.includes('ALL')) {
      fetchTreatments({ patientIds: selectedPatients })
        .unwrap()
        .catch((error) => {
          enqueueSnackbar(`Error: ${error.data?.message || error.error}`, {
            variant: 'error',
          });
        });
    }
  }, [selectedPatients, patients, fetchTreatments, enqueueSnackbar]);

  // Filtrar por estado (activo / inactivo)
  const filteredTreatments = useMemo(() => {
    if (!treatmentsData) return [];
    let filtered = treatmentsData;
    if (treatmentStatus === 'active') {
      filtered = filtered.filter((t) => t.active === true);
    } else if (treatmentStatus === 'inactive') {
      filtered = filtered.filter((t) => t.active === false);
    }
    return filtered;
  }, [treatmentsData, treatmentStatus]);

  // ======================================================
  // 4. MÉTRICAS: Pacientes y Tratamientos
  // ======================================================
  const totalPatients = patients.length;
  const isAllSelected = selectedPatients.includes('ALL');
  const selectedPatientsCount = isAllSelected ? totalPatients : selectedPatients.length;

  const totalTreatments = filteredTreatments.length;
  const activeTreatments = filteredTreatments.filter((t) => t.active).length;
  const inactiveTreatments = filteredTreatments.filter((t) => !t.active).length;

  // ======================================================
  // 5. ESTADOS DE ÁNIMO
  // ======================================================
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
    skip: !selectedDate,
  });

  // Resumir cuántos pacientes hay en cada estado de ánimo
  const moodSummary = useMemo(() => {
    if (!moodsData) return {};
    return moodsData.reduce((acc, moodEntry) => {
      acc[moodEntry.mood] = (acc[moodEntry.mood] || 0) + 1;
      return acc;
    }, {});
  }, [moodsData]);

  // Modal para ver quiénes tienen cierto estado de ánimo
  const [openMoodModal, setOpenMoodModal] = useState(false);
  const [currentMood, setCurrentMood] = useState('');
  const [patientsWithMood, setPatientsWithMood] = useState([]);

  const handleMoodClick = (mood) => {
    setCurrentMood(mood);
    const filtered = moodsData.filter((m) => m.mood === mood).map((m) => m.patient);
    setPatientsWithMood(filtered);
    setOpenMoodModal(true);
  };

  const handleCloseModal = () => {
    setOpenMoodModal(false);
    setCurrentMood('');
    setPatientsWithMood([]);
  };

  // ======================================================
  // 6. MoCA: Obtener y Filtrar Resultados
  // ======================================================
  const {
    data: allMocaRecords,
    isLoading: isLoadingMoca,
    isError: isErrorMoca,
    error: errorMoca,
  } = useGetAllMocaSelfsQuery();

  // Filtrar MoCA de acuerdo a pacientes y fechas
  const filteredMocaRecords = useMemo(() => {
    if (!allMocaRecords) return [];
    let records = [...allMocaRecords];

    // Si "ALL" está seleccionado, no filtramos por ID de paciente
    if (!isAllSelected && selectedPatients.length > 0) {
      records = records.filter((rec) =>
        selectedPatients.includes(rec.patient?._id?.toString()),
      );
    }

    // Rango de fechas
    if (mocaStartDate) {
      const start = new Date(mocaStartDate);
      records = records.filter((rec) => new Date(rec.testDate) >= start);
    }
    if (mocaEndDate) {
      const end = new Date(mocaEndDate);
      end.setHours(23, 59, 59, 999);
      records = records.filter((rec) => new Date(rec.testDate) <= end);
    }

    return records;
  }, [allMocaRecords, selectedPatients, isAllSelected, mocaStartDate, mocaEndDate]);

  // Puntaje promedio MoCA
  const averageMocaScore = useMemo(() => {
    if (filteredMocaRecords.length === 0) return 0;
    const totalScore = filteredMocaRecords.reduce(
      (acc, rec) => acc + (rec.totalScore || 0),
      0,
    );
    return (totalScore / filteredMocaRecords.length).toFixed(1);
  }, [filteredMocaRecords]);

  // Distribución de puntajes MoCA
  const mocaDistributionData = useMemo(() => {
    if (filteredMocaRecords.length === 0) return [];
    const distribution = { '0-10': 0, '11-20': 0, '21-30': 0 };

    filteredMocaRecords.forEach((rec) => {
      const score = rec.totalScore || 0;
      if (score >= 0 && score <= 10) distribution['0-10'] += 1;
      else if (score >= 11 && score <= 20) distribution['11-20'] += 1;
      else if (score >= 21 && score <= 30) distribution['21-30'] += 1;
    });

    return Object.keys(distribution).map((range) => ({
      range,
      count: distribution[range],
    }));
  }, [filteredMocaRecords]);

  // Tendencia de puntajes MoCA
  const mocaTrendData = useMemo(() => {
    if (filteredMocaRecords.length === 0) return [];
    const sorted = [...filteredMocaRecords].sort(
      (a, b) => new Date(a.testDate) - new Date(b.testDate),
    );
    return sorted.map((record) => ({
      date: new Date(record.testDate).toLocaleDateString('es-ES'),
      score: record.totalScore,
      patientName: record.patient?.user
        ? `${record.patient.user.name} ${record.patient.user.lastName}`
        : 'Desconocido',
    }));
  }, [filteredMocaRecords]);

  // ======================================================
  // 7. Adherencia a Medicamentos (Ejemplo)
  // ======================================================
  const [takeMedication] = useTakeMedicationMutation();

  const totalMedications = useMemo(() => {
    if (!filteredTreatments) return 0;
    return filteredTreatments.reduce((count, t) => {
      return count + (t.medications ? t.medications.length : 0);
    }, 0);
  }, [filteredTreatments]);

  const medicationsTaken = useMemo(() => {
    if (!filteredTreatments) return 0;
    let taken = 0;
    filteredTreatments.forEach((t) => {
      if (t.medications && t.medications.length > 0) {
        t.medications.forEach((m) => {
          if (m.lastTaken) taken += 1;
        });
      }
    });
    return taken;
  }, [filteredTreatments]);

  const medicationComplianceRate = totalMedications
    ? ((medicationsTaken / totalMedications) * 100).toFixed(1)
    : 0;

  // ======================================================
  // 8. Preparar Datos para los Gráficos Adicionales
  // ======================================================

  // Distribución de Tratamientos
  const distributionTreatmentsDataComputed = useMemo(() => {
    if (filteredTreatments.length === 0) return [];
    const distribution = {};
    filteredTreatments.forEach((t) => {
      const type = t.treatmentType || 'Desconocido';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return Object.keys(distribution).map((type) => ({
      name: type,
      value: distribution[type],
    }));
  }, [filteredTreatments]);

  // Tratamientos por Paciente
  const treatmentsPerPatientDataComputed = useMemo(() => {
    if (filteredTreatments.length === 0) return [];
    const treatmentCounts = {};
    filteredTreatments.forEach((t) => {
      const patientName = t.patient?.user
        ? `${t.patient.user.name} ${t.patient.user.lastName}`
        : 'Desconocido';
      treatmentCounts[patientName] = (treatmentCounts[patientName] || 0) + 1;
    });
    return Object.keys(treatmentCounts).map((name) => ({
      patientName: name,
      treatmentCount: treatmentCounts[name],
    }));
  }, [filteredTreatments]);

  // ======================================================
  // 9. Acordeones para secciones de datos
  // ======================================================
  const [expanded, setExpanded] = useState(false);
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // ======================================================
  // Manejo de carga y errores
  // ======================================================
  const isLoadingDashboard =
    isLoadingPatients || isLoadingTreatments || isLoadingMoods || isLoadingMoca;
  const isErrorDashboard =
    isErrorPatients || isErrorTreatments || isErrorMoods || isErrorMoca;

  if (isLoadingDashboard) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando datos del Dashboard...
        </Typography>
      </Container>
    );
  }

  if (isErrorDashboard) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6" color="error">
          Ocurrió un error al cargar los datos del Dashboard:{' '}
          {errorPatients?.data?.message ||
            errorTreatments?.data?.message ||
            errorMoods?.data?.message ||
            errorMoca?.data?.message ||
            'Error desconocido.'}
        </Typography>
      </Container>
    );
  }

  // ======================================================
  // Render Final del Dashboard
  // ======================================================
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard General
      </Typography>

      {/* Filtros */}
      <Box mb={3}>
        <Grid container spacing={2}>
          {/* Filtro: Pacientes */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="patient-select-label">Filtrar Pacientes</InputLabel>
              <Select
                labelId="patient-select-label"
                multiple
                value={selectedPatients}
                onChange={handlePatientChange}
                input={<OutlinedInput label="Filtrar Pacientes" />}
                renderValue={(selected) => {
                  if (selected.includes('ALL')) {
                    return 'Todos los Pacientes';
                  }
                  return selected
                    .map((id) => {
                      const p = patients.find((pp) => pp._id === id);
                      return p ? `${p.user.name} ${p.user.lastName}` : id;
                    })
                    .join(', ');
                }}
                MenuProps={MenuProps}
              >
                <MenuItem value="ALL">
                  <Checkbox checked={selectedPatients.includes('ALL')} />
                  <ListItemText primary="Todos los Pacientes" />
                </MenuItem>

                {patients.map((p) => (
                  <MenuItem
                    key={p._id}
                    value={p._id}
                    disabled={selectedPatients.includes('ALL')}
                  >
                    <Checkbox checked={selectedPatients.indexOf(p._id) > -1} />
                    <ListItemText primary={`${p.user.name} ${p.user.lastName}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro: Estado del Tratamiento */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Estado Tratamiento</InputLabel>
              <Select
                labelId="status-select-label"
                value={treatmentStatus}
                onChange={handleStatusChange}
                label="Estado Tratamiento"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Fechas para Filtrar MoCA */}
          <Grid item xs={12} md={2}>
            <TextField
              label="MoCA Inicio"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={mocaStartDate}
              onChange={(e) => setMocaStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="MoCA Fin"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={mocaEndDate}
              onChange={(e) => setMocaEndDate(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {/* KPIs Principales */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Total Pacientes"
            value={totalPatients}
            subtitle="Número total de pacientes"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Pacientes Seleccionados"
            value={selectedPatientsCount}
            subtitle={isAllSelected ? 'Todos' : 'Aplicando filtro'}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Tratamientos Activos"
            value={activeTreatments}
            subtitle="En estado activo"
            icon={<FaHeartbeat />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Tratamientos Inactivos"
            value={inactiveTreatments}
            subtitle="En estado inactivo"
            icon={<FaUserClock />}
          />
        </Grid>
      </Grid>

      {/* KPIs Adicionales */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Total Tratamientos"
            value={totalTreatments}
            subtitle="Aplicando filtros"
            icon={<FaTasks />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Adherencia Medicamentos"
            value={`${medicationComplianceRate}%`}
            subtitle={`${medicationsTaken}/${totalMedications} tomados`}
            icon={<FaMedkit />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Registros MoCA"
            value={filteredMocaRecords.length}
            subtitle="Filtrados por fecha y paciente"
            icon={<MdEventNote />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Promedio MoCA"
            value={averageMocaScore}
            subtitle="Puntaje promedio"
            icon={<FaChartLine />}
          />
        </Grid>
      </Grid>

      {/* Sección Expansible: Tratamientos */}
      <Accordion
        expanded={expanded === 'treatmentsPanel'}
        onChange={handleAccordionChange('treatmentsPanel')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Detalles de Tratamientos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={4}>
              <KPICard
                title="Total Tratamientos"
                value={totalTreatments}
                subtitle="Aplicando filtros"
                icon={<FaTasks />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <KPICard
                title="Adherencia Medicamentos"
                value={`${medicationComplianceRate}%`}
                subtitle={`${medicationsTaken}/${totalMedications} tomados`}
                icon={<FaMedkit />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Observaciones
                </Typography>
                <Typography variant="body2">
                  Aquí se pueden incluir notas generales sobre los tratamientos
                  (p.ej., si se observa baja adherencia, proponer seguimiento
                  adicional, etc.).
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Gráficos de Tratamientos */}
          <ChartsSection
            treatments={filteredTreatments}
            completedActivities={[]} // Si no tienes datos de actividades aquí, puedes dejarlo vacío o pasar datos relevantes
            medications={[]} // Similar al anterior
            distributionTreatmentsData={distributionTreatmentsDataComputed}
            treatmentsPerPatientData={treatmentsPerPatientDataComputed}
            mocaDistributionData={[]} // No es necesario aquí, lo incluirás en otra sección
            mocaTrendData={[]} // Similar
          />
        </AccordionDetails>
      </Accordion>

      {/* Sección Expansible: MoCA */}
      <Accordion
        expanded={expanded === 'mocaPanel'}
        onChange={handleAccordionChange('mocaPanel')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Resultados de MoCA</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={4}>
              <KPICard
                title="Registros MoCA"
                value={filteredMocaRecords.length}
                subtitle="Filtrados por fecha y paciente"
                icon={<MdEventNote />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <KPICard
                title="Promedio MoCA"
                value={averageMocaScore}
                subtitle="Puntaje promedio"
                icon={<FaChartLine />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Sugerencias
                </Typography>
                <Typography variant="body2">
                  En base a los resultados MoCA, el doctor puede sugerir nuevas
                  actividades cognitivas, incrementar visitas, etc.
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Gráficos de MoCA */}
          <ChartsSection
            treatments={[]} // No es necesario aquí, puedes pasar datos relevantes si los tienes
            completedActivities={[]} // Similar
            medications={[]} // Similar
            distributionTreatmentsData={[]} // No necesario aquí
            treatmentsPerPatientData={[]} // Similar
            mocaDistributionData={mocaDistributionData}
            mocaTrendData={mocaTrendData}
          />
        </AccordionDetails>
      </Accordion>

      {/* Sección Expansible: Estado de Ánimo */}
      <Accordion
        expanded={expanded === 'moodPanel'}
        onChange={handleAccordionChange('moodPanel')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Estado de Ánimo de Pacientes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box mb={2}>
            <Typography variant="body1" gutterBottom>
              Selecciona la fecha para ver los estados de ánimo:
            </Typography>
            <TextField
              label="Fecha Mood"
              type="date"
              sx={{ mb: 2 }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          {moodsData && Object.keys(moodSummary).length > 0 ? (
            <Grid container spacing={2}>
              {Object.entries(moodSummary).map(([mood, count]) => (
                <Grid item xs={12} sm={6} md={4} key={mood}>
                  <Box
                    onClick={() => handleMoodClick(mood)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      backgroundColor: '#f0f0f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                      '&:hover': {
                        backgroundColor: '#e0e0e0',
                      },
                    }}
                  >
                    <Box sx={{ fontSize: '24px', mr: 2 }}>
                      {moodIcons[mood] || <FaSmile />}
                    </Box>
                    <Box>
                      <Typography variant="h6">{mood}</Typography>
                      <Typography variant="subtitle1">
                        {count} paciente{count > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ mt: 2 }}>
              No hay información de estado de ánimo para esta fecha.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

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
          <Typography
            id="mood-patients-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Pacientes con estado de ánimo: {currentMood}
          </Typography>
          {patientsWithMood.length > 0 ? (
            <ul>
              {patientsWithMood.map((patient) => (
                <li key={patient._id}>
                  {patient.user?.name} {patient.user?.lastName}
                </li>
              ))}
            </ul>
          ) : (
            <Typography>No hay pacientes con este estado de ánimo.</Typography>
          )}
          <Box textAlign="right" mt={2}>
            <Button variant="contained" onClick={handleCloseModal}>
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default DashboardScreen;
