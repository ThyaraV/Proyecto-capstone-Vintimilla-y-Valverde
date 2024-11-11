import express from 'express';
import {
  assignActivityToPatient,
  updateAssignmentResults,
  getAssignedActivities,
  unassignActivityFromPatient,
  getMyAssignedActivities,
  createTreatment, // Importamos el nuevo controlador
} from '../controllers/treatmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para crear un nuevo tratamiento
router.route('/create').post(protect, admin, createTreatment);

// Rutas existentes
router.route('/').post(protect, assignActivityToPatient);
router.route('/:assignmentId/results').put(protect, admin, updateAssignmentResults);
router.route('/:assignmentId').delete(protect, admin, unassignActivityFromPatient);
router.route('/:patientId/activities').get(protect, admin, getAssignedActivities);
router.route('/myactivities').get(protect, getMyAssignedActivities);

export default router;
