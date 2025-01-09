// src/screens/Reports/MocaScreen.jsx

import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Row, Col, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetPatientsQuery } from '../slices/patientApiSlice';
import '../assets/styles/MocaScreenPanel.css';
import Image1a from '../images/infopaciente.png';
import Image2a from '../images/infopaciente.png';
import Image3a from '../images/infopaciente.png';
import Image4a from '../images/infopaciente.png'; // Nueva imagen para la prueba sin médico

const MocaScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: patients = [], isLoading, error } = useGetPatientsQuery();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredPatients = patients.filter(patient =>
    patient.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="reports-screen-container">
      <h1 className="moca-title">Evaluación Cognitiva Montreal (MoCA)</h1>
      <Row className="moca-row">
        {/* Columna izquierda: Lista de Pacientes */}
        <Col md={4} className="moca-patient-list">
          <h4>Lista de Pacientes</h4>
          <Form className="search-bar">
            <Form.Control
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form>
          {isLoading ? (
            <p>Cargando pacientes...</p>
          ) : error ? (
            <p>Error al cargar pacientes</p>
          ) : (
            <ListGroup>
              {filteredPatients.map((patient) => (
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
          {/* Opción para Registrar Resultados */}
          <div
            className="report-card"
            onClick={() => selectedPatient && handleOptionChange('registrar')}
            style={{ pointerEvents: selectedPatient ? 'auto' : 'none', opacity: selectedPatient ? 1 : 0.6 }}
          >
            <div className="report-card-image">
              <img src={Image1a} alt="Registrar" />
            </div>
            <div className="report-card-title">
              <p>Registrar Resultados</p>
            </div>
          </div>

          {/* Opción para Consultar Histórico */}
          <div
            className="report-card"
            onClick={() => selectedPatient && handleOptionChange('historico')}
            style={{ pointerEvents: selectedPatient ? 'auto' : 'none', opacity: selectedPatient ? 1 : 0.6 }}
          >
            <div className="report-card-image">
              <img src={Image2a} alt="Histórico" />
            </div>
            <div className="report-card-title">
              <p>Consultar Histórico</p>
            </div>
          </div>

          {/* Opción para Iniciar Prueba MoCA con Médico */}
          <div
            className="report-card"
            onClick={() => selectedPatient && handleOptionChange('iniciar')}
            style={{ pointerEvents: selectedPatient ? 'auto' : 'none', opacity: selectedPatient ? 1 : 0.6 }}
          >
            <div className="report-card-image">
              <img src={Image3a} alt="Iniciar" />
            </div>
            <div className="report-card-title">
              <p>Iniciar Prueba MoCA (Médico)</p>
            </div>
          </div>

          {/* Nueva Opción para Iniciar Prueba MoCA sin Médico */}
          <div
            className="report-card"
            onClick={() => selectedPatient && handleOptionChange('iniciarPaciente')}
            style={{ pointerEvents: selectedPatient ? 'auto' : 'none', opacity: selectedPatient ? 1 : 0.6 }}
          >
            <div className="report-card-image">
              <img src={Image4a} alt="Paciente" />
            </div>
            <div className="report-card-title">
              <p>Iniciar Prueba MoCA (Paciente)</p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MocaScreen;
