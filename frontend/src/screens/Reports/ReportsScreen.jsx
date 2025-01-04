// src/screens/Reports/ReportsScreen.jsx

import React from 'react';
import '../../assets/styles/ReportsScreen.css'; // Archivo de estilos
import { useNavigate } from 'react-router-dom';

const ReportsScreen = () => {
  const navigate = useNavigate();

  const reportOptions = [
    { title: 'Historial Médico', img: '/path/to/historial-medico.jpg', route: '/historial-medico' },
    { title: 'Resultados MOCA', img: '/path/to/medicacion-actual.jpg', route: '/results-moca' },
    { title: 'Resultado de Evaluaciones diagnósticas', img: '/path/to/resultado-evaluaciones.jpg', route: '/resultado-evaluaciones' },
    { title: 'Progreso del Paciente', img: '/path/to/progreso-paciente.jpg', route: '/progreso-paciente' },
    { title: 'Resultados de actividades', img: '/path/to/progreso-paciente.jpg', route: '/reports/activities' }, // Ruta fija
    { title: 'Resultados de estado de ánimo', img: '/path/to/progreso-paciente.jpg', route: '/estado-animo' },
  ];

  return (
    <div className="reports-screen">
      <h1>Seleccionar Reporte</h1>
      <div className="report-options">
        {reportOptions.map((option, index) => (
          <div
            key={index}
            className="report-card"
            onClick={() => navigate(option.route)}
          >
            <img src={option.img} alt={option.title} />
            <p>{option.title}</p>
          </div>
        ))}
      </div>
      <div className="filters-section">
        <h3>Filtros</h3>
        <label htmlFor="period">Periodo:</label>
        <input type="date" id="period" />
        <button onClick={() => console.log('Guardar Reporte')}>Guardar Reporte</button>
        <button onClick={() => console.log('Imprimir Reporte')}>Imprimir Reporte</button>
        <button onClick={() => console.log('Exportar Reporte')}>Exportar Reporte</button>
        <button onClick={() => console.log('Editar Reporte')}>Editar Reporte</button>
      </div>
    </div>
  );
};

export default ReportsScreen;
