import React from 'react';
import '../assets/styles/HomeScreenPaciente.css'; // Asegúrate de importar tu CSS
import { useNavigate } from 'react-router-dom';

const HomeScreenPaciente = () => {
  const navigate = useNavigate();

  // Función para manejar el clic en el ícono de mensajes
  const handleChatClick = () => {
    navigate('/chat');
  };

  return (
    <div className="home-screen-container">
      <div>HomeScreenPaciente</div>
      
      {/* Icono de mensajes */}
      <ul className="message-icon-container">
        <li style={{ "--i": "#56CCF2", "--j": "#2F80ED" }} onClick={handleChatClick}>
          <span className="icon">💬</span>
          <span className="title">Messages</span>
        </li>
      </ul>
    </div>
  );
};

export default HomeScreenPaciente;
