import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetActivitiesQuery, useAssignActivityToPatientMutation } from '../../slices/treatmentSlice.js';
import { useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import '../../assets/styles/UserActivity.css';

const UserActivity = () => {
  const { patientId } = useParams(); // Obtener el ID del paciente de la URL
  const { data: activities, isLoading } = useGetActivitiesQuery(); // Obtener las actividades desde la API
  const [assignActivityToPatient] = useAssignActivityToPatientMutation(); // Mutación para asignar actividades
  const [selectedActivities, setSelectedActivities] = useState([]); // Estado para almacenar actividades seleccionadas

  const userInfo = useSelector((state) => state.auth.userInfo); // Información del usuario logueado
  
  // Manejar la selección de actividades
  const handleSelectActivity = (activityId) => {
    setSelectedActivities(prevSelected =>
      prevSelected.includes(activityId)
        ? prevSelected.filter(id => id !== activityId) // Deseleccionar si ya está seleccionado
        : [...prevSelected, activityId] // Seleccionar si no está en la lista
    );
  };

  // Asignar las actividades seleccionadas al paciente
  const handleAssignActivities = async () => {
    try {
      await Promise.all(
        selectedActivities.map(activityId =>
          assignActivityToPatient({
            patientId,
            doctorId: userInfo._id,
            activityId,
          })
        )
      );
      alert("Actividades asignadas correctamente");
      setSelectedActivities([]); // Limpiar las actividades seleccionadas
    } catch (error) {
      console.error("Error al asignar actividades:", error);
      alert("Hubo un error al asignar las actividades");
    }
  };

  // Filtrar actividades por nivel
  const filterActivitiesByLevel = (level) => activities.filter(activity => activity.difficultyLevel === level);

  return (
    <div className="user-activity-container">
      <h2>Asignación de Actividades</h2>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {[1, 2, 3].map(level => (
            <div key={level}>
              <h3>Nivel {level}</h3>
              <div className="activity-list">
                {filterActivitiesByLevel(level).map(activity => (
                  <div key={activity._id} className="activity-item">
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(activity._id)}
                      onChange={() => handleSelectActivity(activity._id)}
                    />
                    <span>{activity.name}</span>
                    <p>{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleAssignActivities} className="assign-button">
            Asignar Actividades Seleccionadas
          </button>
        </>
      )}
    </div>
  );
};

export default UserActivity;
