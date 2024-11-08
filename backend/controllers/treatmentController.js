import asyncHandler from 'express-async-handler';
import Assignment from '../models/treatmentModel.js';
import Patient from '../models/patientModel.js';
import Activity from '../models/activityModel.js';

// @desc    Asignar una actividad a un paciente
// @route   POST /api/assignments
// @access  Privado/Doctor
// @desc    Asignar una actividad a un paciente
// @route   POST /api/assignments
// @access  Privado/Doctor
const assignActivityToPatient = asyncHandler(async (req, res) => {
  const { patientId, doctorId, activityId } = req.body;

  // Agregar logs para verificar que los datos están siendo recibidos
  console.log("Datos recibidos en la solicitud POST:");
  console.log("Patient ID:", patientId);
  console.log("Doctor ID:", doctorId);
  console.log("Activity ID:", activityId);

  // Verificar que el paciente, el doctor y la actividad existen
  const patient = await Patient.findById(patientId);
  const activity = await Activity.findById(activityId);

  if (!patient) {
    console.log("Paciente no encontrado");
    res.status(404);
    throw new Error('Paciente no encontrado');
  }

  if (!activity) {
    console.log("Actividad no encontrada");
    res.status(404);
    throw new Error('Actividad no encontrada');
  }

  // Crear la asignación de actividad para el paciente
  const assignment = await Assignment.create({
    patient: patientId,
    doctor: doctorId,
    activity: activityId,
  });

  console.log("Asignación creada:", assignment);

  res.status(201).json({
    message: 'Actividad asignada correctamente al paciente',
    assignment,
  });
});
// @desc    Actualizar resultados de una actividad asignada
// @route   PUT /api/assignments/:assignmentId/results
// @access  Privado/Doctor o Paciente
const updateAssignmentResults = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { scoreObtained, timeUsed, progress, observations } = req.body;

  // Buscar la asignación
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    res.status(404);
    throw new Error('Asignación no encontrada');
  }

  // Actualizar resultados de la asignación
  assignment.scoreObtained = scoreObtained;
  assignment.timeUsed = timeUsed;
  assignment.progress = progress;
  assignment.observations = observations;
  assignment.completionDate = Date.now();

  await assignment.save();

  res.status(200).json({
    message: 'Resultados de la actividad actualizados',
    assignment,
  });
});

// @desc    Obtener actividades asignadas a un paciente
// @route   GET /api/assignments/:patientId/activities
// @access  Privado/Paciente
const getAssignedActivities = asyncHandler(async (req, res) => {
  try {
    // Obtener el userId del usuario autenticado
    const userId = req.user._id;

    console.log("User ID autenticado:", userId);

    // Buscar el paciente asociado al userId
    const patient = await Patient.findOne({ user: userId });

    if (!patient) {
      console.log("Paciente no encontrado para el User ID proporcionado");
      res.status(404);
      throw new Error('Paciente no encontrado para el usuario proporcionado');
    }

    console.log("Patient ID encontrado:", patient._id);

    // Buscar las asignaciones del paciente
    const assignments = await Assignment.find({ patient: patient._id })
      .populate('activity')
      .populate('doctor', 'name email'); // Opcional: poblar información del doctor

    console.log(`Número de asignaciones encontradas: ${assignments.length}`);

    // Mapear las actividades asignadas
    const activities = assignments.map((assignment) => ({
      assignmentId: assignment._id,
      activity: assignment.activity,
      doctor: assignment.doctor, // Opcional: detalles del doctor
      scoreObtained: assignment.scoreObtained,
      timeUsed: assignment.timeUsed,
      progress: assignment.progress,
      observations: assignment.observations,
      completionDate: assignment.completionDate,
    }));

    console.log("Actividades asignadas:", activities);

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error en getAssignedActivities:", error);
    res.status(500).json({ message: 'Error al obtener las actividades asignadas' });
  }
});

const deleteAssignedActivity = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  // Verificar si la asignación existe
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    res.status(404);
    throw new Error('Asignación no encontrada');
  }

  // Eliminar la asignación
  await assignment.remove();

  res.status(200).json({ message: 'Asignación eliminada correctamente' });
});

export { assignActivityToPatient, updateAssignmentResults, getAssignedActivities,deleteAssignedActivity};
