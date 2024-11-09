import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import {
  useGetActivitiesQuery,
  useGetAssignedActivitiesQuery,
  useAssignActivityToPatientMutation,
  useDeleteAssignedActivityMutation
} from '../../slices/treatmentSlice';
import { useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import Activity from '../../components/Activity';
import Activity2 from '../../components/Activity2';
import Activity3 from '../../components/Activity3';
import '../../assets/styles/ActivitiesScreen.css';

const UserActivity = () => {
  const { patientId } = useParams();
  const { data: activities, isLoading } = useGetActivitiesQuery();
  const { data: assignedActivitiesData, refetch } = useGetAssignedActivitiesQuery(patientId);
  const [assignActivityToPatient] = useAssignActivityToPatientMutation();
  const [deleteAssignedActivity] = useDeleteAssignedActivityMutation();
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [initialAssignedActivities, setInitialAssignedActivities] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Inicializar las actividades ya asignadas al paciente al cargar la página
  useEffect(() => {
    if (assignedActivitiesData) {
      const assignedActivities = assignedActivitiesData.map((assignment) => assignment.activity._id);
      setSelectedActivities(assignedActivities);
    }
  }, [assignedActivitiesData]);

  // Manejar la selección de actividades (sin guardar aún)
  const handleToggleActivity = async (activity) => {
    const isSelected = selectedActivities.includes(activity._id);
  
    if (isSelected) {
      // Desasignar la actividad
      const assignment = assignedActivitiesData.find(
        (assignment) => assignment.activity._id === activity._id
      );
      if (assignment) {
        try {
          await deleteAssignedActivity({ assignmentId: assignment.assignmentId, patientId }).unwrap();
          await refetch(); // Asegura que los datos se actualicen
          alert('Actividad desasignada correctamente');
        } catch (error) {
          console.error('Error al desasignar la actividad:', error);
        }
      }
    } else {
      // Asignar la actividad
      try {
        await assignActivityToPatient({
          patientId,
          doctorId: userInfo._id,
          activityId: activity._id,
        }).unwrap();
        await refetch();
        alert('Actividad asignada correctamente');
      } catch (error) {
        console.error('Error al asignar la actividad:', error);
      }
    }
  };
  

  // Guardar los cambios al hacer clic en "Guardar"
  const handleSaveChanges = async () => {
    try {
      // Asignar nuevas actividades
      const activitiesToAssign = selectedActivities.filter(
        (id) => !initialAssignedActivities.includes(id)
      );
      for (const activityId of activitiesToAssign) {
        await assignActivityToPatient({
          patientId,
          doctorId: userInfo._id,
          activityId,
        });
      }

      // Desasignar actividades no seleccionadas
      const activitiesToUnassign = initialAssignedActivities.filter(
        (id) => !selectedActivities.includes(id)
      );
      for (const activityId of activitiesToUnassign) {
        const assignment = assignedActivitiesData.find(
          (assignment) => assignment.activity._id === activityId
        );
        if (assignment) {
          await deleteAssignedActivity(assignment.assignmentId);
        }
      }

      alert('Cambios guardados correctamente');
      await refetch();
      setIsDisabled(true);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  };

  // Habilitar edición
  const handleEdit = () => {
    setIsDisabled(false);
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
                {filterActivitiesByLevel(level)?.map((activity) => {
                  const isChecked = selectedActivities.includes(activity._id);
                  return (
                    <Col key={activity._id} xs={12} md={6} lg={4} className="mb-4">
                      <div className={`activity-card ${isChecked ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity._id)}
                        onChange={() => handleToggleActivity(activity)}
                        className="activity-checkbox"
                      />
                        {level === 1 && <Activity activity={activity} />}
                        {level === 2 && <Activity2 activity={activity} />}
                        {level === 3 && <Activity3 activity={activity} />}
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ))}

          <div className="text-center mt-4">
            {isDisabled ? (
              <Button variant="primary" onClick={handleEdit}>
                Editar
              </Button>
            ) : (
              <Button variant="success" onClick={handleSaveChanges}>
                Guardar Cambios
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserActivity;
