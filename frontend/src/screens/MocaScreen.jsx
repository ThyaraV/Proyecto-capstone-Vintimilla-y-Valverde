import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetPatientsQuery } from '../slices/patientApiSlice';
import '../assets/styles/MocaStart.css';
import Image1a from '../images/infopaciente.png';
import Image2a from '../images/infopaciente.png';
import Image3a from '../images/infopaciente.png';
import Image4a from '../images/infopaciente.png'; // Nueva imagen para la prueba sin médico

const MocaScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: patients = [], isLoading, error } = useGetPatientsQuery();
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (!userInfo?.isAdmin) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleOptionChange = (option) => {
    if (option === 'registrar') {
      navigate(`/moca/register/${selectedPatient?._id}`);
    } else if (option === 'historico') {
      navigate(`/moca/history/${selectedPatient?._id}`);
    } else if (option === 'iniciar') {
      navigate(`/moca/start/${selectedPatient?._id}`);
    } else if (option === 'iniciarPaciente') {
      navigate(`/moca/patient/${selectedPatient?._id}`); // Nueva ruta para la prueba sin médico
    }
  };

  return (
    <Container className="moca-card-wrapper">
      <h1 className="moca-title">Evaluación Cognitiva Montreal (MoCA)</h1>
      <Row className="moca-row">
        {/* Columna izquierda: Lista de Pacientes */}
        <Col md={4} className="moca-patient-list">
          <h4>Lista de Pacientes</h4>
          {isLoading ? (
            <p>Cargando pacientes...</p>
          ) : error ? (
            <p>Error al cargar pacientes</p>
          ) : (
            <ListGroup>
              {patients.map((patient) => (
                <ListGroup.Item
                  key={patient._id}
                  active={selectedPatient?._id === patient._id}
                  onClick={() => handleSelectPatient(patient)}
                  className="patient-item"
                >
                  {patient.user?.name || 'Paciente sin nombre'}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        {/* Columna derecha: Botones de Opciones */}
        <Col md={8} className="moca-options-container">
          <div className="button-container">
            {/* Opción para Registrar Resultados */}
            <div className="config-card" onClick={() => handleOptionChange('registrar')}>
              <span className="config-card-overlay"></span>
              <div className="config-card-content">
                <img src={Image1a} alt="Registrar" className="config-card-image" />
                <div>Registrar Resultados</div>
              </div>
            </div>

            {/* Opción para Consultar Histórico */}
            <div className="config-card" onClick={() => handleOptionChange('historico')}>
              <span className="config-card-overlay"></span>
              <div className="config-card-content">
                <img src={Image2a} alt="Histórico" className="config-card-image" />
                <div>Consultar Histórico</div>
              </div>
            </div>

            {/* Opción para Iniciar Prueba MoCA con Médico */}
            <div className="config-card" onClick={() => handleOptionChange('iniciar')}>
              <span className="config-card-overlay"></span>
              <div className="config-card-content">
                <img src={Image3a} alt="Iniciar" className="config-card-image" />
                <div>Iniciar Prueba MoCA (Médico)</div>
              </div>
            </div>

            {/* Nueva Opción para Iniciar Prueba MoCA sin Médico */}
            <div className="config-card" onClick={() => handleOptionChange('iniciarPaciente')}>
              <span className="config-card-overlay"></span>
              <div className="config-card-content">
                <img src={Image4a} alt="Paciente" className="config-card-image" />
                <div>Iniciar Prueba MoCA (Paciente)</div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MocaScreen;
