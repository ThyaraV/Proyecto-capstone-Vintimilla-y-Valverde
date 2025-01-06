// src/routes/treatmentRoutes.js

import express from 'express';
import {
  createTreatment,
  getMyTreatments,
  getTreatmentById,
  updateTreatment,
  getMyMedications,
  getDueMedications,
  getTreatmentsByPatient,
  recordActivity,
  getCompletedActivities,
  getAssignedActivities,
  getActivitiesByUser,
  getActiveTreatment, toggleActivateTreatment,
  getCompletedActivitiesByTreatment,
  takeMedication,
  getTreatmentsByPatient2,
  getTreatmentsByMultiplePatients
} from '../controllers/treatmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();


// Ruta para obtener medicamentos del paciente
router.route('/my-medications').get(protect, getMyMedications);

// Ruta para obtener medicamentos debido
router.route('/due-medications').get(protect, getDueMedications);

router.route('/:treatmentId/medications/:medicationId/take').patch(protect, takeMedication);


// Ruta para obtener tratamientos del médico
router.route('/mytreatments').get(protect, getMyTreatments);

// Ruta para crear un nuevo tratamiento
router.route('/create').post(protect, admin, createTreatment);


router.route('/:treatmentId/activities')
  .post(protect, recordActivity) // Solo pacientes pueden registrar actividades
  .get(protect, getCompletedActivities); // Solo pacientes pueden ver sus actividades

router.route('/:treatmentId/completedActivities').get(protect, getCompletedActivitiesByTreatment);



router.route('/patient/:patientId/treatments').get(protect, admin, getTreatmentsByPatient);
router.get('/patient/:patientId/treatments2', protect, getTreatmentsByPatient2);
router.post('/patients/treatments', protect, getTreatmentsByMultiplePatients);

router.route('/:treatmentId/assignedActivities').get(protect, getAssignedActivities);


router.route('/activities').get(protect, getActivitiesByUser);

router.route('/:treatmentId/activate').patch(protect, toggleActivateTreatment);

router.route('/:userId/active-treatment').get(protect, getActiveTreatment);

// Ruta para obtener detalles de un tratamiento específico
router
  .route('/:treatmentId')
  .get(protect, getTreatmentById)
  .put(protect, admin, updateTreatment);





export default router;
