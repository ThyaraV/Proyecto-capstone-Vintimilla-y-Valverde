import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Activity = ({ activity }) => {
  // Determina la ruta basada en el tipo de actividad o un identificador único
  const getActivityLink = (activity) => {
    switch (activity.name) {
      case 'Búsqueda de letra':
        return '/activity/1';
      case 'Asociación de fotos':
        return '/activity/2';
      case 'Sumas y Restas':
        return '/activity/3';
      case 'Encuentra diferencias':
        return '/activity/4';
      case 'Forma las frases correctas':
        return '/activity/5';
      case 'Clasificación de palabras':
          return '/activity/6';
      case 'Memoria a corto plazo':
          return '/activity/7';
      case 'Responde preguntas':
          return '/activity/8';
      case 'Sigue instrucciones':
          return '/activity/9';
      case 'Identificación de objetos y sus usos':
          return '/activity/10';
      default:
        return `/activity/${activity._id}`;
    }
  };

  return (
    <Card className="my-3 p-3 rounded">
      <Link to={getActivityLink(activity)}>
        <Card.Img src={activity.image} variant="top" alt={activity.name} />
      </Link>
      <Card.Body>
        <Link to={getActivityLink(activity)}>
          <Card.Title as="div" className='activity-title'>
            <strong>{activity.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="div">
          <div>Nivel de dificultad: {activity.difficultyLevel}</div>
        </Card.Text>

        <Card.Text as="div">
          {activity.description}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Activity;