// src/routes/treatmentRoutes.js

import express from 'express';
import {
  createTreatment,
  getMyTreatments,
  getTreatmentById,
  updateTreatment,
  getMyMedications,
  getDueMedications,
  getTreatmentsByPatient
} from '../controllers/treatmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();


// Ruta para obtener medicamentos del paciente
router.route('/my-medications').get(protect, getMyMedications);

// Ruta para obtener medicamentos debido
router.route('/due-medications').get(protect, getDueMedications);

// Ruta para obtener tratamientos del médico
router.route('/mytreatments').get(protect, getMyTreatments);

// Ruta para crear un nuevo tratamiento
router.route('/create').post(protect, admin, createTreatment);


// Ruta para obtener detalles de un tratamiento específico
router
  .route('/:treatmentId')
  .get(protect, getTreatmentById)
  .put(protect, admin, updateTreatment);

router.route('/patient/:patientId').get(protect, admin, getTreatmentsByPatient);


export default router;
