import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Activity = ({ activity }) => {
  return (
    <Card className="my-3 p-3 rounded">
      <Link to={`/activity/${activity._id}`}>
        <Card.Img src={activity.image} variant="top" alt={activity.name} />
      </Link>
      <Card.Body>
        <Link to={`/activity/${activity._id}`}>
          <Card.Title as="div" className='activity-title'>
            <strong>{activity.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="div">
          {/* Si deseas mostrar el nivel de dificultad de la actividad, lo puedes hacer aquí */}
          <div>Nivel de dificultad: {activity.difficultyLevel}</div>
        </Card.Text>

        <Card.Text as="div">
          {/* Si tienes otro campo como descripción o detalles adicionales */}
          {activity.description}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Activity;
