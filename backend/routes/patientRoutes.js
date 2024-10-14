import express from "express";
import {
  getPatients,
  getPatientById,
} from "../controllers/patientController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ruta para obtener todos los pacientes
router.get("/", protect, admin, getPatients);

// Ruta para obtener un paciente por ID
router.get("/:id", protect, admin, getPatientById);

export default router;
