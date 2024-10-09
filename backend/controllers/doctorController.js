import asyncHandler from "express-async-handler";
import Doctor from "../models/doctorModel.js";

// @desc    Obtener todos los doctores
// @route   GET /api/doctors
// @access  Privado/Admin
const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({}).populate("user", "name email");
  res.json(doctors);
});

export { getDoctors };
