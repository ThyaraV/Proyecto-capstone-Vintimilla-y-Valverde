import asyncHandler from "express-async-handler";
import Patient from "../models/patientModel.js";

// @desc Obtener todos los pacientes
// @route GET /api/patients
// @access Private/Admin
const getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({})
    .populate("user", "name") // Asegúrate de que estás populando el campo 'user' y específicamente el 'name'
    .populate("doctor", "user"); // Popula el doctor relacionado con el paciente
  res.json(patients);
});

// @desc Obtener un paciente por ID
// @route GET /api/patients/:id
// @access Private/Admin
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate("user", "name") // Popula el campo 'user' y específicamente el 'name'
    .populate("doctor", "user");

  if (patient) {
    res.json(patient);
  } else {
    res.status(404);
    throw new Error("Paciente no encontrado");
  }
});

export { getPatients, getPatientById };
