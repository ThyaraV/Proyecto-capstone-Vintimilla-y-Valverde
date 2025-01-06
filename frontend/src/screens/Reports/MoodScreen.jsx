// src/screens/Reports/MoodScreen.jsx
import React, { useState, useEffect } from 'react';
import { useGetDoctorWithPatientsQuery } from '../../slices/doctorApiSlice';
import '../../assets/styles/Mood.css';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#33AA99'];

const MoodScreen = () => {
  const { data: patients, isLoading, error } = useGetDoctorWithPatientsQuery();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [chartData, setChartData] = useState([]);

  const handlePatientClick = async (patient) => {
    setSelectedPatient(patient);
    try {
      const res = await fetch(`/api/users/${patient._id}/moods`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) {
        setMoodData([]);
        setChartData([]);
        return;
      }
      const data = await res.json();
      setMoodData(data);
    } catch (err) {
      setMoodData([]);
      setChartData([]);
    }
  };

  useEffect(() => {
    if (moodData.length > 0) {
      const moodCount = moodData.reduce((acc, curr) => {
        acc[curr.mood] = (acc[curr.mood] || 0) + 1;
        return acc;
      }, {});

      const formattedData = Object.keys(moodCount).map((mood) => ({
        name: mood,
        value: moodCount[mood],
      }));

      setChartData(formattedData);
    } else {
      setChartData([]);
    }
  }, [moodData]);

  return (
    <div className="mood-screen">
      <h1>Estado Emocional</h1>
      {isLoading ? (
        <p>Cargando pacientes...</p>
      ) : error ? (
        <p>Error al cargar pacientes</p>
      ) : (
        <>
          <div className="patients-list">
            <h3>Lista de Pacientes</h3>
            <ul>
              {patients.map((patient) => (
                <li
                  key={patient._id}
                  onClick={() => handlePatientClick(patient)}
                  className={`patient-item ${
                    selectedPatient && selectedPatient._id === patient._id ? 'active' : ''
                  }`}
                >
                  {patient.user.name} {patient.user.lastName}
                </li>
              ))}
            </ul>
          </div>
          {selectedPatient && (
            <div className="mood-data">
              <h3>Registros de estado emocional de {selectedPatient.user.name}</h3>
              {moodData.length > 0 ? (
                <>
                  {/* Gráfica de pastel */}
                  <div className="mood-chart">
                    <PieChart width={400} height={400}>
                      {/* Leyenda posicionada arriba y centrada */}
                      <Legend
                        layout="horizontal"
                        verticalAlign="top"
                        align="center"
                        wrapperStyle={{ marginBottom: '20px' }}
                      />
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        label
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>
                  {/* Tabla de datos emocionales */}
                  <table className="mood-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moodData.map((item) => {
                        const dateObj = new Date(item.date);
                        const date = dateObj.toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        });
                        const time = dateObj.toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <tr key={item._id}>
                            <td>{date}</td>
                            <td>{time}</td>
                            <td>{item.mood}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              ) : (
                <p>No hay datos de estado emocional para este paciente</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MoodScreen;
