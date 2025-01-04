// src/screens/Reports/ActivityReportScreen.jsx
import React, { useState, useEffect } from "react";
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalBarSeries,
  DiscreteColorLegend,
  Hint,
  RadialChart,
} from "react-vis";
import "react-vis/dist/style.css";
import { skipToken } from "@reduxjs/toolkit/query/react";

// Tus queries y hooks
import { useGetDoctorWithPatientsQuery } from "../../slices/doctorApiSlice";
import {
  useGetTreatmentsByPatientQuery,
  useGetCompletedActivitiesByTreatmentQuery,
} from "../../slices/treatmentSlice";

// Tu CSS y hooks
import "../../assets/styles/ActivityReport.css";
import useWindowSize from "../../hooks/useWindowSize";

const ActivityReportScreen = () => {
  // ---------------------------
  //   QUERIES / DATA FETCHING
  // ---------------------------
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

  // ---------------------------
  //   ESTADOS PARA GRÁFICAS
  // ---------------------------
  const [groupedData, setGroupedData] = useState({});
  const [activityTypes, setActivityTypes] = useState([]);
  const [colorMap, setColorMap] = useState({});

  // Tooltips (Barras y Pastel)
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredPie, setHoveredPie] = useState(null);

  // Datos del pastel
  const [pieData, setPieData] = useState([]);

  // Hook tamaño ventana
  const size = useWindowSize();

  // Paleta de colores
  const predefinedColors = [
    "#1f77b4", // Azul
    "#ff7f0e", // Naranja
    "#2ca02c", // Verde
    "#d62728", // Rojo
    "#9467bd", // Morado
    "#8c564b", // Marrón
    "#e377c2", // Rosa
    "#7f7f7f", // Gris
    "#bcbd22", // Amarillo
    "#17becf", // Turquesa
  ];

  // ---------------------------
  //   useEffect: Procesar DATOS
  // ---------------------------
  useEffect(() => {
    if (completedActivities && selectedTreatment) {
      // 1. Tipos de actividad
      const types = [...new Set(completedActivities.map((a) => a.activity.name))];
      setActivityTypes(types);

      // 2. Colores por actividad
      const colors = {};
      types.forEach((type, index) => {
        colors[type] = predefinedColors[index % predefinedColors.length];
      });
      setColorMap(colors);

      // 3. Datos para barras
      const grouped = {};
      types.forEach((type) => {
        grouped[type] = completedActivities
          .filter((a) => a.activity.name === type)
          .map((a) => ({
            x: new Date(a.dateCompleted).toLocaleDateString("es-ES"),
            y: Number(a.scoreObtained) || 0,
            activity: a.activity.name,
            date: new Date(a.dateCompleted).toLocaleDateString("es-ES"),
          }));
      });
      setGroupedData(grouped);

      // 4. Datos para pastel
      const totalScores = types.map((type) => {
        const total = completedActivities
          .filter((a) => a.activity.name === type)
          .reduce((sum, a) => sum + (Number(a.scoreObtained) || 0), 0);
        return {
          angle: total,
          label: type,
          color: colors[type],
          total: total,
        };
      });
      setPieData(totalScores);
    } else {
      setGroupedData({});
      setActivityTypes([]);
      setColorMap({});
      setPieData([]);
    }
  }, [completedActivities, selectedTreatment]);

  // ---------------------------
  //   DIMENSIONES (igual que CombinedChartsExample)
  // ---------------------------
  const barWidth = 400;
  const barHeight = 300;
  const pieSize = 300;

  return (
    <div className="activity-report-screen">
      <h1>Reporte de Actividades de Pacientes</h1>

      <div className="content">
        {/* ---------------------------
            SELECCIÓN DE PACIENTE
        --------------------------- */}
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

        {/* ---------------------------
            SELECCIÓN DE TRATAMIENTO
        --------------------------- */}
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

        {/* ---------------------------
            GRÁFICAS (SIDE BY SIDE)
        --------------------------- */}
        {selectedTreatment && (
          <div className="charts-section">
            <h3>Reporte de Actividades - {selectedTreatment.treatmentName}</h3>
            {isLoadingActivities ? (
              <p>Cargando actividades completadas...</p>
            ) : errorActivities ? (
              <p>
                Error al cargar actividades:{" "}
                {errorActivities.data?.message || errorActivities.error}
              </p>
            ) : completedActivities && completedActivities.length > 0 ? (
              // Mismo layout que CombinedChartsExample
              <div
                style={{
                  display: "flex",
                  gap: "3rem",
                  justifyContent: "center",
                  marginTop: "2rem",
                  flexWrap: "wrap",
                }}
              >
                {/* =============================
                    CONTENEDOR DEL DIAGRAMA DE BARRAS
                ============================= */}
                <div
                  className="bar-chart-container"
                  style={{ position: "relative", overflow: "visible" }}
                >
                  <h2 style={{ textAlign: "center" }}>Barras</h2>
                  <XYPlot
                    xType="ordinal"
                    width={barWidth}
                    height={barHeight}
                    // Al salir de la gráfica, borramos tooltip
                    onMouseLeave={() => setHoveredBar(null)}
                    style={{ zIndex: 1 }}
                  >
                    <HorizontalGridLines />
                    <XAxis />
                    <YAxis />

                    {/* DIBUJO DE BARRAS */}
                    {activityTypes.map((type) => (
                      <VerticalBarSeries
                        key={type}
                        data={groupedData[type]}
                        color={colorMap[type]}
                        onValueMouseOver={(datapoint) => {
                          // Guardamos info en hoveredBar
                          setHoveredBar(datapoint);
                        }}
                        onValueMouseOut={() => {}}
                      />
                    ))}

                    {/* TOOLTIP BARRAS */}
                    {hoveredBar && (
                      <Hint
                        value={{ x: hoveredBar.x, y: hoveredBar.y }}
                        style={{ zIndex: 9999 }}
                      >
                        <div
                          style={{
                            background: "white",
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            borderRadius: "6px",
                            pointerEvents: "none",
                          }}
                        >
                          <div>
                            <strong>Actividad:</strong> {hoveredBar.activity}
                          </div>
                          <div>
                            <strong>Fecha:</strong> {hoveredBar.date}
                          </div>
                          <div>
                            <strong>Puntaje:</strong> {hoveredBar.y}
                          </div>
                        </div>
                      </Hint>
                    )}
                  </XYPlot>
                </div>

                {/* =============================
                    CONTENEDOR DEL DIAGRAMA DE PASTEL
                ============================= */}
                <div
                  className="pie-chart-container"
                  style={{ position: "relative", overflow: "visible" }}
                >
                  <h2 style={{ textAlign: "center" }}>Pastel</h2>

                  {/* Leyenda opcional */}
                  <DiscreteColorLegend
                    orientation="horizontal"
                    items={pieData.map((d) => ({
                      title: d.label,
                      color: d.color,
                    }))}
                  />

                  <RadialChart
                    data={pieData}
                    width={pieSize}
                    height={pieSize}
                    showLabels={true}
                    colorType="literal"
                    onMouseLeave={() => setHoveredPie(null)}
                    onValueMouseOver={(datapoint) => {
                      setHoveredPie(datapoint);
                    }}
                    onValueMouseOut={() => {}}
                    style={{ zIndex: 1 }}
                  >
                    {hoveredPie && (
                      <Hint value={hoveredPie} style={{ zIndex: 9999 }}>
                        <div
                          style={{
                            background: "white",
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            borderRadius: "6px",
                            pointerEvents: "none",
                          }}
                        >
                          <div>
                            <strong>Actividad:</strong> {hoveredPie.label}
                          </div>
                          <div>
                            <strong>Valor:</strong> {hoveredPie.angle}
                          </div>
                        </div>
                      </Hint>
                    )}
                  </RadialChart>
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
