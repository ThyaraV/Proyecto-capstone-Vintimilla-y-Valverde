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

// controllers/patientController.js

// @desc Actualizar un paciente
// @route PUT /api/patients/:id
// @access Private/Admin
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (patient) {
    // Actualizar los campos según lo recibido en el cuerpo de la solicitud
    patient.school = req.body.school || patient.school;
    patient.birthdate = req.body.birthdate || patient.birthdate;
    patient.gender = req.body.gender || patient.gender;
    patient.educationalLevel = req.body.educationalLevel || patient.educationalLevel;
    patient.familyRepresentative = req.body.familyRepresentative || patient.familyRepresentative;
    patient.address = req.body.address || patient.address;
    patient.maritalStatus = req.body.maritalStatus || patient.maritalStatus;
    patient.profession = req.body.profession || patient.profession;
    patient.cognitiveStage = req.body.cognitiveStage || patient.cognitiveStage;
    patient.referredTo = req.body.referredTo || patient.referredTo;
    patient.doctor = req.body.doctor || patient.doctor;

    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } else {
    res.status(404);
    throw new Error("Paciente no encontrado");
  }
});

export { getPatients, getPatientById, updatePatient };


