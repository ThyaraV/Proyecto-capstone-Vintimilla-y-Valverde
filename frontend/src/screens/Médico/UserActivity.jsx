import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGetActivitiesQuery, useAssignActivityToPatientMutation, useDeleteAssignedActivityMutation } from '../../slices/treatmentSlice';
import { useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import Activity from '../../components/Activity';
import Activity2 from '../../components/Activity2';
import Activity3 from '../../components/Activity3';
import '../../assets/styles/ActivitiesScreen.css';

const UserActivity = () => {
  const { patientId } = useParams();
  const { data: activities, isLoading } = useGetActivitiesQuery();
  const [assignActivityToPatient] = useAssignActivityToPatientMutation();
  const [deleteAssignedActivity] = useDeleteAssignedActivityMutation();
  const [selectedActivities, setSelectedActivities] = useState([]);
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Manejar la selección de actividades
  const handleSelectActivity = (activityId) => {
    setSelectedActivities((prevSelected) =>
      prevSelected.includes(activityId)
        ? prevSelected.filter((id) => id !== activityId)
        : [...prevSelected, activityId]
    );
  };

  // Asignar las actividades seleccionadas al paciente
  const handleAssignActivities = async () => {
    try {
      await Promise.all(
        selectedActivities.map((activityId) =>
          assignActivityToPatient({
            patientId,
            doctorId: userInfo._id,
            activityId,
          })
        )
      );
      alert('Actividades asignadas correctamente');
      setSelectedActivities([]);
    } catch (error) {
      console.error('Error al asignar actividades:', error);
      alert('Hubo un error al asignar las actividades');
    }
  };

  // Eliminar una actividad asignada
  const handleDeleteActivity = async (assignmentId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      try {
        await deleteAssignedActivity(assignmentId);
        alert('Actividad eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar la actividad:', error);
        alert('Hubo un error al eliminar la actividad');
      }
    }
  };

  // Filtrar actividades por nivel
  const filterActivitiesByLevel = (level) => activities?.filter((activity) => activity.difficultyLevel === level);

  return (
    <div className="user-activity-container">
      <h1 className="text-center mb-5">Asignación de Actividades</h1>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {[1, 2, 3].map((level) => (
            <div key={level} className="activity-container mb-5">
              <h2 className="activity-name mb-3">Nivel {level}</h2>
              <Row className="activity-levels">
                {filterActivitiesByLevel(level)?.map((activity) => (
                  <Col key={activity._id} xs={12} md={6} lg={4} className="mb-4">
                    <div className={`activity-card ${selectedActivities.includes(activity._id) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity._id)}
                        onChange={() => handleSelectActivity(activity._id)}
                        className="activity-checkbox"
                      />
                      {level === 1 && <Activity activity={activity} />}
                      {level === 2 && <Activity2 activity={activity} />}
                      {level === 3 && <Activity3 activity={activity} />}
                      <Button variant="danger" onClick={() => handleDeleteActivity(activity.assignmentId)} className="mt-2">
                        Eliminar
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
          <Button onClick={handleAssignActivities} className="assign-button mt-4">
            Asignar Actividades Seleccionadas
          </Button>
        </>
      )}
    </div>
  );
};

export default UserActivity;
