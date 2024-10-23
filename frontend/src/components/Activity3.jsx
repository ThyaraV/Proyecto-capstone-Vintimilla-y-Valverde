import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import backgroundImg from '../images/background3.png'; // Ruta a la imagen de fondo

const Activity = ({ activity }) => {
  // Determina la ruta basada en el tipo de actividad o un identificador único
  const getActivityLink = (activity) => {
    switch (activity.name) {
      case 'Búsqueda de letra':
        return '/activity/level3/1';
      case 'Asociación de fotos':
        return '/activity/level3/2';
      case 'Sumas y Restas':
        return '/activity/level3/3';
      case 'Encuentra diferencias':
        return '/activity/level3/4';
      case 'Forma las frases correctas':
        return '/activity/level3/5';
      case 'Clasificación de palabras':
        return '/activity/level3/6';
      case 'Memoria a corto plazo':
        return '/activity/level3/7';
      case 'Responde preguntas':
        return '/activity/level3/8';
      case 'Sigue instrucciones':
        return '/activity/level3/9';
      case 'Identificación de objetos y sus usos':
        return '/activity/level3/10';
      default:
        return `/activity/level3/${activity._id}`;
    }
  };

  return (
    <Card className="activity-card my-3 p-3 rounded">
      {/* Imagen de fondo */}
      <div className="activity-card__bg">
        <img src={backgroundImg} alt="Activity Background" className="activity-background-image" />
      </div>
      
      {/* Imagen circular que muestra la actividad */}
      <div className="activity-card__avatar">
        <img src={activity.image} alt={activity.name} className="activity-avatar" />
      </div>
      
      <Card.Body className="text-center">
        {/* Título de la actividad */}
        <Link to={getActivityLink(activity)}>
          <Card.Title as="h5" className="activity-title">
            <strong>{activity.name}</strong>
          </Card.Title>
        </Link>

        {/* Descripción de la actividad */}
        <Card.Text className="activity-description text-muted">
          {activity.description}
        </Card.Text>

        {/* Botón para jugar */}
        <div className="activity-card__wrapper">
          <Link to={getActivityLink(activity)}>
            <button className="activity-card__btn activity-card__btn-solid">Jugar</button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Activity;