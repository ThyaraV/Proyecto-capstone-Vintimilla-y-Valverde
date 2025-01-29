// frontend/src/screens/DashboardScreen.jsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';
import { useGetDoctorsQuery } from '../slices/doctorApiSlice';
import { useGetPatientsQuery } from '../slices/patientApiSlice';
import { useGetUsersQuery } from '../slices/usersApiSlice';
import { useGetTreatmentsByMultiplePatientsMutation } from '../slices/treatmentSlice';
import { useGetAllMocaSelfsQuery } from '../slices/mocaSelfApiSlice';
import { useSnackbar } from 'notistack';
import { isSameDay } from 'date-fns';

import KPICard from '../components/KPICard';

import '../assets/styles/DashboardScreen.css';

/** Paleta de colores para los gráficos */
const COLORS = [
  '#00C49F',
  '#FF8042',
  '#FFBB28',
  '#0088FE',
  '#FF4444',
  '#AA336A',
  '#33AA99',
  '#9966FF',
];

const DashboardScreen = () => {
  const { enqueueSnackbar } = useSnackbar();

  // ----------------------------------------------------------------
  // 1. CONSULTAS PRINCIPALES (DOCTORES, PACIENTES, USUARIOS, MOCA)
  // ----------------------------------------------------------------
  const {
    data: doctors = [],
    isLoading: isLoadingDoctors,
    isError: isErrorDoctors,
    error: errorDoctors,
  } = useGetDoctorsQuery();

  const {
    data: rawPatients = [],
    isLoading: isLoadingPatients,
    isError: isErrorPatients,
    error: errorPatients,
  } = useGetPatientsQuery();

  const {
    data: allUsers = [],
    isLoading: isLoadingUsers,
    isError: isErrorAllUsers,
    error: errorAllUsers,
  } = useGetUsersQuery();

  const {
    data: mocaRecords = [],
    isLoading: isLoadingMoca,
    isError: isErrorMoca,
    error: errorMoca,
  } = useGetAllMocaSelfsQuery();

  // ----------------------------------------------------------------
  // 2. ESTADOS DE FILTRO
  // ----------------------------------------------------------------
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTreatmentStatus, setSelectedTreatmentStatus] = useState('all');

  // ----------------------------------------------------------------
  // 3. MAPEAR PACIENTES PARA AÑADIR isActive DESDE allUsers
  // ----------------------------------------------------------------
  const allPatients = useMemo(() => {
    return rawPatients.map((patient) => {
      const matchedUser = allUsers.find((u) => u._id === patient.user?._id);
      if (matchedUser) {
        return {
          ...patient,
          user: {
            ...patient.user,
            isActive: matchedUser.isActive,
          },
        };
      }
      return patient;
    });
  }, [rawPatients, allUsers]);

  // ----------------------------------------------------------------
  // 4. HANDLERS DE CAMBIO EN SELECT/FILTROS
  // ----------------------------------------------------------------
  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleTreatmentStatusChange = (event) => {
    setSelectedTreatmentStatus(event.target.value);
  };

  // ----------------------------------------------------------------
  // 5. FILTRAR PACIENTES POR DOCTOR Y ESTADO (ACTIVO/INACTIVO)
  // ----------------------------------------------------------------
  const filteredPatients = useMemo(() => {
    let patients = [...allPatients];

    if (selectedDoctor !== 'all') {
      patients = patients.filter(
        (patient) => patient.doctor && patient.doctor._id === selectedDoctor
      );
    }

    if (selectedStatus !== 'all') {
      patients = patients.filter((patient) => {
        if (!patient.user || typeof patient.user.isActive !== 'boolean') {
          return false;
        }
        return selectedStatus === 'active'
          ? patient.user.isActive === true
          : patient.user.isActive === false;
      });
    }

    return patients;
  }, [allPatients, selectedDoctor, selectedStatus]);

  // ----------------------------------------------------------------
  // 6. OBTENER TRATAMIENTOS PARA TODOS LOS PACIENTES FILTRADOS
  // ----------------------------------------------------------------
  const patientIdsForTreatments = useMemo(() => {
    return filteredPatients.map((p) => p._id);
  }, [filteredPatients]);

  const [
    fetchTreatments,
    {
      data: treatmentsData,
      isLoading: isLoadingTreatments,
      isError: isErrorTreatments,
      error: errorTreatments,
    },
  ] = useGetTreatmentsByMultiplePatientsMutation();

  // Solo se hace la llamada si hay pacientes filtrados
  useEffect(() => {
    if (patientIdsForTreatments.length === 0) return;
    fetchTreatments({ patientIds: patientIdsForTreatments })
      .unwrap()
      .catch((err) => {
        enqueueSnackbar(
          `Error al obtener tratamientos: ${err.data?.message || err.error}`,
          { variant: 'error' }
        );
      });
  }, [patientIdsForTreatments, fetchTreatments, enqueueSnackbar]);

  // ----------------------------------------------------------------
  // 7. FILTRAR TRATAMIENTOS POR ESTADO (ACTIVE/INACTIVE/ALL)
  // ----------------------------------------------------------------
  const filteredTreatments = useMemo(() => {
    if (!treatmentsData) return [];
    let filtered = treatmentsData;

    if (selectedTreatmentStatus === 'active') {
      filtered = filtered.filter((treatment) => treatment.active === true);
    } else if (selectedTreatmentStatus === 'inactive') {
      filtered = filtered.filter((treatment) => treatment.active === false);
    }

    return filtered;
  }, [treatmentsData, selectedTreatmentStatus]);

  // ----------------------------------------------------------------
  // 8. CALCULAR ACTIVIDADES Y MEDICAMENTOS FILTRADOS
  // ----------------------------------------------------------------
  const filteredActivities = useMemo(() => {
    if (!filteredTreatments) return [];
    let activities = [];
    filteredTreatments.forEach((treatment) => {
      if (
        treatment.completedActivities &&
        treatment.completedActivities.length > 0
      ) {
        activities = activities.concat(treatment.completedActivities);
      }
    });
    return activities;
  }, [filteredTreatments]);

  /** 
   * filteredMedications: contiene todos los medicamentos de los tratamientos filtrados,
   * con una propiedad booleana `takenToday` para ver si se tomaron hoy.
   */
  const filteredMedications = useMemo(() => {
    if (!filteredTreatments) return [];
    let meds = [];
    filteredTreatments.forEach((treatment) => {
      if (treatment.medications && treatment.medications.length > 0) {
        meds = meds.concat(
          treatment.medications.map((med) => ({
            ...med,
            treatmentId: treatment._id.toString(),
            takenToday: med.lastTaken
              ? isSameDay(new Date(med.lastTaken), new Date())
              : false,
          }))
        );
      }
    });
    return meds;
  }, [filteredTreatments]);

  // ----------------------------------------------------------------
  // 9. KPI PRINCIPALES (VIEJA LÓGICA Y LÓGICA NUEVA)
  // ----------------------------------------------------------------

  // 9.1 Actividades
  const totalActivities = filteredActivities.length;
  const uniqueActivities = [
    ...new Set(filteredActivities.map((a) => a.activity?.name || 'Sin Nombre')),
  ].length;

  // 9.2 Medicamentos TOMADOS HOY (Nueva lógica con takenToday)
  const totalMedicationsToday = filteredMedications.length;
  const medicationsTakenToday = useMemo(() => {
    return filteredMedications.filter((m) => m.takenToday).length;
  }, [filteredMedications]);
  const medicationsComplianceRateToday = useMemo(() => {
    return totalMedicationsToday
      ? ((medicationsTakenToday / totalMedicationsToday) * 100).toFixed(1)
      : '0.0';
  }, [medicationsTakenToday, totalMedicationsToday]);

  // 9.3 Medicamentos TOTALES (Vieja lógica: contarlos, sin importar día)
  const totalMedicationsOverall = useMemo(() => {
    if (!filteredTreatments) return 0;
    return filteredTreatments.reduce((count, t) => {
      return count + (t.medications ? t.medications.length : 0);
    }, 0);
  }, [filteredTreatments]);

  // 9.4 Medicamentos ALGUNA VEZ tomados (Vieja lógica: si lastTaken != null)
  const medicationsEverTaken = useMemo(() => {
    if (!filteredTreatments) return 0;
    let taken = 0;
    filteredTreatments.forEach((t) => {
      if (t.medications && t.medications.length > 0) {
        t.medications.forEach((m) => {
          if (m.lastTaken) {
            taken += 1;
          }
        });
      }
    });
    return taken;
  }, [filteredTreatments]);

  // 9.5 Adherencia general (Vieja lógica)
  const medicationOverallRate = useMemo(() => {
    return totalMedicationsOverall
      ? ((medicationsEverTaken / totalMedicationsOverall) * 100).toFixed(1)
      : '0.0';
  }, [medicationsEverTaken, totalMedicationsOverall]);

  // 9.6 Tratamientos totales (filtrados)
  const totalTreatments = filteredTreatments.length;

  // ----------------------------------------------------------------
  // 10. GRÁFICO: PROGRESO DE TRATAMIENTOS (RadarChart)
  // ----------------------------------------------------------------
  const progressAllData = useMemo(() => {
    if (!treatmentsData) return [];
    const map = {};
    treatmentsData.forEach((t) => {
      const key = t.progress || 'desconocido';
      if (!map[key]) map[key] = 0;
      map[key]++;
    });
    return Object.keys(map).map((p) => ({ progress: p, count: map[p] }));
  }, [treatmentsData]);

  // ----------------------------------------------------------------
  // 11. GRÁFICO: ACTIVIDADES COMPLETADAS
  // ----------------------------------------------------------------
  const activityCompletionData = useMemo(() => {
    if (!filteredActivities) return [];
    const map = {};
    filteredActivities.forEach((act) => {
      const name = act.activity?.name || 'Sin Nombre';
      if (!map[name]) map[name] = 0;
      map[name]++;
    });
    return Object.keys(map).map((n) => ({ name: n, value: map[n] }));
  }, [filteredActivities]);

  // ----------------------------------------------------------------
  // 12. GRÁFICO: CUMPLIMIENTO DE MEDICAMENTOS HOY (Tomados vs. No Tomados)
  // ----------------------------------------------------------------
  const medicationComplianceDataToday = useMemo(() => {
    const taken = medicationsTakenToday; // ya calculado
    const notTaken = totalMedicationsToday - taken;
    return [
      { name: 'Tomados Hoy', value: taken },
      { name: 'No Tomados Hoy', value: notTaken },
    ];
  }, [medicationsTakenToday, totalMedicationsToday]);

  // ----------------------------------------------------------------
  // 13. FRECUENCIA DE MEDICAMENTOS (Diaria, Semanal, Mensual, Otro)
  // ----------------------------------------------------------------
  const medicationFrequencyData = useMemo(() => {
    const freqMap = { Diaria: 0, Semanal: 0, Mensual: 0, Otro: 0 };
    filteredMedications.forEach((med) => {
      const freq = med.frequency?.toLowerCase();
      if (freq === 'diaria') freqMap.Diaria++;
      else if (freq === 'semanal') freqMap.Semanal++;
      else if (freq === 'mensual') freqMap.Mensual++;
      else freqMap.Otro++;
    });
    return Object.keys(freqMap).map((key) => ({ name: key, value: freqMap[key] }));
  }, [filteredMedications]);

  // ----------------------------------------------------------------
  // 14. GRÁFICO: PACIENTES ACTIVOS VS INACTIVOS
  // ----------------------------------------------------------------
  const activeCount = useMemo(() => {
    return filteredPatients.filter((p) => p.user?.isActive).length;
  }, [filteredPatients]);

  const inactiveCount = useMemo(() => {
    return filteredPatients.filter((p) => p.user && !p.user.isActive).length;
  }, [filteredPatients]);

  const pieData = [
    { name: 'Activos', value: activeCount },
    { name: 'Inactivos', value: inactiveCount },
  ];

  // ----------------------------------------------------------------
  // 15. GRÁFICO: DISTRIBUCIÓN DE PACIENTES POR DOCTOR
  // ----------------------------------------------------------------
  const patientsByDoctor = useMemo(() => {
    return doctors
      .map((doc) => {
        const count = filteredPatients.filter(
          (patient) => patient.doctor && patient.doctor._id === doc._id
        ).length;
        return {
          name: `${doc.user?.name || ''} ${doc.user?.lastName || ''}`.trim(),
          value: count,
        };
      })
      .filter((doc) => doc.value > 0);
  }, [doctors, filteredPatients]);

  // ----------------------------------------------------------------
  // 16. MOCA: KPIs Y GRÁFICOS
  // ----------------------------------------------------------------
  const mocaAverageScore = useMemo(() => {
    if (!mocaRecords || mocaRecords.length === 0) return '0.00';
    const totalScore = mocaRecords.reduce(
      (acc, curr) => acc + (curr.totalScore || 0),
      0
    );
    return (totalScore / mocaRecords.length).toFixed(2);
  }, [mocaRecords]);

  const mocaScoreDistribution = useMemo(() => {
    if (!mocaRecords) return [];
    const map = {};
    mocaRecords.forEach((record) => {
      const score = record.totalScore;
      let range = '';
      if (score >= 0 && score <= 10) {
        range = '0-10';
      } else if (score >= 11 && score <= 20) {
        range = '11-20';
      } else if (score >= 21 && score <= 30) {
        range = '21-30';
      } else {
        range = 'Desconocido';
      }

      if (!map[range]) map[range] = 0;
      map[range]++;
    });
    return Object.keys(map).map((range) => ({ range, count: map[range] }));
  }, [mocaRecords]);

  // Tendencia
  const mocaScoreTrend = useMemo(() => {
    if (!mocaRecords) return [];
    const trend = mocaRecords
      .map((record) => ({
        date: new Date(record.testDate).toLocaleDateString(),
        score: record.totalScore,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return trend;
  }, [mocaRecords]);

  // Estado MOCA
  const completedMocaIds = useMemo(() => {
    return new Set(
      mocaRecords
        .filter((r) => r.patient && r.patient._id)
        .map((r) => r.patient._id.toString())
    );
  }, [mocaRecords]);

  const mocaAssignedCount = useMemo(() => {
    return allPatients.filter((p) => p.mocaAssigned).length;
  }, [allPatients]);

  const mocaCompletedCount = useMemo(() => {
    return allPatients.filter(
      (p) => p.mocaAssigned && completedMocaIds.has(p._id.toString())
    ).length;
  }, [allPatients, completedMocaIds]);

  const mocaPendingCount = useMemo(() => {
    return mocaAssignedCount - mocaCompletedCount;
  }, [mocaAssignedCount, mocaCompletedCount]);

  const totalPatientsCount = useMemo(() => {
    return allPatients.length;
  }, [allPatients]);

  const mocaNotRequiredCount = useMemo(() => {
    return totalPatientsCount - mocaAssignedCount;
  }, [totalPatientsCount, mocaAssignedCount]);

  const mocaDistributionData = [
    { name: 'Completado', value: mocaCompletedCount },
    { name: 'Pendiente', value: mocaPendingCount },
    { name: 'No Requerido', value: mocaNotRequiredCount },
  ];

  // ----------------------------------------------------------------
  // 17. MANEJO DE ESTADOS DE CARGA Y ERROR
  // ----------------------------------------------------------------
  if (
    isLoadingDoctors ||
    isLoadingPatients ||
    isLoadingUsers ||
    isLoadingMoca ||
    (patientIdsForTreatments.length > 0 && isLoadingTreatments)
  ) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <CircularProgress />
        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Cargando datos del Dashboard...
        </Typography>
      </Container>
    );
  }

  if (isErrorDoctors) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography color="error">
          {errorDoctors?.data?.message || 'Error al cargar la lista de doctores.'}
        </Typography>
      </Container>
    );
  }

  if (isErrorPatients) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography color="error">
          {errorPatients?.data?.message || 'Error al cargar la lista de pacientes.'}
        </Typography>
      </Container>
    );
  }

  if (isErrorAllUsers) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography color="error">
          {errorAllUsers?.data?.message || 'Error al cargar la lista de usuarios.'}
        </Typography>
      </Container>
    );
  }

  if (isErrorTreatments) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography color="error">
          {errorTreatments?.data?.message || 'Error al cargar los tratamientos.'}
        </Typography>
      </Container>
    );
  }

  if (isErrorMoca) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography color="error">
          {errorMoca?.data?.message || 'Error al cargar los registros de MoCA.'}
        </Typography>
      </Container>
    );
  }

  // ----------------------------------------------------------------
  // 18. HANDLER PARA MOSTRAR INFO DE GRÁFICOS
  // ----------------------------------------------------------------
  const handleChartInfo = (msg) => {
    alert(msg);
  };

  // ----------------------------------------------------------------
  // 19. RENDER PRINCIPAL DEL DASHBOARD
  // ----------------------------------------------------------------
  return (
    <Container maxWidth="xl" style={{ padding: '2rem 0' }}>
      {/* FILTROS Y TÍTULO */}
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={12} md={3}>
          <Typography variant="h4" gutterBottom>
            Dashboard General
          </Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="doctor-select-label">Filtrar por Doctor</InputLabel>
            <Select
              labelId="doctor-select-label"
              value={selectedDoctor}
              label="Filtrar por Doctor"
              onChange={handleDoctorChange}
            >
              <MenuItem value="all">Todos los Doctores</MenuItem>
              {doctors.map((doc) => (
                <MenuItem key={doc._id} value={doc._id}>
                  {doc.user?.name} {doc.user?.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Pacientes</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus}
              label="Pacientes"
              onChange={handleStatusChange}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="treatment-status-select-label">
              Tratamientos
            </InputLabel>
            <Select
              labelId="treatment-status-select-label"
              value={selectedTreatmentStatus}
              label="Tratamientos"
              onChange={handleTreatmentStatusChange}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* SECCIÓN PRINCIPAL: LISTA DE PACIENTES Y KPI (IZQ) + GRÁFICOS (DER) */}
      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        {/* COLUMNA IZQUIERDA */}
        <Grid item xs={12} md={4}>
          {/* Pacientes Asignados */}
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pacientes Asignados
              </Typography>
              {selectedDoctor === 'all' ? (
                <Typography variant="h4">{filteredPatients.length}</Typography>
              ) : (
                <>
                  {filteredPatients.length > 0 ? (
                    <List>
                      {filteredPatients.map((patient) => (
                        <ListItem key={patient._id}>
                          <ListItemText
                            primary={`${patient.user?.name} ${patient.user?.lastName}`}
                            secondary={`Estado: ${
                              patient.user?.isActive ? 'Activo' : 'Inactivo'
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1">
                      No hay pacientes asignados.
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            {/* KPI Actividades Completadas */}
            <Grid item xs={12}>
              <KPICard
                title="Actividades Complet."
                value={`${totalActivities}`}
                subtitle={`Distintas: ${uniqueActivities}`}
              />
            </Grid>

            {/* KPI Medicamentos Tomados Hoy */}
            <Grid item xs={12}>
              <KPICard
                title="Cumpl. Meds Hoy"
                value={`${medicationsComplianceRateToday}%`}
                subtitle={`${medicationsTakenToday}/${totalMedicationsToday} hoy`}
              />
            </Grid>

            {/* KPI Tratamientos Totales */}
            <Grid item xs={12}>
              <KPICard
                title="Tratamientos Totales"
                value={totalTreatments}
                subtitle="Tras filtros"
              />
            </Grid>

            {/* KPI MoCA Promedio */}
            <Grid item xs={12}>
              <KPICard
                title="Promedio MoCA"
                value={`${mocaAverageScore}`}
                subtitle="Promedio de puntajes"
              />
            </Grid>

            {/* KPI Adherencia General */}
            <Grid item xs={12}>
              <KPICard
                title="Adherencia Global Meds"
                value={`${medicationOverallRate}%`}
                subtitle={`${medicationsEverTaken}/${totalMedicationsOverall} tomados alguna vez`}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* COLUMNA DERECHA: GRÁFICOS */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Distribución Pacientes (Activos/Inactivos) */}
            <Grid item xs={12} md={6}>
              <Card className="dashboard-card">
                <CardContent>
                  <div className="chart-header">
                    <Typography variant="h6" gutterBottom>
                      Pacientes (A/I)
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() =>
                        handleChartInfo(
                          'Muestra cuántos pacientes están activos o inactivos, filtrados por doctor/estado.'
                        )
                      }
                    >
                      Ver Info
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        <Cell fill={COLORS[0]} />
                        <Cell fill={COLORS[1]} />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Distribución Pacientes por Doctor */}
            <Grid item xs={12} md={6}>
              <Card className="dashboard-card">
                <CardContent>
                  <div className="chart-header">
                    <Typography variant="h6" gutterBottom>
                      Pacientes x Doctor
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() =>
                        handleChartInfo(
                          'Indica la cantidad de pacientes asignados a cada doctor.'
                        )
                      }
                    >
                      Ver Info
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={patientsByDoctor}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {patientsByDoctor.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Actividades Completadas */}
            <Grid item xs={12} md={6}>
              <Card className="dashboard-card">
                <CardContent>
                  <div className="chart-header">
                    <Typography variant="h6" gutterBottom>
                      Actividades Completadas
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() =>
                        handleChartInfo(
                          'Representa las actividades finalizadas, según los tratamientos filtrados.'
                        )
                      }
                    >
                      Ver Info
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityCompletionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        fill="#82ca9d"
                        name="Nro. de Actividades"
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* CUMPLIMIENTO DE MEDICAMENTOS HOY (Tomados vs No Tomados) */}
            <Grid item xs={12} md={6}>
              <Card className="dashboard-card">
                <CardContent>
                  <div className="chart-header">
                    <Typography variant="h6" gutterBottom>
                      Meds Hoy
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() =>
                        handleChartInfo(
                          'Cuántos medicamentos se han tomado hoy vs. los que siguen pendientes.'
                        )
                      }
                    >
                      Ver Info
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={medicationComplianceDataToday}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        <Cell fill={COLORS[2]} />
                        <Cell fill={COLORS[3]} />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Frecuencia de Medicamentos (BarChart) */}
            <Grid item xs={12} md={6}>
              <Card className="dashboard-card">
                <CardContent>
                  <div className="chart-header">
                    <Typography variant="h6" gutterBottom>
                      Frec. de Medicamentos
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() =>
                        handleChartInfo(
                          'Clasifica los medicamentos (diaria, semanal, mensual, otro) según tratamientos filtrados.'
                        )
                      }
                    >
                      Ver Info
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={medicationFrequencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        fill="#8884d8"
                        name="Cantidad"
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* RadarChart: Progreso de Tratamientos */}
            <Grid item xs={12} md={6}>
              <Card className="dashboard-card">
                <CardContent>
                  <div className="chart-header">
                    <Typography variant="h6" gutterBottom>
                      Progreso Trat.
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() =>
                        handleChartInfo(
                          'Cuántos tratamientos están en cada estado (mejorando, estable, empeorando, etc.).'
                        )
                      }
                    >
                      Ver Info
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={progressAllData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="progress" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Progreso"
                        dataKey="count"
                        stroke="#AA336A"
                        fill="#AA336A"
                        fillOpacity={0.6}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Distribución de Puntajes MoCA */}
            <Grid item xs={12} md={6}>
              <Card className="dashboard-card">
                <CardContent>
                  <div className="chart-header">
                    <Typography variant="h6" gutterBottom>
                      Puntajes MoCA
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() =>
                        handleChartInfo(
                          'Agrupa los puntajes MoCA en rangos (0-10, 11-20, 21-30).'
                        )
                      }
                    >
                      Ver Info
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mocaScoreDistribution}
                        dataKey="count"
                        nameKey="range"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {mocaScoreDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Tendencia de Puntajes MoCA (LineChart) */}
            <Grid item xs={12} md={6}>
              <Card className="dashboard-card">
                <CardContent>
                  <div className="chart-header">
                    <Typography variant="h6" gutterBottom>
                      Tendencia MoCA
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() =>
                        handleChartInfo(
                          'Muestra cómo evolucionan los puntajes MoCA a lo largo del tiempo.'
                        )
                      }
                    >
                      Ver Info
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mocaScoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#82ca9d"
                        name="Puntaje MoCA"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Distribución MOCA (Asignado, Pendiente, No Requerido) */}
            <Grid item xs={12} md={6}>
              <Card className="dashboard-card">
                <CardContent>
                  <div className="chart-header">
                    <Typography variant="h6" gutterBottom>
                      Estado MOCA
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() =>
                        handleChartInfo(
                          'Cantidad de pacientes con MoCA asignado/pendiente, completado o no requerido.'
                        )
                      }
                    >
                      Ver Info
                    </Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mocaDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {mocaDistributionData.map((entry, index) => (
                          <Cell
                            key={`moca-dist-cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardScreen;
