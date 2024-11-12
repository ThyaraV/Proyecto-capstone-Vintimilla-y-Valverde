import React, { useState } from 'react';
import { useGetMyTreatmentsQuery } from '../../slices/treatmentSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { ListGroup, Card, Row, Col, Button } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../../assets/styles/TreatmentsListScreen.css'; // Opcional: para estilos personalizados

const TreatmentsListScreen = () => {
  // Hook para obtener los tratamientos del médico
  const { data: treatments, isLoading, error } = useGetMyTreatmentsQuery();

  // Estado para el tratamiento seleccionado
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  // Función para manejar la selección de un tratamiento
  const handleTreatmentSelect = (treatment) => {
    setSelectedTreatment(treatment);
  };

  return (
    <div className="treatments-list-container p-4">
      <h1 className="mb-4 text-center">Mis Tratamientos</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error || 'Error al cargar los tratamientos.'}
        </Message>
      ) : (
        <Row>
          {/* Lista de Tratamientos */}
          <Col md={4}>
            <ListGroup>
              {treatments.map((treatment) => (
                <ListGroup.Item
                  key={treatment._id}
                  action
                  active={selectedTreatment && selectedTreatment._id === treatment._id}
                  onClick={() => handleTreatmentSelect(treatment)}
                >
                  {treatment.treatmentName}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          {/* Detalles del Tratamiento Seleccionado */}
          <Col md={8}>
            {selectedTreatment ? (
              <Card className="shadow p-4">
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    {selectedTreatment.treatmentName}
                    {/* Botón para Editar el Tratamiento */}
                    <Button
                      as={Link}
                      to={`/admin/treatments/${selectedTreatment._id}/edit`}
                      variant="warning"
                      className="d-flex align-items-center"
                    >
                      <FaEdit className="me-2" />
                      Editar
                    </Button>
                  </Card.Title>
                  <Card.Text>
                    <strong>Descripción:</strong> {selectedTreatment.description}
                  </Card.Text>
                  <Card.Text>
                    <strong>Pacientes:</strong>{' '}
                    {selectedTreatment.patients
                      .map(
                        (patient) =>
                          `${patient.user?.name || 'No disponible'} ${
                            patient.user?.lastName || ''
                          }`
                      )
                      .join(', ')}
                  </Card.Text>
                  <Card.Text>
                    <strong>Actividades:</strong>{' '}
                    {selectedTreatment.activities
                      .map((activity) => activity.name)
                      .join(', ')}
                  </Card.Text>
                  <Card.Text>
                    <strong>Fecha de Inicio:</strong>{' '}
                    {selectedTreatment.startDate
                      ? new Date(selectedTreatment.startDate).toLocaleDateString()
                      : 'No definida'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Fecha de Fin:</strong>{' '}
                    {selectedTreatment.endDate
                      ? new Date(selectedTreatment.endDate).toLocaleDateString()
                      : 'No definida'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Observaciones:</strong> {selectedTreatment.observations || 'N/A'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Próxima Revisión:</strong>{' '}
                    {selectedTreatment.nextReviewDate
                      ? new Date(selectedTreatment.nextReviewDate).toLocaleDateString()
                      : 'No definida'}
                  </Card.Text>
                  {/* Puedes agregar más detalles según tus necesidades */}
                </Card.Body>
              </Card>
            ) : (
              <div className="text-center">
                <p>Seleccione un tratamiento para ver los detalles.</p>
              </div>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default TreatmentsListScreen;
