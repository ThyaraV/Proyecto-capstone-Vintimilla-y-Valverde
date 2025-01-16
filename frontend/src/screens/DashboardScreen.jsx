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

import { useGetDoctorWithPatientsQuery } from '../slices/doctorApiSlice';
import {
  useGetTreatmentsByMultiplePatientsMutation,
  useTakeMedicationMutation,
} from '../slices/treatmentSlice';
import { useGetMoodsByDateQuery } from '../slices/moodApiSlice';
import { useGetAllMocaSelfsQuery } from '../slices/mocaSelfApiSlice';

import KPICard from '../components/KPICard';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

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

  // ============================
  // 1. OBTENER PACIENTES
  // ============================
  const {
    data: doctorPatients,
    isLoading: isLoadingPatients,
    isError: isErrorPatients,
    error: errorPatients,
  } = useGetDoctorWithPatientsQuery();

  // Convertir a array usable
  const patients = useMemo(() => {
    if (!doctorPatients) return [];
    return doctorPatients.map((patient) => ({
      ...patient,
      _id: patient._id.toString(),
    }));
  }, [doctorPatients]);

  // ============================
  // 2. FILTROS
  // ============================
  const [selectedPatients, setSelectedPatients] = useState(['ALL']); // "ALL" por defecto
  const [treatmentStatus, setTreatmentStatus] = useState('all');
  const [mocaStartDate, setMocaStartDate] = useState('');
  const [mocaEndDate, setMocaEndDate] = useState('');

  // Manejo de selección de pacientes
  const handlePatientChange = (event) => {
    const { value } = event.target;
    if (value.includes('ALL')) {
      setSelectedPatients(['ALL']);
    } else {
      setSelectedPatients(value.filter((v) => v !== 'ALL'));
    }
  };

  // Manejo de estado de tratamiento
  const handleStatusChange = (event) => {
    setTreatmentStatus(event.target.value);
  };

  // ============================
  // 3. OBTENER TRATAMIENTOS
  // ============================
  const [
    fetchTreatments,
    {
      data: treatmentsData,
      isLoading: isLoadingTreatments,
      isError: isErrorTreatments,
      error: errorTreatments,
    },
  ] = useGetTreatmentsByMultiplePatientsMutation();

  // Efecto para recargar tratamientos al cambiar filtros
  useEffect(() => {
    if (!doctorPatients) return;
    if (selectedPatients.includes('ALL') && patients.length > 0) {
      const allIds = patients.map((p) => p._id.toString());
      fetchTreatments({ patientIds: allIds })
        .unwrap()
        .catch((error) =>
          enqueueSnackbar(`Error: ${error.data?.message || error.error}`, {
            variant: 'error',
          }),
        );
    } else if (selectedPatients.length > 0 && !selectedPatients.includes('ALL')) {
      fetchTreatments({ patientIds: selectedPatients })
        .unwrap()
        .catch((error) =>
          enqueueSnackbar(`Error: ${error.data?.message || error.error}`, {
            variant: 'error',
          }),
        );
    }
  }, [selectedPatients, patients, fetchTreatments, enqueueSnackbar]);

  // Filtrar tratamientos por estado
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

  // ============================
  // 4. KPIs de Pacientes y Tratamientos
  // ============================
  const totalPatients = patients.length;
  const isAllSelected = selectedPatients.includes('ALL');
  const selectedPatientsCount = isAllSelected ? totalPatients : selectedPatients.length;

  const totalTreatments = filteredTreatments.length;
  const activeTreatments = filteredTreatments.filter((t) => t.active).length;
  const inactiveTreatments = filteredTreatments.filter((t) => !t.active).length;

  // ============================
  // 5. ESTADOS DE ÁNIMO
  // ============================
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const {
    data: moodsData,
    isLoading: isLoadingMoods,
    isError: isErrorMoods,
    error: errorMoods,
  } = useGetMoodsByDateQuery(selectedDate, {
    skip: !selectedDate,
  });

  const moodSummary = useMemo(() => {
    if (!moodsData) return {};
    return moodsData.reduce((acc, m) => {
      acc[m.mood] = (acc[m.mood] || 0) + 1;
      return acc;
    }, {});
  }, [moodsData]);

  // Modal para mostrar pacientes por Mood
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

  // ============================
  // 6. MoCA
  // ============================
  const {
    data: allMocaRecords,
    isLoading: isLoadingMoca,
    isError: isErrorMoca,
    error: errorMoca,
  } = useGetAllMocaSelfsQuery();

  // Filtrar MoCA
  const filteredMocaRecords = useMemo(() => {
    if (!allMocaRecords) return [];
    let records = [...allMocaRecords];
    if (!isAllSelected && selectedPatients.length > 0) {
      records = records.filter((rec) =>
        selectedPatients.includes(rec.patient?._id?.toString()),
      );
    }
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

  const averageMocaScore = useMemo(() => {
    if (filteredMocaRecords.length === 0) return 0;
    const totalScore = filteredMocaRecords.reduce(
      (acc, rec) => acc + (rec.totalScore || 0),
      0,
    );
    return (totalScore / filteredMocaRecords.length).toFixed(1);
  }, [filteredMocaRecords]);

  // Distribución MoCA
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

  // Tendencia MoCA
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

  // ============================
  // 7. Medicamentos (Adherencia)
  // ============================
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

  // ============================
  // 8. Gráficos de Resumen (Vista General)
  // ============================
  // Ejemplo: PieChart simple con los estados de tratamiento (activo vs. inactivo)
  const treatmentStatesDistribution = useMemo(() => {
    if (filteredTreatments.length === 0) return [];
    const activeCount = filteredTreatments.filter((t) => t.active).length;
    const inactiveCount = filteredTreatments.filter((t) => !t.active).length;
    return [
      { name: 'Activos', value: activeCount },
      { name: 'Inactivos', value: inactiveCount },
    ];
  }, [filteredTreatments]);

  // Ejemplo: BarChart simple con número de tratamientos por paciente
  const treatmentsByPatientSummary = useMemo(() => {
    if (filteredTreatments.length === 0) return [];
    const treatmentCounts = {};
    filteredTreatments.forEach((t) => {
      // Se asume que t.patients es un array; si tienes 1 solo patient por treatment, ajusta
      t.patients.forEach((pId) => {
        treatmentCounts[pId] = (treatmentCounts[pId] || 0) + 1;
      });
    });
    // Mapear IDs a nombres
    return Object.entries(treatmentCounts).map(([patientId, count]) => {
      const p = patients.find((p) => p._id === patientId);
      const name = p
        ? `${p.user.name} ${p.user.lastName}`
        : `Paciente ID: ${patientId}`;
      return { patient: name, count };
    });
  }, [filteredTreatments, patients]);

  // ============================
  // 9. Acordeones
  // ============================
  const [expanded, setExpanded] = useState(false);
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // ============================
  // Manejo de Carga/Errores
  // ============================
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
  // RENDER
  // ======================================================
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard General
      </Typography>

      {/* Sección de Filtros */}
      <Box mb={3}>
        <Grid container spacing={2}>
          {/* Filtro Pacientes */}
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
                  if (selected.includes('ALL')) return 'Todos los Pacientes';
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

          {/* Filtro Estado Tratamiento */}
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

          {/* Fechas MoCA */}
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
            subtitle={isAllSelected ? 'Todos' : 'Filtrados'}
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
            subtitle="Pacientes/Fechas"
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

      {/* VISTA GENERAL DE TRATAMIENTOS (EJEMPLO) */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Vista General de Tratamientos
        </Typography>
        <Grid container spacing={2}>
          {/* PieChart: Estados de Tratamiento */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Distribución de Estados de Tratamiento
              </Typography>
              {treatmentStatesDistribution.length === 0 ? (
                <Typography>No hay datos de Tratamientos.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={treatmentStatesDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {treatmentStatesDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? '#82ca9d' : '#d62728'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid>

          {/* BarChart: Número de Tratamientos por Paciente */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tratamientos por Paciente (Resumen)
              </Typography>
              {treatmentsByPatientSummary.length === 0 ? (
                <Typography>No hay datos para este gráfico.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={treatmentsByPatientSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="patient" interval={0} angle={-45} textAnchor="end" height={60}/>
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Tratamientos" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Acordeón de Tratamientos */}
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
                  Aquí se pueden incluir notas generales sobre los tratamientos,
                  adherencia a medicación, etc.
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Aquí podrías incluir GRÁFICOS ESPECÍFICOS de Tratamientos 
              o Medicamentos, en caso de que no quieras mostrarlos en la vista general. */}
          <Typography variant="body1" sx={{ mt: 2 }}>
            Más detalles o gráficos específicos de tratamientos...
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Acordeón de MoCA */}
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
                  Se pueden proponer actividades cognitivas extras o plan de
                  seguimiento basado en los resultados MoCA.
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Gráfico de Distribución de Puntajes MoCA */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Distribución de Puntajes MoCA
            </Typography>
            {mocaDistributionData.length === 0 ? (
              <Typography>No hay datos de MoCA para graficar.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mocaDistributionData}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {mocaDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#82ca9d' : '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>

          {/* Gráfico de Tendencia de Puntajes MoCA */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Tendencia de Puntajes MoCA
            </Typography>
            {mocaTrendData.length === 0 ? (
              <Typography>No hay datos de tendencia MoCA para graficar.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mocaTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#82ca9d" name="Puntaje MoCA" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Acordeón Estado de Ánimo */}
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
                      '&:hover': { backgroundColor: '#e0e0e0' },
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

      {/* Modal Pacientes por Estado de Ánimo */}
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
