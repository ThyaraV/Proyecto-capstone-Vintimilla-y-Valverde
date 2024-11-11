import asyncHandler from 'express-async-handler';
import Assignment from '../models/treatmentModel.js';
import Patient from '../models/patientModel.js';
import Activity from '../models/activityModel.js';
import { io } from 'socket.io-client';


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

  // Emite un evento al asignar/desasignar actividad
  // Después de crear la asignación
  io.emit(`activitiesUpdated:${patientId}`, { message: 'Actividad asignada' });
  console.log(`Evento activitiesUpdated emitido para el paciente ${patientId}`);
    
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
// @access  Privado/Doctor
const getAssignedActivities = asyncHandler(async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verificar si el paciente existe
    const patient = await Patient.findById(patientId);

    if (!patient) {
      res.status(404);
      throw new Error('Paciente no encontrado');
    }

    // Buscar las asignaciones del paciente
    const assignments = await Assignment.find({ patient: patientId })
      .populate('activity')
      .populate('doctor', 'name email');

    // Mapear las actividades asignadas
    const activities = assignments.map((assignment) => ({
      assignmentId: assignment._id,
      activity: assignment.activity,
      doctor: assignment.doctor,
      scoreObtained: assignment.scoreObtained,
      timeUsed: assignment.timeUsed,
      progress: assignment.progress,
      observations: assignment.observations,
      completionDate: assignment.completionDate,
    }));

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las actividades asignadas' });
  }
});


const unassignActivityFromPatient = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  console.log('Solicitud para desasignar actividad. Assignment ID:', assignmentId);

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    console.log('Asignación no encontrada para el ID proporcionado');
    res.status(404);
    throw new Error('Asignación no encontrada');
  }

  await assignment.deleteOne();
  console.log('Asignación eliminada exitosamente');
  // Después de eliminar la asignación
  io.emit(`activitiesUpdated:${assignment.patient}`, { message: 'Actividad desasignada' });
  console.log(`Evento activitiesUpdated emitido para el paciente ${assignment.patient}`);
  
  res.status(200).json({ message: 'Actividad desasignada correctamente' });
});

// @desc    Obtener actividades asignadas al paciente autenticado
// @route   GET /api/assignments/myactivities
// @access  Privado/Paciente
const getMyAssignedActivities = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Buscar el paciente asociado al userId
    const patient = await Patient.findOne({ user: userId });

    if (!patient) {
      res.status(404);
      throw new Error('Paciente no encontrado para el usuario autenticado');
    }

    // Buscar las asignaciones del paciente
    const assignments = await Assignment.find({ patient: patient._id })
      .populate('activity')
      .populate('doctor', 'name email');

    // Mapear las actividades asignadas
    const activities = assignments.map((assignment) => ({
      assignmentId: assignment._id,
      activity: assignment.activity,
      doctor: assignment.doctor,
      scoreObtained: assignment.scoreObtained,
      timeUsed: assignment.timeUsed,
      progress: assignment.progress,
      observations: assignment.observations,
      completionDate: assignment.completionDate,
    }));

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las actividades asignadas' });
  }
});

export { assignActivityToPatient, updateAssignmentResults, 
  getAssignedActivities,unassignActivityFromPatient,getMyAssignedActivities};