// src/screens/Reports/activitiesReportScreen.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetDoctorWithPatientsQuery } from "../../slices/doctorApiSlice";
import {
  useGetTreatmentsByPatientQuery,
  useGetCompletedActivitiesByTreatmentQuery,
} from "../../slices/treatmentSlice";
import "../../assets/styles/ActivityReport.css";
import useWindowSize from "../../hooks/useWindowSize";

const ActivityReportScreen = () => {
  const {
    data: patients,
    isLoading: isLoadingPatients,
    error: errorPatients,
  } = useGetDoctorWithPatientsQuery();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  const {
    data: treatments,
    isLoading: isLoadingTreatments,
    error: errorTreatments,
  } = useGetTreatmentsByPatientQuery(
    selectedPatient ? selectedPatient._id : skipToken
  );

  const {
    data: completedActivities,
    isLoading: isLoadingActivities,
    error: errorActivities,
  } = useGetCompletedActivitiesByTreatmentQuery(
    selectedTreatment ? selectedTreatment._id : skipToken
  );

  const [groupedData, setGroupedData] = useState({});
  const [activityTypes, setActivityTypes] = useState([]);
  const [colorMap, setColorMap] = useState({});
  const [pieData, setPieData] = useState([]);

  const size = useWindowSize();

  const predefinedColors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
  ];

  useEffect(() => {
    if (completedActivities && selectedTreatment) {
      // Obtener tipos únicos de actividades
      const types = [...new Set(completedActivities.map((a) => a.activity.name))];
      setActivityTypes(types);

      // Asignar colores a cada tipo de actividad
      const colors = {};
      types.forEach((type, index) => {
        colors[type] = predefinedColors[index % predefinedColors.length];
      });
      setColorMap(colors);

      // Agrupar actividades por tipo y transformar los datos para Recharts
      const grouped = {};
      types.forEach((type) => {
        grouped[type] = completedActivities
          .filter((a) => a.activity.name === type)
          .map((a) => {
            const dateObj = new Date(a.dateCompleted);
            const shortLabel = dateObj.toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            });
            return {
              name: shortLabel, // Clave 'name' para Recharts
              score: Math.max(Number(a.scoreObtained), 0), // Clave 'score' para Recharts
              activity: a.activity.name,
              dateFull: dateObj.toLocaleDateString("es-ES"),
            };
          });
      });
      setGroupedData(grouped);

      // Preparar datos para el gráfico de pastel
      const totalScores = types.map((type) => ({
        name: type,
        value: grouped[type].reduce((sum, d) => sum + d.score, 0),
        color: colors[type],
        total: grouped[type].reduce((sum, d) => sum + d.score, 0),
      }));
      setPieData(totalScores);
    } else {
      // Limpiar datos si no hay actividades o tratamiento seleccionado
      setGroupedData({});
      setActivityTypes([]);
      setColorMap({});
      setPieData([]);
    }
  }, [completedActivities, selectedTreatment]);

  const plotWidth = Math.min(size.width * 0.9, 700);
  const plotHeight = Math.min(size.height * 0.4, 350);
  const pieSize = Math.min(size.width * 0.4, 400);

  return (
    <div className="activity-report-screen" style={{ padding: "1rem" }}>
      <h1>Reporte de Actividades de Pacientes</h1>
      <div className="content">
        {/* Selección de Paciente */}
        <div className="selection-section">
          <h3>Seleccionar Paciente</h3>
          {isLoadingPatients ? (
            <p>Cargando pacientes...</p>
          ) : errorPatients ? (
            <p>Error al cargar pacientes: {errorPatients.message}</p>
          ) : (
            <select
              value={selectedPatient ? selectedPatient._id : ""}
              onChange={(e) =>
                setSelectedPatient(
                  patients.find((p) => p._id === e.target.value)
                )
              }
            >
              <option value="">-- Seleccionar Paciente --</option>
              {patients?.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.user.name} {patient.user.lastName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selección de Tratamiento */}
        {selectedPatient && (
          <div className="selection-section">
            <h3>Seleccionar Tratamiento</h3>
            {isLoadingTreatments ? (
              <p>Cargando tratamientos...</p>
            ) : errorTreatments ? (
              <p>Error al cargar tratamientos: {errorTreatments.message}</p>
            ) : (
              <select
                value={selectedTreatment ? selectedTreatment._id : ""}
                onChange={(e) =>
                  setSelectedTreatment(
                    treatments.find((t) => t._id === e.target.value)
                  )
                }
              >
                <option value="">-- Seleccionar Tratamiento --</option>
                {treatments?.map((treatment) => (
                  <option key={treatment._id} value={treatment._id}>
                    {treatment.treatmentName}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Sección de Gráficos */}
        {selectedTreatment && (
          <div className="charts-section" style={{ marginTop: "2rem" }}>
            <h3>Reporte de Actividades - {selectedTreatment.treatmentName}</h3>
            {isLoadingActivities ? (
              <p>Cargando actividades completadas...</p>
            ) : errorActivities ? (
              <p>Error al cargar actividades: {errorActivities.message}</p>
            ) : completedActivities && completedActivities.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  marginTop: "1rem",
                }}
              >
                {/* Gráfica de Barras */}
                <div
                  className="bar-chart-container"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "1rem",
                  }}
                >
                  <h2 style={{ textAlign: "center", color: "#007bff" }}>Barras</h2>
                  <ResponsiveContainer width={plotWidth} height={plotHeight}>
                    <BarChart
                      data={activityTypes.map((type) => ({
                        name: type,
                        ...groupedData[type]?.reduce(
                          (acc, curr) => ({
                            ...acc,
                            [curr.name]: curr.score,
                          }),
                          {}
                        ),
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ angle: -45, textAnchor: "end" }} />
                      <YAxis
                        label={{
                          value: "Puntaje",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      {activityTypes.map((type) => (
                        <Bar
                          key={type}
                          dataKey={type}
                          fill={colorMap[type]}
                          stackId="a"
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfica de Pastel */}
                <div
                  className="pie-chart-container"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "1rem",
                  }}
                >
                  <h2 style={{ textAlign: "center", color: "#007bff" }}>Pastel</h2>
                  <ResponsiveContainer width={pieSize} height={pieSize}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p>No hay actividades completadas para este tratamiento.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityReportScreen;
