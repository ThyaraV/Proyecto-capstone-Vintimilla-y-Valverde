import express from "express";
import {
  getPatients,
  getPatientById,
  updatePatient
} from "../controllers/patientController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ruta para obtener todos los pacientes
router.get("/", protect, admin, getPatients);

// Ruta para obtener un paciente por ID
router.get("/:id", protect, admin, getPatientById);

// Ruta para actualizar un paciente por ID
router.put("/:id", protect, admin, updatePatient);

export default router;
