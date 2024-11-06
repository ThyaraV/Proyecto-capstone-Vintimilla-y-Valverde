import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetAssignedActivitiesQuery } from '../slices/treatmentSlice.js';
import Loader from '../components/Loader';
import '../assets/styles/PatientActivities.css';

const PatientActivitiesScreen = () => {
  const { patientId } = useParams(); // Obtener el ID del paciente desde la URL
  const { data: activities, isLoading, error } = useGetAssignedActivitiesQuery(patientId); // Consultar las actividades asignadas
  const [filteredActivities, setFilteredActivities] = useState([]);

  // Filtrar actividades asignadas para el paciente
  useEffect(() => {
    if (activities) {
      setFilteredActivities(activities);
    }
  }, [activities]);

  return (
    <div className="patient-activities-container">
      <h2>Mis Actividades Asignadas</h2>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <p>Error al cargar las actividades: {error?.data?.message || "Ocurrió un problema inesperado"}</p>
      ) : filteredActivities && filteredActivities.length > 0 ? (
        <div className="activity-list">
          {filteredActivities.map((activity) => (
            <div key={activity._id} className="activity-item">
              <h3>{activity.name}</h3>
              <p>{activity.description}</p>
              <p><strong>Nivel de Dificultad:</strong> {activity.difficultyLevel}</p>
              <p><strong>Progreso:</strong> {activity.progress || "No iniciado"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No tienes actividades asignadas en este momento.</p>
      )}
    </div>
  );
};

export default PatientActivitiesScreen;
