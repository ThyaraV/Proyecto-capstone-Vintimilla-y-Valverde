// src/screens/MOCAmodules/MocaFinalScreen.jsx

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Table, Alert, Spinner } from "react-bootstrap";
import { useGetMocaSelfByIdQuery } from "../../slices/mocaSelfApiSlice"; // Asegúrate de que la ruta sea correcta

const MocaFinalScreen = () => {
  const { id } = useParams(); // ID del registro MoCA Self
  const navigate = useNavigate();
  
  // Hook para obtener los datos del registro MoCA Self por ID
  const { data: mocaRecord, isLoading, isError, error } = useGetMocaSelfByIdQuery(id);

  // Función para regresar a la lista de pacientes o al dashboard
  const handleBack = () => {
    navigate("/moca"); // Ajusta la ruta según tu aplicación
  };

  if (isLoading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          {error?.data?.error || "Hubo un error al obtener los resultados."}
        </Alert>
        <Button variant="secondary" onClick={handleBack}>
          Regresar
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Resultados Finales del MoCA Self</h2>
      
      <Row className="mb-4">
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Puntaje Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(mocaRecord.modulesData).map(([moduleName, data], index) => (
                <tr key={index}>
                  <td>{moduleName}</td>
                  <td>{data.total || 0}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Puntaje Total</strong></td>
                <td><strong>{mocaRecord.totalScore}</strong></td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h4>Detalles por Módulo</h4>
          {Object.entries(mocaRecord.modulesData).map(([moduleName, data], index) => (
            <div key={index} className="mb-4">
              <h5>{moduleName}</h5>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          ))}
        </Col>
      </Row>

      <Row>
        <Col className="d-flex justify-content-end">
          <Button variant="secondary" onClick={handleBack}>
            Regresar
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default MocaFinalScreen;
