import asyncHandler from "express-async-handler";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/patientModel.js";

// @desc    Obtener todos los doctores
// @route   GET /api/doctors
// @access  Privado/Admin
const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({}).populate("user", "name email");
  res.json(doctors);
});


const getDoctorWithPatients = asyncHandler(async (req, res) => {
  console.log("ID de usuario autenticado (doctor):", req.user._id);

  // Encuentra al doctor basado en el usuario logueado
  const doctor = await Doctor.findOne({ user: req.user._id });

  if (doctor) {
    console.log("Doctor encontrado:", doctor);

    // Encuentra todos los pacientes que tienen asignado este doctor, excluyendo al doctor mismo
    const patients = await Patient.find({
      doctor: doctor._id,
      user: { $ne: req.user._id }, // Excluir al doctor logueado
    }).populate("user", "name lastName email phoneNumber cardId isActive");

    console.log("Pacientes encontrados:", patients);

    // Mapea los pacientes para incluir tanto 'user' como 'idPaciente'
    const patientsWithId = patients.map((patient) => ({
      _id: patient._id,
      idPaciente: patient.idPaciente, // Asegúrate de que 'idPaciente' es un campo en tu modelo
      user: patient.user,
    }));

    res.json(patientsWithId); // Enviamos la lista de pacientes con 'idPaciente'
  } else {
    console.log("Doctor no encontrado o sin pacientes asignados");
    res.status(404).json({ message: "Doctor no encontrado o no tiene pacientes asignados" });
  }
});


const addPatientToDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { patientId } = req.body;

  // Obtener el paciente
  const patient = await Patient.findById(patientId);
  if (!patient) {
    res.status(404);
    throw new Error("Paciente no encontrado");
  }

  // Verificar si el paciente ya tiene un doctor asignado
  if (patient.doctor && patient.doctor.toString() !== doctorId) {
    // Encontrar al doctor anterior y remover al paciente de su lista
    const previousDoctor = await Doctor.findById(patient.doctor);
    if (previousDoctor) {
      previousDoctor.patients = previousDoctor.patients.filter(
        (p) => p.toString() !== patientId
      );
      await previousDoctor.save();
    }
  }

  // Asignar el nuevo doctor al paciente
  patient.doctor = doctorId;
  await patient.save();

  // Añadir el paciente al nuevo doctor
  const newDoctor = await Doctor.findById(doctorId);
  if (!newDoctor) {
    res.status(404);
    throw new Error("Doctor no encontrado");
  }

  if (!newDoctor.patients.includes(patientId)) {
    newDoctor.patients.push(patientId);
    await newDoctor.save();
  }

  res.status(200).json({ message: "Paciente reasignado al doctor correctamente" });
});


export { getDoctors, getDoctorWithPatients, addPatientToDoctor };
