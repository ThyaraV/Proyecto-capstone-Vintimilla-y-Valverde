import { Row, Col } from 'react-bootstrap';
import Activity from '../components/Activity.jsx';      // Componente de actividad nivel 1
import Activity2 from '../components/Activity2.jsx';    // Componente de actividad nivel 2
import Activity3 from '../components/Activity3.jsx';    // Componente de actividad nivel 3
import Loader from '../components/Loader.jsx';
import { useGetActivitiesQuery } from '../slices/activitiesSlice.js'; // Para obtener actividades
import '../assets/styles/ActivitiesScreen.css'; // Importa el CSS personalizado

const ActivitiesScreen = () => {
  const { data: activities, isLoading } = useGetActivitiesQuery(); // Consultar actividades

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h1>Actividades</h1>
          {activities.slice(0, 10).map((activity) => (
            <div key={activity._id} className="activity-container mb-5">
              <h2 className="activity-name mb-3">{activity.name}</h2>
              <Row className="activity-levels">
                <Col xs={12} md={4} className="mb-4 mb-md-0">
                  <Activity activity={activity} />
                </Col>
                <Col xs={12} md={4} className="mb-4 mb-md-0">
                  <Activity2 activity={activity} />
                </Col>
                <Col xs={12} md={4}>
                  <Activity3 activity={activity} />
                </Col>
              </Row>
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default ActivitiesScreen;
