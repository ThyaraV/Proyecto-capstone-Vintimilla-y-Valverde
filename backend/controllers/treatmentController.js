import asyncHandler from 'express-async-handler';
import Treatment from '../models/treatmentModel.js';
import Patient from '../models/patientModel.js';
import Activity from '../models/activityModel.js';
import Doctor from '../models/doctorModel.js';
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
// @route   GET /api/treatments/myactivities
// @access  Privado/Paciente
const getMyAssignedActivities = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Obtener el paciente asociado al usuario
  const patient = await Patient.findOne({ user: userId });
  if (!patient) {
    res.status(404);
    throw new Error('Paciente no encontrado');
  }

  // Buscar tratamientos donde el paciente está incluido
  const treatments = await Treatment.find({ patients: patient._id })
    .populate('activities');

  // Extraer las actividades de todos los tratamientos
  const activities = [];
  treatments.forEach(treatment => {
    activities.push(...treatment.activities);
  });

  // Eliminar actividades duplicadas si es necesario
  const uniqueActivities = activities.filter((activity, index, self) =>
    index === self.findIndex((a) => a._id.toString() === activity._id.toString())
  );

  res.status(200).json(uniqueActivities);
});

// @desc    Crear un nuevo tratamiento
// @route   POST /api/treatments/create
// @access  Privado/Doctor
const createTreatment = asyncHandler(async (req, res) => {
  const {
    patientIds,      // Array de IDs de pacientes
    treatmentName,
    description,
    activities,       // Array de IDs de actividades
    medications,      // Array de objetos de medicamentos
    exerciseVideos,   // Array de objetos de videos de ejercicio
    startDate,
    endDate,
    progress,
    adherence,
    observations,
    nextReviewDate,
  } = req.body;

  // Obtener el ID del doctor desde el token de autenticación
  const doctorId = req.user._id;

  // Verificar que el usuario autenticado es un doctor
  const doctor = await Doctor.findOne({ user: doctorId });
  if (!doctor) {
    res.status(401);
    throw new Error('Acceso no autorizado: No es un doctor');
  }

  // Verificar que los pacientes existen
  if (patientIds && patientIds.length > 0) {
    const patients = await Patient.find({ _id: { $in: patientIds } });
    if (patients.length !== patientIds.length) {
      res.status(404);
      throw new Error('Uno o más pacientes no fueron encontrados');
    }
  } else {
    res.status(400);
    throw new Error('Se requiere al menos un paciente');
  }

  // Crear el nuevo tratamiento
  const treatment = await Treatment.create({
    patients: patientIds,
    doctor: doctor._id,
    treatmentName,
    description,
    activities,
    medications,
    exerciseVideos,
    startDate,
    endDate,
    progress,
    adherence,
    observations,
    nextReviewDate,
  });

  // Asignar actividades a cada paciente seleccionado
  if (treatment && activities && activities.length > 0) {
    for (const patientId of patientIds) {
      const patient = await Patient.findById(patientId);

      if (patient) {
        // Agregar el tratamiento al paciente
        patient.treatments = patient.treatments || [];
        patient.treatments.push(treatment._id);

        // Asignar actividades al paciente (si tienes un modelo de asignaciones, puedes crearlas aquí)
        // Por ejemplo, si usas un modelo Assignment:
        // for (const activityId of activities) {
        //   await Assignment.create({
        //     patient: patientId,
        //     doctor: doctor._id,
        //     activity: activityId,
        //   });
        // }

        await patient.save();
      }
    }
  }

  if (treatment) {
    res.status(201).json({
      message: 'Tratamiento creado exitosamente',
      treatment,
    });
  } else {
    res.status(400);
    throw new Error('Datos inválidos del tratamiento');
  }
});

// @desc    Obtener tratamientos creados por el médico autenticado
// @route   GET /api/treatments/mytreatments
// @access  Privado/Doctor
const getMyTreatments = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;

  // Verificar que el usuario autenticado es un doctor
  const doctor = await Doctor.findOne({ user: doctorId });
  if (!doctor) {
    res.status(401);
    throw new Error('Acceso no autorizado: No es un doctor');
  }

  // Obtener tratamientos creados por el doctor
  const treatments = await Treatment.find({ doctor: doctor._id })
    .populate({
      path: 'patients',
      populate: { path: 'user', select: 'name lastName email' }, // Población anidada para usuarios
    })
    .populate('activities')
    .populate('doctor', 'user');

  res.status(200).json(treatments);
});

// @desc    Obtener detalles de un tratamiento específico
// @route   GET /api/treatments/:treatmentId
// @access  Privado/Doctor
const getTreatmentById = asyncHandler(async (req, res) => {
  const { treatmentId } = req.params;

  const treatment = await Treatment.findById(treatmentId)
    .populate({
      path: 'patients',
      populate: { path: 'user', select: 'name lastName email' },
    })
    .populate('activities')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name lastName email' },
    });

  if (!treatment) {
    res.status(404);
    throw new Error('Tratamiento no encontrado');
  }

  // Verificar que el tratamiento tiene un doctor asignado
  if (!treatment.doctor) {
    res.status(400).json({ message: 'Doctor no asignado al tratamiento' });
    return;
  }

  res.status(200).json(treatment);
});
// @desc    Actualizar un tratamiento existente
// @route   PUT /api/treatments/:treatmentId
// @access  Privado/Doctor
const updateTreatment = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;
  const { treatmentId } = req.params;

  // Verificar que el usuario es un doctor
  const doctor = await Doctor.findOne({ user: doctorId });
  if (!doctor) {
    res.status(401);
    throw new Error('Acceso no autorizado: No es un doctor');
  }

  // Buscar el tratamiento
  let treatment = await Treatment.findById(treatmentId);
  if (!treatment) {
    res.status(404);
    throw new Error('Tratamiento no encontrado');
  }

  // Verificar que el tratamiento pertenece al doctor
  if (treatment.doctor.toString() !== doctor._id.toString()) {
    res.status(401);
    throw new Error('No autorizado para modificar este tratamiento');
  }

  // Actualizar los campos del tratamiento con los datos recibidos
  const {
    patientIds,
    treatmentName,
    description,
    activities,
    medications,
    exerciseVideos,
    startDate,
    endDate,
    progress,
    adherence,
    observations,
    nextReviewDate,
  } = req.body;

  treatment.treatmentName = treatmentName || treatment.treatmentName;
  treatment.description = description || treatment.description;
  treatment.activities = activities || treatment.activities;
  treatment.medications = medications || treatment.medications;
  treatment.exerciseVideos = exerciseVideos || treatment.exerciseVideos;
  treatment.startDate = startDate || treatment.startDate;
  treatment.endDate = endDate || treatment.endDate;
  treatment.progress = progress || treatment.progress;
  treatment.adherence = adherence || treatment.adherence;
  treatment.observations = observations || treatment.observations;
  treatment.nextReviewDate = nextReviewDate || treatment.nextReviewDate;

  if (patientIds) {
    // Actualizar pacientes asignados al tratamiento
    const previousPatientIds = treatment.patients.map((id) => id.toString());
    const newPatientIds = patientIds;

    const patientsToRemove = previousPatientIds.filter(
      (id) => !newPatientIds.includes(id)
    );
    const patientsToAdd = newPatientIds.filter(
      (id) => !previousPatientIds.includes(id)
    );

    // Remover el tratamiento de los pacientes que ya no están asignados
    await Patient.updateMany(
      { _id: { $in: patientsToRemove } },
      { $pull: { treatments: treatment._id } }
    );

    // Agregar el tratamiento a los nuevos pacientes asignados
    await Patient.updateMany(
      { _id: { $in: patientsToAdd } },
      { $addToSet: { treatments: treatment._id } }
    );

    treatment.patients = patientIds;
  }

  await treatment.save();

  res.status(200).json({
    message: 'Tratamiento actualizado exitosamente',
    treatment,
  });
});

// @desc    Obtener los tratamientos asignados al paciente autenticado
// @route   GET /api/treatments/my-medications
// @access  Privado/Paciente
const getMyMedications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Obtener el paciente asociado al usuario autenticado
  const patient = await Patient.findOne({ user: userId });
  if (!patient) {
    res.status(404);
    throw new Error('Paciente no encontrado');
  }

  // Buscar tratamientos donde el paciente está incluido
  const treatments = await Treatment.find({ patients: patient._id })
    .populate('doctor', 'name email');

  // Extraer los medicamentos de todos los tratamientos
  const medications = [];
  treatments.forEach(treatment => {
    if (treatment.medications && treatment.medications.length > 0) {
      medications.push(...treatment.medications);
    }
  });

  res.status(200).json(medications);
});

// @desc    Obtener medicamentos que el paciente debe tomar hoy
// @route   GET /api/treatments/due-medications
// @access  Privado/Paciente
const getDueMedications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Obtener el paciente asociado al usuario autenticado
  const patient = await Patient.findOne({ user: userId });
  if (!patient) {
    res.status(404);
    throw new Error('Paciente no encontrado');
  }

  const today = new Date();
  const treatments = await Treatment.find({ patients: patient._id }).populate('doctor', 'name email');

  let dueMedications = [];

  treatments.forEach(treatment => {
    treatment.medications.forEach(med => {
      if (med.startDate <= today && (!med.endDate || med.endDate >= today)) {
        // Determinar si el medicamento está programado para hoy según su frecuencia
        const frequency = med.frequency;
        let isDue = false;

        switch (frequency) {
          case 'Diaria':
            isDue = true;
            break;
          case 'Semanal':
            // Verificar si hoy es el mismo día de la semana que la fecha de inicio
            if (today.getDay() === new Date(med.startDate).getDay()) {
              isDue = true;
            }
            break;
          case 'Mensual':
            // Verificar si hoy es el mismo día del mes que la fecha de inicio
            if (today.getDate() === new Date(med.startDate).getDate()) {
              isDue = true;
            }
            break;
          default:
            break;
        }

        if (isDue) {
          dueMedications.push(med);
        }
      }
    });
  });

  res.status(200).json(dueMedications);
});

export { assignActivityToPatient, updateAssignmentResults, 
  getAssignedActivities,unassignActivityFromPatient,getMyAssignedActivities, 
  createTreatment, getMyTreatments, 
  getTreatmentById, updateTreatment, getMyMedications, getDueMedications};