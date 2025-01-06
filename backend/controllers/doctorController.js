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

  const doctor = await Doctor.findById(doctorId);

  if (doctor) {
    // Evitar duplicados en el arreglo de pacientes
    if (!doctor.patients.includes(patientId)) {
      doctor.patients.push(patientId);
      await doctor.save();
      res.status(200).json({ message: "Paciente añadido al doctor correctamente" });
    } else {
      res.status(400).json({ message: "El paciente ya está asignado a este doctor" });
    }
  } else {
    res.status(404);
    throw new Error("Doctor no encontrado");
  }
});

export { getDoctors, getDoctorWithPatients, addPatientToDoctor };
