import React, { useState } from "react";
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
  VerticalBarSeries,
  RadialChart,
  MarkSeries,
  Hint,
  DiscreteColorLegend,
} from "react-vis";
import "react-vis/dist/style.css";
import { useGetDoctorWithPatientsQuery } from "../../slices/doctorApiSlice";
import "../../assets/styles/Mood.css"; // Archivo de estilos

const MoodScreen = () => {
  const { data: patients, isLoading, error } = useGetDoctorWithPatientsQuery();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [hintValue, setHintValue] = useState(null);

  const moodMap = {
    "😠": { value: 1, color: "#FF0000" }, // Rojo
    "🤢": { value: 2, color: "#8A2BE2" }, // Violeta
    "😢": { value: 3, color: "#1E90FF" }, // Azul
    "😴": { value: 4, color: "#A9A9A9" }, // Gris
    "🤔": { value: 5, color: "#FFA500" }, // Naranja
    "😎": { value: 6, color: "#32CD32" }, // Verde
    "😊": { value: 7, color: "#FFD700" }, // Amarillo
    "🤩": { value: 8, color: "#FF69B4" }, // Rosa
  };

  const fetchMoodData = async (patientId) => {
    try {
      const response = await fetch(`/api/users/${patientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      const transformedData = data.map((entry, index) => ({
        x: index,
        y: moodMap[entry.mood]?.value || 0,
        date: new Date(entry.date).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        mood: entry.mood,
        color: moodMap[entry.mood]?.color || "#000000",
      }));
      setMoodData(transformedData);
    } catch (err) {
      console.error("Error al obtener datos de estado emocional:", err);
      setMoodData([]);
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    fetchMoodData(patient._id);
  };

  const legendItems = Object.entries(moodMap).map(([mood, { color }]) => ({
    title: mood,
    color,
  }));

  return (
    <div className="mood-screen">
      <h1>Estado Emocional Semanal</h1>
      <div className="patients-list">
        <h3>Lista de Pacientes</h3>
        {isLoading ? (
          <p>Cargando pacientes...</p>
        ) : error ? (
          <p>Error al cargar pacientes: {error.message}</p>
        ) : (
          <ul>
            {patients.map((patient) => (
              <li
                key={patient._id}
                onClick={() => handlePatientClick(patient)}
                className="patient-item"
              >
                {patient.user.name} {patient.user.lastName}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mood-chart">
        {selectedPatient ? (
          <>
            <h3>Gráficas de {selectedPatient.user.name}</h3>
            {moodData.length > 0 ? (
              <div className="chart-container">
                <DiscreteColorLegend
                  items={legendItems}
                  orientation="horizontal"
                  className="chart-legend"
                />

                <div className="chart-item">
                  <h4>Gráfica de Línea</h4>
                  <XYPlot
                    height={300}
                    width={window.innerWidth > 768 ? 800 : window.innerWidth - 40}
                    margin={{ left: 50, right: 50, top: 20, bottom: 50 }}
                  >
                    <HorizontalGridLines />
                    <XAxis
                      title="Tiempo"
                      tickFormat={(v) => moodData[v]?.date || ""}
                    />
                    <YAxis title="Estado Emocional" />
                    <LineSeries
                      data={moodData}
                      style={{ stroke: "#007bff", strokeWidth: 3 }}
                    />
                    <MarkSeries
                      data={moodData.map((d) => ({
                        x: d.x,
                        y: d.y,
                        color: d.color,
                      }))}
                      colorType="literal"
                      size={5}
                    />
                  </XYPlot>
                </div>

                <div className="chart-item">
                  <h4>Gráfica de Barras</h4>
                  <XYPlot
                    height={300}
                    width={window.innerWidth > 768 ? 800 : window.innerWidth - 40}
                    margin={{ left: 50, right: 50, top: 20, bottom: 50 }}
                  >
                    <HorizontalGridLines />
                    <XAxis
                      title="Tiempo"
                      tickFormat={(v) => moodData[v]?.date || ""}
                    />
                    <YAxis title="Estado Emocional" />
                    <VerticalBarSeries
                      data={moodData.map((d) => ({
                        x: d.x,
                        y: d.y,
                        color: d.color,
                      }))}
                      colorType="literal"
                    />
                  </XYPlot>
                </div>

                <div className="chart-item">
                  <h4>Gráfica de Pastel</h4>
                  <RadialChart
                    data={moodData.reduce((acc, { mood, color }) => {
                      const found = acc.find((item) => item.label === mood);
                      if (found) {
                        found.angle++;
                      } else {
                        acc.push({ label: mood, angle: 1, color });
                      }
                      return acc;
                    }, [])}
                    width={window.innerWidth > 768 ? 300 : 200}
                    height={window.innerWidth > 768 ? 300 : 200}
                    colorType="literal"
                    showLabels
                  />
                </div>
              </div>
            ) : (
              <p>No hay datos de estado emocional para este paciente.</p>
            )}
          </>
        ) : (
          <p>Seleccione un paciente para ver sus gráficas de estado emocional.</p>
        )}
      </div>
    </div>
  );
};

export default MoodScreen;

