import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetTreatmentsByPatientQuery } from '../../slices/treatmentSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { ListGroup, Card, Row, Col, Button } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';
import '../../assets/styles/TreatmentsListScreen.css'; // Opcional: para estilos personalizados

const TreatmentsListScreen = () => {
  // Obtener patientId de los parámetros de la ruta
  const { patientId } = useParams();

  // Usar la nueva consulta para obtener tratamientos por paciente
  const { data: treatments, isLoading, error } = useGetTreatmentsByPatientQuery(patientId);

  // Estado para el tratamiento seleccionado
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  // Función para manejar la selección de un tratamiento
  const handleTreatmentSelect = (treatment) => {
    setSelectedTreatment(treatment);
    console.log('Tratamiento seleccionado:', treatment); 
  };

  return (
    <div className="treatments-list-container p-4">
      <h1 className="mb-4 text-center">Tratamientos del Paciente</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error || 'Error al cargar los tratamientos.'}
        </Message>
      ) : treatments && treatments.length > 0 ? (
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
                      state={{ patientId }} // Pasar el patientId mediante el estado de navegación
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
      ) : (
        <p className="no-treatments-message">Este paciente no tiene tratamientos asignados.</p>
      )}
    </div>
  );
};

export default TreatmentsListScreen;
