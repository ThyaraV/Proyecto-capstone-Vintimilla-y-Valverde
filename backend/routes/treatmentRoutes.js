import express from 'express';
import {
  assignActivityToPatient,
  updateAssignmentResults,
  getAssignedActivities,
  unassignActivityFromPatient,
  getMyAssignedActivities,
  createTreatment,
  getMyTreatments,
  getTreatmentById,
  updateTreatment,
  getMyMedications
} from '../controllers/treatmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para crear un nuevo tratamiento
router.route('/create').post(protect, admin, createTreatment);
// Ruta para obtener tratamientos del médico
router.route('/mytreatments').get(protect, admin, getMyTreatments);

// Ruta para obtener detalles de un tratamiento específico
router
  .route('/:treatmentId')
  .get(protect, admin, getTreatmentById)
  .put(protect, admin, updateTreatment); // Agregamos el método PUT

router.route('/my-medications').get(protect, getMyMedications);

// Rutas existentes
router.route('/').post(protect, assignActivityToPatient);
router.route('/:assignmentId/results').put(protect, admin, updateAssignmentResults);
router.route('/:assignmentId').delete(protect, admin, unassignActivityFromPatient);
router.route('/:patientId/activities').get(protect, admin, getAssignedActivities);
router.route('/myactivities').get(protect, getMyAssignedActivities);

export default router;
