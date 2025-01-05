// src/screens/Reports/MoodScreen.jsx
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";
import { useGetDoctorWithPatientsQuery } from "../../slices/doctorApiSlice";
import "../../assets/styles/Mood.css"; // Archivo de estilos

const MoodScreen = () => {
  const { data: patients, isLoading, error } = useGetDoctorWithPatientsQuery();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [moodData, setMoodData] = useState([]);

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
    name: mood,
    color,
  }));

  // Preparar datos para el gráfico de pastel
  const pieData = moodData.reduce((acc, { mood, color }) => {
    const found = acc.find((item) => item.name === mood);
    if (found) {
      found.value += 1;
    } else {
      acc.push({ name: mood, value: 1, color });
    }
    return acc;
  }, []);

  // Preparar datos para el ScatterChart (análogo a MarkSeries)
  const scatterData = moodData.map((d) => ({
    x: d.x,
    y: d.y,
    color: d.color,
    mood: d.mood,
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
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  payload={legendItems.map((item) => ({
                    value: item.name,
                    type: "square",
                    color: item.color,
                  }))}
                />

                {/* Gráfica de Línea */}
                <div className="chart-item">
                  <h4>Gráfica de Línea</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={moodData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="x"
                        tickFormatter={(tick) => moodData[tick]?.date || ""}
                        label={{
                          value: "Tiempo",
                          position: "insideBottom",
                          offset: -40,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Estado Emocional",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        formatter={(value, name, props) => {
                          if (name === "y") {
                            const mood = moodMap[props.payload.mood]?.mood || "Desconocido";
                            return [`${mood} (${value})`, "Adherencia"];
                          }
                          return value;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#007bff"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfica de Barras */}
                <div className="chart-item">
                  <h4>Gráfica de Barras</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={moodData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="x"
                        tickFormatter={(tick) => moodData[tick]?.date || ""}
                        label={{
                          value: "Tiempo",
                          position: "insideBottom",
                          offset: -40,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Estado Emocional",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Bar dataKey="y" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfica de Pastel */}
                <div className="chart-item">
                  <h4>Gráfica de Pastel</h4>
                  <ResponsiveContainer width="100%" height={300}>
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
