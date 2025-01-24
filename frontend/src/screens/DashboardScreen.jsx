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

  // Consultas de Doctores, Pacientes, Usuarios y MoCA
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

  // Estados de Filtro
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTreatmentStatus, setSelectedTreatmentStatus] = useState('all');

  // Unir datos de pacientes con el estado isActive de la lista de usuarios
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

  // Manejo de cambios en los filtros
  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleTreatmentStatusChange = (event) => {
    setSelectedTreatmentStatus(event.target.value);
  };

  // Filtrar pacientes por doctor y estado (activo/inactivo)
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

  // Preparar IDs de Pacientes para obtener los tratamientos de varios pacientes
  const patientIdsForTreatments = useMemo(() => {
    return filteredPatients.map((p) => p._id);
  }, [filteredPatients]);

  // Obtener los tratamientos con base en los pacientes filtrados
  const [
    fetchTreatments,
    {
      data: treatmentsData,
      isLoading: isLoadingTreatments,
      isError: isErrorTreatments,
      error: errorTreatments,
    },
  ] = useGetTreatmentsByMultiplePatientsMutation();

  useEffect(() => {
    if (patientIdsForTreatments.length > 0) {
      fetchTreatments({ patientIds: patientIdsForTreatments })
        .unwrap()
        .catch((err) => {
          enqueueSnackbar(
            `Error al obtener tratamientos: ${err.data?.message || err.error}`,
            { variant: 'error' }
          );
        });
    }
  }, [patientIdsForTreatments, fetchTreatments, enqueueSnackbar]);

  // Filtrar tratamientos por estado (selectedTreatmentStatus)
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

  // Calcular Actividades y Medicamentos filtrados (Sujeto a los filtros)
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

  // Calcular Medicamentos Filtrados y Determinar 'takenToday'
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

  // KPIs según los tratamientos filtrados
  const totalTreatments = filteredTreatments.length;
  const completedTreatments = filteredTreatments.filter(
    (t) => t.progress === 'empeorando' || t.progress === 'mejorando'
  ).length;
  const treatmentCompletionRate =
    totalTreatments > 0
      ? ((completedTreatments / totalTreatments) * 100).toFixed(2)
      : '0.00';

  const totalActivities = filteredActivities.length;
  const uniqueActivities = [
    ...new Set(filteredActivities.map((a) => a.activity?.name || 'Sin Nombre')),
  ].length;

  const totalMedications = filteredMedications.length;
  const medicationsTaken = filteredMedications.filter((m) => m.takenToday)
    .length;
  const medicationsComplianceRate =
    totalMedications > 0
      ? ((medicationsTaken / totalMedications) * 100).toFixed(2)
      : '0.00';

  // Datos para gráfico "Progreso de Tratamientos" (Todos los tratamientos)
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

  // Datos para gráfico "Actividades Completadas"
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

  // Datos para gráfico "Cumplimiento de Medicamentos"
  const medicationComplianceData = useMemo(() => {
    const taken = filteredMedications.filter((m) => m.takenToday).length;
    const notTaken = filteredMedications.length - taken;
    return [
      { name: 'Tomados', value: taken },
      { name: 'No Tomados', value: notTaken },
    ];
  }, [filteredMedications]);

  // Datos para gráfico "Activos vs Inactivos" (Pacientes)
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

  // Datos para gráfico "Distribución de Pacientes por Doctor"
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

  // Datos para gráficos de MoCA
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

  // Manejo de estados de carga y error
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

  return (
    <Container maxWidth="xl" style={{ padding: '2rem 0' }}>
      {/* Filtros y Título */}
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
            <InputLabel id="treatment-status-select-label">Tratamientos</InputLabel>
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

      {/* Sección Principal: Pacientes Asignados + KPIs (Izquierda), Gráficos (Derecha) */}
      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        {/* Columna Izquierda */}
        <Grid item xs={12} md={4}>
          {/* Pacientes Asignados */}
          <Card style={{ marginBottom: '20px' }}>
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

          {/* KPIs */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <KPICard
                title="Adherencia de Trat."
                value={`${treatmentCompletionRate}%`}
                subtitle="Nivel de adherencia"
              />
            </Grid>
            <Grid item xs={12}>
              <KPICard
                title="Actividades Complet."
                value={`${totalActivities}`}
                subtitle={`Distintas: ${uniqueActivities}`}
              />
            </Grid>
            <Grid item xs={12}>
              <KPICard
                title="Cumpl. Medicamentos"
                value={`${medicationsComplianceRate}%`}
                subtitle={`${medicationsTaken}/${totalMedications} tomados`}
              />
            </Grid>
            <Grid item xs={12}>
              <KPICard
                title="Tratamientos Totales"
                value={totalTreatments}
                subtitle="Tras filtros"
              />
            </Grid>
            {/* KPIs de MoCA */}
            <Grid item xs={12}>
              <KPICard
                title="Puntaje Promedio MoCA"
                value={`${mocaAverageScore}`}
                subtitle="Promedio de puntajes MoCA"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Columna Derecha: Gráficos */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Distribución Pacientes (Activos/Inactivos) */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribución Pacientes (Activos/Inactivos)
                  </Typography>
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
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribución Pacientes por Doctor
                  </Typography>
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

            {/* Gráfico de Actividades Completadas */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Actividades Completadas
                  </Typography>
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

            {/* Gráfico de Cumplimiento de Medicamentos */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cumplimiento de Medicamentos
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={medicationComplianceData}
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

            {/* Gráfico de Progreso de Tratamientos (Todos) */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Progreso de Tratamientos (Todos)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={progressAllData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="progress" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill="#8884d8"
                        name="Nro. de Tratamientos"
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Gráficos de MoCA */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribución de Puntajes MoCA
                  </Typography>
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tendencia de Puntajes MoCA
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mocaScoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="score"
                        fill="#82ca9d"
                        name="Puntaje MoCA"
                        barSize={40}
                      />
                    </BarChart>
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
