import { Row, Col } from 'react-bootstrap';
import Activity from '../components/Activity.jsx'; // Componente de actividad
import Loader from '../components/Loader.jsx';
import { useGetActivitiesQuery } from '../slices/activitiesSlice.js'; // Para obtener actividades

const ActivitiesScreen = () => {
  const { data: activities, isLoading } = useGetActivitiesQuery(); // Consultar actividades

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h1>Actividades</h1>
          <Row className="justify-content-center">
            {activities.slice(0, 10).map((activity) => (
              <Col key={activity._id} sm={12} md={6} lg={4} xl={3} className="mb-4 d-flex justify-content-center">
                <Activity activity={activity} /> {/* Renderiza cada actividad */}
              </Col>
            ))}
          </Row>
        </>
      )}
    </>
  );
};

export default ActivitiesScreen;
