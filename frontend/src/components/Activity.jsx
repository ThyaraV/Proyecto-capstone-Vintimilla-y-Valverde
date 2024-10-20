import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import backgroundImg from '../images/background.png'; // Ruta a la imagen de fondo

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
