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
  const [barChartData, setBarChartData] = useState([]);

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
      const types = [
        ...new Set(completedActivities.map((a) => a.activity.name)),
      ];
      setActivityTypes(types);

      // Asignar colores a cada tipo de actividad
      const colors = {};
      types.forEach((type, index) => {
        colors[type] =
          predefinedColors[index % predefinedColors.length] || "#000000";
      });
      setColorMap(colors);

      // Agrupar actividades por fecha y tipo
      const groupedByDate = {};

      completedActivities.forEach((activity) => {
        const dateObj = new Date(activity.dateCompleted);
        const formattedDate = dateObj.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        });

        if (!groupedByDate[formattedDate]) {
          groupedByDate[formattedDate] = { date: formattedDate };
        }

        const activityName = activity.activity.name;
        const score = Math.max(Number(activity.scoreObtained), 0);

        if (groupedByDate[formattedDate][activityName]) {
          groupedByDate[formattedDate][activityName] += score;
        } else {
          groupedByDate[formattedDate][activityName] = score;
        }
      });

      // Transformar el objeto agrupado en un array
      const transformedData = Object.values(groupedByDate);
      setBarChartData(transformedData);

      // Preparar datos para el gráfico de pastel
      const totalScores = types.map((type) => ({
        name: type,
        value: completedActivities
          .filter((a) => a.activity.name === type)
          .reduce((sum, a) => sum + Math.max(Number(a.scoreObtained), 0), 0),
        color: colors[type],
      }));
      setPieData(totalScores);
    } else {
      // Limpiar datos si no hay actividades o tratamiento seleccionado
      setGroupedData({});
      setActivityTypes([]);
      setColorMap({});
      setPieData([]);
      setBarChartData([]);
    }
  }, [completedActivities, selectedTreatment]);

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
            <h2>Reporte de Actividades - {selectedTreatment.treatmentName}</h2>
            {isLoadingActivities ? (
              <p>Cargando actividades completadas...</p>
            ) : errorActivities ? (
              <p>Error al cargar actividades: {errorActivities.message}</p>
            ) : completedActivities && completedActivities.length > 0 ? (
              <div
                className="charts-container"
                style={{
                  display: "flex",
                  flexDirection: "column", // Cambiar a columna
                  gap: "2rem",
                  justifyContent: "center",
                  alignItems: "center", // Centrar horizontalmente
                  marginTop: "1rem",
                }}
              >
              <h4>Gráfico por Fechas</h4>
                {/* Gráfico de Barras */}
                <div
                  className="bar-chart-container"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "1rem",
                    width: "100%", // Ancho completo
                    maxWidth: "800px", // Ancho máximo para pantallas grandes
                    height: "500px", // Altura aumentada para gráficos más grandes
                  }}
                >
                  <h2 style={{ textAlign: "center", color: "#007bff" }}>
                    Barras
                  </h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ angle: -45, textAnchor: "end" }}
                        interval={0}
                        height={60} // Espacio para etiquetas inclinadas
                      />
                      <YAxis
                        label={{
                          value: "Puntaje",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} />
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
                
                <h4>Gráfico por Actividades</h4>
                {/* Gráfico de Pastel */}
                <div
                  className="pie-chart-container"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "1rem",
                    width: "100%", // Ancho completo
                    maxWidth: "600px", // Ancho máximo para pantallas grandes
                    height: "500px", // Altura aumentada para gráficos más grandes
                  }}
                >
                  <h2 style={{ textAlign: "center", color: "#007bff" }}>
                    Pastel
                  </h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={150} // Ajusta el radio para hacer el pastel más grande
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
