// MoodScreen.jsx
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
  // ScatterChart,
  // Scatter,
} from "recharts";
import { useGetDoctorWithPatientsQuery } from "../../slices/doctorApiSlice";
import "../../assets/styles/Mood.css";

const MoodScreen = () => {
  const { data: patients, isLoading, error } = useGetDoctorWithPatientsQuery();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [moodData, setMoodData] = useState([]);

  // ... Tu lógica de fetch y map de estados de ánimo ...

  return (
    <div className="mood-screen">
      <h1>Estado Emocional Semanal</h1>

      {/* Lista de pacientes */}
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
                onClick={() => {
                  setSelectedPatient(patient);
                  // fetchMoodData(patient._id);
                }}
                className="patient-item"
              >
                {patient.user.name} {patient.user.lastName}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sección de gráficas */}
      <div className="mood-chart">
        {selectedPatient ? (
          <>
            <h3>Gráficas de {selectedPatient.user.name}</h3>
            {moodData.length > 0 ? (
              <div className="chart-container">
                {/* 
                  PASO 2: Comenta todas las gráficas y deja un texto de prueba 
                  para comprobar si sigue apareciendo el error 
                */}
                <p>Test: Aquí van las gráficas (todo comentado temporalmente)</p>

                 
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  payload={[{ value: "Mood", type: "square", color: "#000" }]}
                />

                <div className="chart-item">
                  <h4>Gráfica de Línea</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="y" stroke="#007bff" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="chart-item">
                  <h4>Gráfica de Barras</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="y" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="chart-item">
                  <h4>Gráfica de Pastel</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={[]} dataKey="value" nameKey="name" />
                      <Tooltip />
                      <Legend />
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
