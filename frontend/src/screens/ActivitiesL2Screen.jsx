// src/components/UserActivity.jsx

import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useGetActivitiesByUserQuery, useGetActiveTreatmentQuery } from '../slices/treatmentSlice.js'; // Importar useGetActiveTreatmentQuery
import Loader from '../components/Loader';
import Message from '../components/Message';
import Activity from '../components/Activity';
import Activity2 from '../components/Activity2';
import Activity3 from '../components/Activity3';
import '../assets/styles/ActivitiesScreen.css';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom'; // Importar Link

const UserActivity = () => {
  // Obtener la información del usuario autenticado desde el estado de Redux
  const userInfo = useSelector((state) => state.auth.userInfo);
  
  // Obtener el userId
  const userId = userInfo?._id;
  console.log('userId:', userId);

  // Obtener las actividades asignadas al paciente
  const { data: activities, isLoading: isActivitiesLoading, error: activitiesError, refetch } = useGetActivitiesByUserQuery(userId, {
    skip: !userId, // Omitir la consulta si no hay userId
    refetchOnMountOrArgChange: true,
  });

  // Obtener el tratamiento activo del usuario
  const { data: activeTreatment, isLoading: isTreatmentLoading, error: treatmentError } = useGetActiveTreatmentQuery(userId, {
    skip: !userId, // Omitir la consulta si no hay userId
  });

  const [uniqueActivities, setUniqueActivities] = useState([]);

  // Filtrar y eliminar duplicados al cargar las actividades
  useEffect(() => {
    if (activities) {
      console.log('Actividades obtenidas:', activities);
      // Eliminar actividades duplicadas basadas en el ID
      const filteredActivities = activities.reduce((acc, current) => {
        const existingActivity = acc.find(
          (item) => item._id === current._id
        );
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

  // Manejar la conexión de Socket.io
  useEffect(() => {
    if (!userInfo) {
      console.warn('El usuario no está definido');
      return;
    }

    // Inicializar el socket
    const socket = io('http://localhost:5000'); // Asegúrate de que el puerto es correcto

    socket.on('connect', () => {
      console.log('Conectado al servidor de Socket.io con ID:', socket.id);
    });

    // Ajusta el evento según cómo esté emitido en el backend
    if (userId) {
      socket.on(`patientActivitiesUpdated:${userId}`, (data) => {
        console.log(`Evento patientActivitiesUpdated recibido para el usuario ${userId}`, data);
        refetch(); // Vuelve a cargar las actividades asignadas en tiempo real
      });
    }

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor de Socket.io');
    });

    // Limpiar el socket al desmontar el componente o cuando userId cambie
    return () => {
      socket.disconnect();
      console.log('Socket desconectado en cleanup');
    };
  }, [userInfo, userId, refetch]);

  // Verificar si el tratamiento activo está cargando o hay errores
  if (isTreatmentLoading) {
    return <Loader />;
  }

  if (treatmentError) {
    return <Message variant="danger">Error al cargar tratamiento activo: {treatmentError.message}</Message>;
  }

  return (
    <div className="user-activity-container">
      <h1 className="text-center mb-5">Mis Actividades Asignadas</h1>

      {isActivitiesLoading ? (
        <Loader />
      ) : activitiesError ? (
        <Message variant="danger">Error al cargar actividades: {activitiesError.message}</Message>
      ) : (
        <>
          <h3>Actividades Asignadas</h3>
          {uniqueActivities && uniqueActivities.length > 0 ? (
            <Row className="activity-levels">
              {uniqueActivities.map((activity) => {
                console.log('Activity ID:', activity._id); // Añade este log
                return (
                  <Col key={activity._id} xs={12} md={6} lg={4} className="mb-4">
                    {/* Verificar que activeTreatment está definido antes de construir el Link */}
                    {activeTreatment ? (
                      <Link to={`/treatments/${activeTreatment._id}/activities/play/${activity._id}`} style={{ textDecoration: 'none' }}>
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
                    ) : (
                      <Message variant="warning">No se encontró un tratamiento activo para esta actividad.</Message>
                    )}
                  </Col>
                );
              })}
            </Row>
          ) : (
            <p>No tienes actividades asignadas.</p>
          )}
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default UserActivity;
