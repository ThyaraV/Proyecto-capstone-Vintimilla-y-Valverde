import asyncHandler from 'express-async-handler';
import Assignment from '../models/treatmentModel.js';
import Patient from '../models/patientModel.js';
import Activity from '../models/activityModel.js';

// @desc    Asignar una actividad a un paciente
// @route   POST /api/assignments
// @access  Privado/Doctor
const assignActivityToPatient = asyncHandler(async (req, res) => {
  const { patientId, doctorId, activityId } = req.body;

  // Registrar los IDs que se están utilizando para la asignación
  console.log('Patient ID:', patientId);
  console.log('Doctor ID:', doctorId);
  console.log('Activity ID:', activityId);

  // Verificar que el paciente, el doctor y la actividad existen
  const patient = await Patient.findById(patientId);
  const activity = await Activity.findById(activityId);

  if (!patient) {
    res.status(404);
    throw new Error('Paciente no encontrado');
  }

  if (!activity) {
    res.status(404);
    throw new Error('Actividad no encontrada');
  }

  // Crear la asignación de actividad para el paciente
  const assignment = await Assignment.create({
    patient: patientId,
    doctor: doctorId,
    activity: activityId,
  });

  res.status(201).json({
    message: 'Actividad asignada correctamente al paciente',
    assignment,
  });
});

export { assignActivityToPatient };
