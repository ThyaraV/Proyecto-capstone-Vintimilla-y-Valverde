import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useGetMyAssignedActivitiesQuery } from '../slices/treatmentSlice.js';
import Loader from '../components/Loader';
import Activity from '../components/Activity';
import Activity2 from '../components/Activity2';
import Activity3 from '../components/Activity3';
import '../assets/styles/ActivitiesScreen.css';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

const UserActivity = () => {
  // Obtener la información del usuario autenticado desde el estado de Redux
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Obtener las actividades asignadas al usuario actual
  const {
    data: activities,
    isLoading,
    refetch,
  } = useGetMyAssignedActivitiesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [uniqueActivities, setUniqueActivities] = useState([]);

  // Filtrar y eliminar duplicados al cargar las actividades
  useEffect(() => {
    if (activities) {
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
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Conectado al servidor de Socket.io con ID:', socket.id);
    });

    socket.on(`activitiesUpdated:${userInfo._id}`, (data) => {
      console.log(`Evento activitiesUpdated recibido para el usuario ${userInfo._id}`, data);
      refetch(); // Vuelve a cargar las actividades asignadas en tiempo real
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor de Socket.io');
    });

    // Limpiar el socket al desmontar el componente o cuando userInfo cambie
    return () => {
      socket.disconnect();
      console.log('Socket desconectado en cleanup');
    };
  }, [userInfo, refetch]);

  return (
    <div className="user-activity-container">
      <h1 className="text-center mb-5">Mis Actividades Asignadas</h1>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {uniqueActivities && uniqueActivities.length > 0 ? (
            <Row className="activity-levels">
              {uniqueActivities.map((activity) => (
                <Col key={activity._id} xs={12} md={6} lg={4} className="mb-4">
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
                </Col>
              ))}
            </Row>
          ) : (
            <p>No tienes actividades asignadas.</p>
          )}
        </>
      )}
    </div>
  );
};

export default UserActivity;
