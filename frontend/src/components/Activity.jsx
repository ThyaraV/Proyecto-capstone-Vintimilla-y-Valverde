// src/components/Activity.jsx

import { Card } from 'react-bootstrap';
import backgroundImg from '../images/background.png'; // Ruta a la imagen de fondo

const Activity = ({ activity }) => {
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
        <Card.Title as="h5" className="activity-title">
          <strong>{activity.name}</strong>
        </Card.Title>

        {/* Descripción de la actividad */}
        <Card.Text className="activity-description text-muted">
          {activity.description}
        </Card.Text>

        {/* Botón para jugar */}
        <div className="activity-card__wrapper">
          <button className="activity-card__btn activity-card__btn-solid">Jugar</button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Activity;
