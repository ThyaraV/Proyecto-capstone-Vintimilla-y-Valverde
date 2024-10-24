import { Row, Col } from 'react-bootstrap';
import Activity2 from '../components/Activity2.jsx'; // Componente de actividad
import Loader from '../components/Loader.jsx';
import { useGetActivitiesQuery } from '../slices/activitiesSlice.js'; // Para obtener actividades

const ActivitiesL2Screen = () => {
  const { data: activities, isLoading } = useGetActivitiesQuery(); // Consultar actividades

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h1>Actividades</h1>
          <Row className="justify-content-center">
            {activities.slice(10, 20).map((activity) => ( // Cambiamos el slice
              <Col key={activity._id} sm={12} md={6} lg={4} xl={3} className="mb-4 d-flex justify-content-center">
                <Activity2 activity={activity} /> {/* Renderiza cada actividad */}
              </Col>
            ))}
          </Row>
        </>
      )}
    </>
  );
};

export default ActivitiesL2Screen;
