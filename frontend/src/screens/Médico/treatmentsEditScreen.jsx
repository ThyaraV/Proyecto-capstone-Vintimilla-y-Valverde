import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import {
  useGetTreatmentByIdQuery,
  useUpdateTreatmentMutation,
} from '../../slices/treatmentSlice';
import { useGetDoctorWithPatientsQuery } from '../../slices/doctorApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import ActivitySelector from '../../components/ActivitySelector';
import { useParams, useNavigate } from 'react-router-dom';

const EditTreatmentScreen = () => {
  const { treatmentId } = useParams();
  const navigate = useNavigate();

  // Obtener detalles del tratamiento
  const {
    data: treatment,
    isLoading: loadingTreatment,
    error: errorTreatment,
  } = useGetTreatmentByIdQuery(treatmentId);

  // Obtener pacientes asignados al médico
  const {
    data: patientsData,
    isLoading: loadingPatients,
    error: errorPatients,
  } = useGetDoctorWithPatientsQuery();

  // Estados locales
  const [patientIds, setPatientIds] = useState([]);
  const [treatmentName, setTreatmentName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [medications, setMedications] = useState([]);
  const [exerciseVideos, setExerciseVideos] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [observations, setObservations] = useState('');
  const [nextReviewDate, setNextReviewDate] = useState('');

  const [updateTreatment, { isLoading: loadingUpdate, error: errorUpdate }] =
    useUpdateTreatmentMutation();

  useEffect(() => {
    if (treatment) {
      setPatientIds(treatment.patients.map((p) => p._id));
      setTreatmentName(treatment.treatmentName);
      setDescription(treatment.description);
      setSelectedActivities(treatment.activities.map((a) => a._id));
      setMedications(treatment.medications);
      setExerciseVideos(treatment.exerciseVideos);
      setStartDate(treatment.startDate ? treatment.startDate.substring(0, 10) : '');
      setEndDate(treatment.endDate ? treatment.endDate.substring(0, 10) : '');
      setObservations(treatment.observations);
      setNextReviewDate(
        treatment.nextReviewDate ? treatment.nextReviewDate.substring(0, 10) : ''
      );
    }
  }, [treatment]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const updatedData = {
      patientIds,
      treatmentName,
      description,
      activities: selectedActivities,
      medications,
      exerciseVideos,
      startDate,
      endDate,
      observations,
      nextReviewDate,
    };

    try {
      await updateTreatment({ treatmentId, updatedData }).unwrap();
      alert('Tratamiento actualizado exitosamente');
      setTimeout(() => {
        navigate('/admin/treatments/list');
      }, 2000); // Navegar de regreso a la lista de tratamientos
    } catch (err) {
      console.error('Error al actualizar el tratamiento:', err);
    }
  };

  // Funciones para manejar medicamentos y ejercicios en video (similares al CreateTreatmentScreen)

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', startDate: '', endDate: '', imageUrl: '' },
    ]);
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const addExerciseVideo = () => {
    setExerciseVideos([
      ...exerciseVideos,
      { title: '', description: '', url: '', duration: '' },
    ]);
  };

  const handleExerciseVideoChange = (index, field, value) => {
    const updatedVideos = [...exerciseVideos];
    updatedVideos[index][field] = value;
    setExerciseVideos(updatedVideos);
  };

  return (
    <>
      <h1 className="mb-4">Editar Tratamiento</h1>
      {(loadingTreatment || loadingPatients || loadingUpdate) && <Loader />}
      {(errorTreatment || errorPatients || errorUpdate) && (
        <Message variant="danger">
          {errorTreatment?.data?.message ||
            errorTreatment?.error ||
            errorPatients?.data?.message ||
            errorPatients?.error ||
            errorUpdate?.data?.message ||
            errorUpdate?.error}
        </Message>
      )}
      <Card className="p-4 shadow">
        <Form onSubmit={submitHandler}>
          {/* Seleccionar pacientes */}
          <Form.Group controlId="patientIds" className="mb-3">
            <Form.Label>Seleccionar Pacientes</Form.Label>
            {loadingPatients ? (
              <Loader />
            ) : (
              <Form.Control
                as="select"
                multiple
                value={patientIds}
                onChange={(e) =>
                  setPatientIds([...e.target.selectedOptions].map((option) => option.value))
                }
              >
                {patientsData?.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.user?.name || 'No disponible'} {patient.user?.lastName || ''}
                  </option>
                ))}
              </Form.Control>
            )}
          </Form.Group>

          {/* Nombre y descripción del tratamiento */}
          <Form.Group controlId="treatmentName" className="mb-3">
            <Form.Label>Nombre del Tratamiento</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese el nombre del tratamiento"
              value={treatmentName}
              onChange={(e) => setTreatmentName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese una descripción del tratamiento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>

          {/* Seleccionar actividades */}
          <Form.Group controlId="activities" className="mb-3">
            <Form.Label>Asignar Actividades</Form.Label>
            <ActivitySelector
              selectedActivities={selectedActivities}
              setSelectedActivities={setSelectedActivities}
            />
          </Form.Group>

          {/* Agregar medicamentos */}
          <Form.Group controlId="medications" className="mb-3">
            <Form.Label>Medicamentos</Form.Label>
            <Button variant="secondary" onClick={addMedication} className="mb-2">
              Agregar Medicamento
            </Button>
            {medications.map((medication, index) => (
              <Card key={index} className="mb-3 p-3">
                <Row>
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="Nombre del medicamento"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      className="mb-2"
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="Dosis"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      className="mb-2"
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="Frecuencia"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      className="mb-2"
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="date"
                      placeholder="Fecha de inicio"
                      value={medication.startDate}
                      onChange={(e) => handleMedicationChange(index, 'startDate', e.target.value)}
                      className="mb-2"
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="date"
                      placeholder="Fecha de fin"
                      value={medication.endDate}
                      onChange={(e) => handleMedicationChange(index, 'endDate', e.target.value)}
                      className="mb-2"
                    />
                  </Col>
                </Row>
              </Card>
            ))}
          </Form.Group>

          {/* Agregar ejercicios en video */}
          <Form.Group controlId="exerciseVideos" className="mb-3">
            <Form.Label>Ejercicios en Video</Form.Label>
            <Button variant="secondary" onClick={addExerciseVideo} className="mb-2">
              Agregar Video
            </Button>
            {exerciseVideos.map((video, index) => (
              <Card key={index} className="mb-3 p-3">
                <Form.Control
                  type="text"
                  placeholder="Título del video"
                  value={video.title}
                  onChange={(e) => handleExerciseVideoChange(index, 'title', e.target.value)}
                  className="mb-2"
                  required
                />
                <Form.Control
                  type="text"
                  placeholder="Descripción"
                  value={video.description}
                  onChange={(e) => handleExerciseVideoChange(index, 'description', e.target.value)}
                  className="mb-2"
                />
                <Form.Control
                  type="text"
                  placeholder="URL del video"
                  value={video.url}
                  onChange={(e) => handleExerciseVideoChange(index, 'url', e.target.value)}
                  className="mb-2"
                  required
                />
                <Form.Control
                  type="number"
                  placeholder="Duración en segundos"
                  value={video.duration}
                  onChange={(e) => handleExerciseVideoChange(index, 'duration', e.target.value)}
                  className="mb-2"
                />
              </Card>
            ))}
          </Form.Group>

          {/* Fechas y observaciones */}
          <Row>
            <Col md={6}>
              <Form.Group controlId="startDate" className="mb-3">
                <Form.Label>Fecha de Inicio</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="endDate" className="mb-3">
                <Form.Label>Fecha de Fin</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="observations" className="mb-3">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese observaciones adicionales"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="nextReviewDate" className="mb-3">
            <Form.Label>Próxima Fecha de Revisión</Form.Label>
            <Form.Control
              type="date"
              value={nextReviewDate}
              onChange={(e) => setNextReviewDate(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-3">
            Actualizar Tratamiento
          </Button>
        </Form>
      </Card>
    </>
  );
};

export default EditTreatmentScreen;
