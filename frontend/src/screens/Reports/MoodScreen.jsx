// src/screens/Reports/MoodScreen.jsx
import React, { useState } from 'react';
import { useGetDoctorWithPatientsQuery } from '../../slices/doctorApiSlice';
import '../../assets/styles/Mood.css';

const MoodScreen = () => {
  const { data: patients, isLoading, error } = useGetDoctorWithPatientsQuery();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [moodData, setMoodData] = useState([]);

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
        return;
      }
      const data = await res.json();
      setMoodData(data);
    } catch (err) {
      setMoodData([]);
    }
  };

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
                  className="patient-item"
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
