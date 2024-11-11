import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Configuration.css';
import Image1a from '../../images/tratamientos.png';
import Image2a from '../../images/actividades.png';
import Image3a from '../../images/infopaciente.png';

const Configuration = () => {
  const navigate = useNavigate();

  const navigateToTab = (tab) => {
    if (tab === 'tratamientos') {
      navigate('/admin/treatments');
    } else if (tab === 'actividades') {
      navigate('/admin/UsersActivities');
    } else if (tab === 'informacion_paciente') {
      navigate('/informacion_paciente');
    }
  };

  return (
    <div className="config-card-wrapper">
      <div className="config-card-container">
        <div className="config-card" onClick={() => navigateToTab('tratamientos')}>
          <span className="config-card-overlay"></span>
          <div className="config-card-content">
            <img src={Image1a} alt="Tratamientos" className="config-card-image" />
            <div>Tratamientos</div>
          </div>
        </div>

        <div className="config-card" onClick={() => navigateToTab('actividades')}>
          <span className="config-card-overlay"></span>
          <div className="config-card-content">
            <img src={Image2a} alt="Actividades" className="config-card-image" />
            <div>Actividades</div>
          </div>
        </div>

        <div className="config-card" onClick={() => navigateToTab('informacion_paciente')}>
          <span className="config-card-overlay"></span>
          <div className="config-card-content">
            <img src={Image3a} alt="Información del Paciente" className="config-card-image" />
            <div>Información del Paciente</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
