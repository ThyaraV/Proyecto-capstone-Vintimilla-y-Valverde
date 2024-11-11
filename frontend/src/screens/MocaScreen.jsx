import React, { useState, useEffect } from 'react';
import { Button, Container, ListGroup, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetPatientsQuery } from '../slices/patientApiSlice';

const MocaScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: patients = [], isLoading, error } = useGetPatientsQuery(); // Usamos useGetPatientsQuery directamente
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (!userInfo?.isAdmin) {
      navigate('/'); // Redirigir si no es admin
    }
  }, [userInfo, navigate]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  return (
    <Container>
      <h1>Evaluación Cognitiva Montreal (MoCA)</h1>
      <Row className="my-3">
        <Col md={4}>
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
                >
                  {patient.user?.name || "Paciente sin nombre"}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={8}>
          <h4>Opciones MoCA</h4>
          <Button
            variant="primary"
            onClick={() => navigate(`/moca/register/${selectedPatient?._id}`)}
            disabled={!selectedPatient}
            className="me-2"
          >
            Registrar Resultados
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/moca/history/${selectedPatient?._id}`)}
            disabled={!selectedPatient}
            className="me-2"
          >
            Consultar Histórico
          </Button>
          <Button
            variant="success"
            onClick={() => navigate(`/moca/start/${selectedPatient?._id}`)}
            disabled={!selectedPatient}
          >
            Iniciar Prueba MoCA
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default MocaScreen;
