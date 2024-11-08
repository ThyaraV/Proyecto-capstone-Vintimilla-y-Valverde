import React, { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useGetAssignedActivitiesQuery } from '../slices/treatmentSlice.js';
import Loader from '../components/Loader';
import Activity from '../components/Activity';
import Activity2 from '../components/Activity2';
import Activity3 from '../components/Activity3';
import '../assets/styles/ActivitiesScreen.css';

const UserActivity = () => {
  const { data: activities, isLoading } = useGetAssignedActivitiesQuery();
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Log para verificar los datos obtenidos
  useEffect(() => {
    if (activities) {
      console.log("Actividades asignadas:", activities);
    }
  }, [activities]);

  return (
    <div className="user-activity-container">
      <h1 className="text-center mb-5">Mis Actividades Asignadas</h1>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {activities && activities.length > 0 ? (
            <Row className="activity-levels">
              {activities.map(({ activity }) => (
                <Col key={activity._id} xs={12} md={6} lg={4} className="mb-4">
                  {activity.difficultyLevel === 1 && (
                    <Activity 
                      activity={{
                        name: activity.name,
                        description: activity.description,
                        image: activity.image,
                        type: activity.type
                      }}
                    />
                  )}
                  {activity.difficultyLevel === 2 && (
                    <Activity2 
                      activity={{
                        name: activity.name,
                        description: activity.description,
                        image: activity.image,
                        type: activity.type
                      }}
                    />
                  )}
                  {activity.difficultyLevel === 3 && (
                    <Activity3 
                      activity={{
                        name: activity.name,
                        description: activity.description,
                        image: activity.image,
                        type: activity.type
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
