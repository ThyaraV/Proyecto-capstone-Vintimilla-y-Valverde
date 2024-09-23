import { Row, Col } from 'react-bootstrap';
import Activity from '../components/Activity.jsx'; // Cambiado para actividades
import Loader from '../components/Loader.jsx';
import { useGetActivitiesQuery } from '../slices/activitiesSlice.js'; // Cambiado para obtener actividades

const ActivitiesScreen = () => {
  const { data: activities, isLoading } = useGetActivitiesQuery(); // Cambiado para actividades

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h1>Actividades Recientes</h1> {/* Título ajustado */}
          <Row>
            {activities.slice(0, 10).map((activity) => (  // Se limita a los primeros 10 registros
              <Col key={activity._id} sm={12} md={6} lg={4} xl={3}>
                <Activity activity={activity} /> {/* Cambiado a Activity */}
              </Col>
            ))}
          </Row>
        </>
      )}
    </>
  );
};

export default ActivitiesScreen;
