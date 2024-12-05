// src/components/UserActivity.jsx

import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  useGetActivitiesByUserQuery,
  useGetActiveTreatmentQuery,
  useGetCompletedActivitiesQuery,
} from '../slices/treatmentSlice.js';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Activity from '../components/Activity';
import Activity2 from '../components/Activity2';
import Activity3 from '../components/Activity3';
import '../assets/styles/ActivitiesScreen.css';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';

const UserActivity = () => {
  // Obtener la información del usuario autenticado desde el estado de Redux
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Obtener el userId
  const userId = userInfo?._id;
  console.log('userId:', userId);

  // Obtener el tratamiento activo del usuario
  const {
    data: activeTreatment,
    isLoading: isTreatmentLoading,
    error: treatmentError,
  } = useGetActiveTreatmentQuery(userId, {
    skip: !userId, // Omitir la consulta si no hay userId
  });

  // Obtener las actividades asignadas al paciente
  const {
    data: activities,
    isLoading: isActivitiesLoading,
    error: activitiesError,
    refetch: refetchAssignedActivities,
  } = useGetActivitiesByUserQuery(userId, {
    skip: !userId || !activeTreatment, // Omitir la consulta si no hay userId o tratamiento activo
    refetchOnMountOrArgChange: true,
  });

  // Obtener actividades completadas por el usuario
  const {
    data: completedActivitiesData,
    isLoading: isCompletedActivitiesLoading,
    error: completedActivitiesError,
    refetch: refetchCompletedActivities,
  } = useGetCompletedActivitiesQuery(undefined, {
    skip: !userId || !activeTreatment, // Omitir la consulta si no hay userId o tratamiento activo
  });

  const [uniqueActivities, setUniqueActivities] = useState([]);
  const [completedActivityIds, setCompletedActivityIds] = useState(new Set());

  // Filtrar y eliminar duplicados al cargar las actividades
  useEffect(() => {
    if (activities) {
      console.log('Actividades obtenidas:', activities);
      // Eliminar actividades duplicadas basadas en el ID
      const filteredActivities = activities.reduce((acc, current) => {
        const existingActivity = acc.find((item) => item._id === current._id);
        if (!existingActivity) {
          acc.push(current);
        }
        return acc;
      }, []);
      console.log('Actividades únicas:', filteredActivities);
      setUniqueActivities(filteredActivities);
    } else {
      // Si no hay actividades, limpiar la lista
      setUniqueActivities([]);
    }
  }, [activities]);

  // Obtener IDs de actividades completadas
  useEffect(() => {
    if (completedActivitiesData) {
      const completedIds = new Set(
        completedActivitiesData.map((completed) => completed.activity._id)
      );
      setCompletedActivityIds(completedIds);
    } else {
      setCompletedActivityIds(new Set());
    }
  }, [completedActivitiesData]);

  // Manejar la conexión de Socket.io
  useEffect(() => {
    if (!userInfo || !activeTreatment) {
      console.warn('El usuario o el tratamiento activo no están definidos');
      return;
    }

    // Inicializar el socket
    const socket = io('http://localhost:5000'); // Asegúrate de que el puerto es correcto

    socket.on('connect', () => {
      console.log('Conectado al servidor de Socket.io con ID:', socket.id);
    });

    // Escuchar eventos de actualización de actividades completadas
    socket.on(`treatmentActivitiesUpdated:${activeTreatment._id}`, (data) => {
      console.log(
        `Evento treatmentActivitiesUpdated recibido para el tratamiento ${activeTreatment._id}`,
        data
      );
      refetchAssignedActivities(); // Vuelve a cargar las actividades asignadas en tiempo real
      refetchCompletedActivities(); // Vuelve a cargar las actividades completadas en tiempo real
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor de Socket.io');
    });

    // Limpiar el socket al desmontar el componente o cuando userId o activeTreatment cambien
    return () => {
      socket.disconnect();
      console.log('Socket desconectado en cleanup');
    };
  }, [userInfo, userId, activeTreatment, refetchAssignedActivities, refetchCompletedActivities]);

  // Verificar si los datos están cargando o hay errores
  if (
    isTreatmentLoading ||
    isActivitiesLoading ||
    isCompletedActivitiesLoading
  ) {
    return <Loader />;
  }

  if (treatmentError) {
    return (
      <Message variant="danger">
        Error al cargar tratamiento activo: {treatmentError.message}
      </Message>
    );
  }

  if (activitiesError) {
    return (
      <Message variant="danger">
        Error al cargar actividades: {activitiesError.message}
      </Message>
    );
  }

  if (completedActivitiesError) {
    return (
      <Message variant="danger">
        Error al cargar actividades completadas: {completedActivitiesError.message}
      </Message>
    );
  }

  return (
    <div className="user-activity-container">
      <h1 className="text-center mb-5">Mis Actividades Asignadas</h1>

      {uniqueActivities && uniqueActivities.length > 0 ? (
        <>
          <h3>Actividades Asignadas</h3>
          <Row className="activity-levels">
            {uniqueActivities.map((activity) => {
              console.log('Activity ID:', activity._id);

              const isCompleted = completedActivityIds.has(activity._id);

              // Determinar el estilo según si la actividad está completada
              const activityStyle = isCompleted
                ? { pointerEvents: 'none', opacity: 0.5 }
                : {};

              return (
                <Col
                  key={activity._id}
                  xs={12}
                  md={6}
                  lg={4}
                  className="mb-4"
                >
                  {/* Verificar que activeTreatment está definido antes de construir el Link */}
                  {activeTreatment ? (
                    <div style={{ position: 'relative', ...activityStyle }}>
                      <Link
                        to={
                          isCompleted
                            ? '#'
                            : `/treatments/${activeTreatment._id}/activities/play/${activity._id}`
                        }
                        style={{ textDecoration: 'none' }}
                      >
                        {activity.difficultyLevel === 1 && (
                          <Activity
                            activity={{
                              name: activity.name,
                              description: activity.description,
                              image: activity.image,
                              type: activity.type,
                            }}
                          />
                        )}
                        {activity.difficultyLevel === 2 && (
                          <Activity2
                            activity={{
                              name: activity.name,
                              description: activity.description,
                              image: activity.image,
                              type: activity.type,
                            }}
                          />
                        )}
                        {activity.difficultyLevel === 3 && (
                          <Activity3
                            activity={{
                              name: activity.name,
                              description: activity.description,
                              image: activity.image,
                              type: activity.type,
                            }}
                          />
                        )}
                      </Link>
                      {isCompleted && (
                        <div className="completed-overlay">
                          <span>Actividad Completada</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Message variant="warning">
                      No se encontró un tratamiento activo para esta actividad.
                    </Message>
                  )}
                </Col>
              );
            })}
          </Row>
        </>
      ) : (
        <p>No tienes actividades asignadas.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default UserActivity;
