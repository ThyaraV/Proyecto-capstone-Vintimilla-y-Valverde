import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useCreateTreatmentMutation } from '../../slices/treatmentSlice';
import { useGetDoctorWithPatientsQuery } from '../../slices/doctorApiSlice';
import { useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import ActivitySelector from '../../components/ActivitySelector';

const CreateTreatmentScreen = () => {
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

  // Obtener datos de pacientes
  const [localPatients, setLocalPatients] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const { data: patientsData, isLoading, error, refetch } = useGetDoctorWithPatientsQuery();
  const userInfo = useSelector((state) => state.auth.userInfo);

  useEffect(() => {
    setLocalPatients([]);
    setIsFetchingData(true);
    if (userInfo) {
      refetch();
    }
  }, [userInfo, refetch]);

  useEffect(() => {
    if (!isLoading && patientsData) {
      setLocalPatients(patientsData);
      setIsFetchingData(false);
    }
  }, [isLoading, patientsData]);

  // Obtener el hook de la mutación
  const [createTreatment, { isLoading: isCreating, error: createError }] = useCreateTreatmentMutation();

  // Manejar el envío del formulario
  const submitHandler = async (e) => {
    e.preventDefault();

    const treatmentData = {
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

    console.log('Datos enviados al crear tratamiento:', treatmentData);

    try {
      const response = await createTreatment(treatmentData).unwrap();

      if (response) {
        alert('Tratamiento creado exitosamente');
        // Limpiar el formulario
        setPatientIds([]);
        setTreatmentName('');
        setDescription('');
        setSelectedActivities([]);
        setMedications([]);
        setExerciseVideos([]);
        setStartDate('');
        setEndDate('');
        setObservations('');
        setNextReviewDate('');
      }
    } catch (err) {
      console.error('Error al crear el tratamiento:', err);
    }
  };

  // Funciones para manejar medicamentos
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

  // Funciones para manejar ejercicios en video
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
      <h1>Crear Tratamiento</h1>
      {(isCreating || isFetchingData) && <Loader />}
      {(createError || error) && (
        <Message variant="danger">
          {createError?.data?.message || createError?.error || error?.data?.message || error?.error}
        </Message>
      )}
      <Form onSubmit={submitHandler}>
        {/* Seleccionar pacientes */}
        <Form.Group controlId="patientIds" className="mb-3">
          <Form.Label>Seleccionar Pacientes</Form.Label>
          {isFetchingData ? (
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
              {localPatients?.map((patient) => (
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
            <div key={index} className="mb-3">
              <Form.Control
                type="text"
                placeholder="Nombre del medicamento"
                value={medication.name}
                onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                className="mb-2"
                required
              />
              <Form.Control
                type="text"
                placeholder="Dosis"
                value={medication.dosage}
                onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                className="mb-2"
                required
              />
              <Form.Control
                type="text"
                placeholder="Frecuencia"
                value={medication.frequency}
                onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                className="mb-2"
                required
              />
              <Form.Control
                type="date"
                placeholder="Fecha de inicio"
                value={medication.startDate}
                onChange={(e) => handleMedicationChange(index, 'startDate', e.target.value)}
                className="mb-2"
                required
              />
              <Form.Control
                type="date"
                placeholder="Fecha de fin"
                value={medication.endDate}
                onChange={(e) => handleMedicationChange(index, 'endDate', e.target.value)}
                className="mb-2"
              />
            </div>
          ))}
        </Form.Group>

        {/* Agregar ejercicios en video */}
        <Form.Group controlId="exerciseVideos" className="mb-3">
          <Form.Label>Ejercicios en Video</Form.Label>
          <Button variant="secondary" onClick={addExerciseVideo} className="mb-2">
            Agregar Video
          </Button>
          {exerciseVideos.map((video, index) => (
            <div key={index} className="mb-3">
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
            </div>
          ))}
        </Form.Group>

        {/* Fechas y observaciones */}
        <Form.Group controlId="startDate" className="mb-3">
          <Form.Label>Fecha de Inicio</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="endDate" className="mb-3">
          <Form.Label>Fecha de Fin</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Form.Group>

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

        <Button type="submit" variant="primary">
          Crear Tratamiento
        </Button>
      </Form>
    </>
  );
};

export default CreateTreatmentScreen;
