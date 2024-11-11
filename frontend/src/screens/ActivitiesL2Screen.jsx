import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useGetMyAssignedActivitiesQuery } from '../slices/treatmentSlice.js';
import Loader from '../components/Loader';
import Activity from '../components/Activity';
import Activity2 from '../components/Activity2';
import Activity3 from '../components/Activity3';
import '../assets/styles/ActivitiesScreen.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const UserActivity = () => {
  const { data: activities, isLoading } = useGetMyAssignedActivitiesQuery();
  const [uniqueActivities, setUniqueActivities] = useState([]);

  // Filtrar y eliminar duplicados al cargar las actividades
  useEffect(() => {
    if (activities) {
      // Usar un mapa para eliminar duplicados basados en el ID de la actividad
      const filteredActivities = activities.reduce((acc, current) => {
        const existingActivity = acc.find(
          (item) => item.activity._id === current.activity._id
        );
        if (!existingActivity) {
          acc.push(current);
        }
        return acc;
      }, []);
      setUniqueActivities(filteredActivities);
    }
  }, [activities]);

  useEffect(() => {
    if (uniqueActivities.length > 0) {
      console.log('Actividades asignadas (sin duplicados):', uniqueActivities);
    }
  }, [uniqueActivities]);

  return (
    <div className="user-activity-container">
      <h1 className="text-center mb-5">Mis Actividades Asignadas</h1>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {uniqueActivities && uniqueActivities.length > 0 ? (
            <Row className="activity-levels">
              {uniqueActivities.map(({ activity }) => (
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
